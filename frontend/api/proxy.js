// Vercel serverless function: forwards /api/* requests from the storefront to the Express backend.
// The browser only ever talks to its own origin, so CORS and cross-site network errors can't happen,
// and when the backend is down or misconfigured the user gets a specific error instead of "Network Error".
//
// The backend address is read at request time (no rebuild needed) from BACKEND_URL, falling back to VITE_API_URL.
// If the configured address has no server behind it, the known Render backend is tried before giving up.

const DEFAULT_BACKEND_ORIGIN = 'https://merbolo-stationery-store.onrender.com';

// Free-tier Render services can take ~50s to wake up; stay under the function's maxDuration (vercel.json)
const UPSTREAM_TIMEOUT_MS = 55000;

// Hop-by-hop and platform headers that must not be forwarded
const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'forwarded']);
const SKIP_RESPONSE_HEADERS = new Set(['connection', 'content-length', 'content-encoding', 'transfer-encoding', 'keep-alive']);

const parseOrigin = (raw) => {
  if (!raw) return null;
  let value = String(raw).trim().replace(/^['"]+|['"]+$/g, '').trim();
  if (!value || value.startsWith('/') || value.includes('localhost')) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    return new URL(value).origin;
  } catch {
    // Not a usable URL (e.g. a leftover "<your-backend>" placeholder)
    return null;
  }
};

// Candidate backends in order of preference, always ending with the known deployed backend
export const resolveBackendOrigins = (env = process.env) => {
  const origins = [env.BACKEND_URL, env.VITE_API_URL].map(parseOrigin).filter(Boolean);
  return [...new Set([...origins, DEFAULT_BACKEND_ORIGIN])];
};

export const resolveBackendOrigin = (env = process.env) => resolveBackendOrigins(env)[0];

// Works whether the platform hands us the rewritten URL (/api/proxy?path=auth/register&x=1)
// or the original one (/api/auth/register?x=1)
export const buildUpstreamPath = (reqUrl) => {
  const url = new URL(reqUrl, 'http://localhost');
  const pathParam = url.searchParams.get('path');
  let pathname = url.pathname;
  if (pathParam !== null) {
    url.searchParams.delete('path');
    pathname = `/api/${pathParam.replace(/^\/+/, '')}`;
  }
  const query = url.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ''}`;
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return chunks.length ? Buffer.concat(chunks) : undefined;
};

const sendJson = (res, status, message) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ success: false, message, errors: [] }));
};

// Render answers with this header when no service exists at the address
const isMissingRenderService = (response) =>
  response.status === 404 && (response.headers.get('x-render-routing') || '').includes('no-server');

export default async function handler(req, res) {
  const origins = resolveBackendOrigins();
  const upstreamPath = buildUpstreamPath(req.url);

  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (!SKIP_REQUEST_HEADERS.has(name) && !name.startsWith('x-vercel-')) headers[name] = value;
  }

  let body;
  try {
    body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
  } catch (error) {
    console.error('[proxy] Could not read request body:', error.message);
    return sendJson(res, 400, 'The request could not be read. Please try again.');
  }

  let upstream;
  let backendOrigin;
  for (const [index, origin] of origins.entries()) {
    backendOrigin = origin;
    const target = `${origin}${upstreamPath}`;
    const isLast = index === origins.length - 1;
    try {
      upstream = await fetch(target, {
        method: req.method,
        headers,
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
      });
    } catch (error) {
      const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
      console.error(`[proxy] ${req.method} ${target} failed:`, error.cause?.code || error.cause?.message || error.message);
      // A timeout means a server exists but is slow; don't replay the request against another backend
      if (!timedOut && !isLast) continue;
      return sendJson(
        res,
        timedOut ? 504 : 502,
        timedOut
          ? 'The server is taking too long to respond (it may be waking up). Please try again in a minute.'
          : `Cannot connect to the backend server (${origin}). Please try again later.`
      );
    }

    if (!isMissingRenderService(upstream)) break;
    console.error(`[proxy] No Render service at ${origin} — update BACKEND_URL in Vercel`);
    if (isLast) {
      return sendJson(res, 502, `No backend server was found at ${origin}. The site's BACKEND_URL setting needs to be updated.`);
    }
  }

  const contentType = upstream.headers.get('content-type') || '';
  if (upstream.status >= 500 && !contentType.includes('application/json')) {
    console.error(`[proxy] ${backendOrigin}${upstreamPath} returned ${upstream.status} (${contentType})`);
    return sendJson(res, 502, `The backend server is unavailable right now (status ${upstream.status}). Please try again later.`);
  }

  res.statusCode = upstream.status;
  upstream.headers.forEach((value, name) => {
    if (!SKIP_RESPONSE_HEADERS.has(name) && name !== 'set-cookie') res.setHeader(name, value);
  });
  const setCookies = upstream.headers.getSetCookie?.() || [];
  if (setCookies.length) res.setHeader('set-cookie', setCookies);
  res.end(Buffer.from(await upstream.arrayBuffer()));
}
