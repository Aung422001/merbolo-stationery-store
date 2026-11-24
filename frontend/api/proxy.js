// Vercel serverless function: forwards /api/* requests from the storefront to the Express backend.
// The browser only ever talks to its own origin, so CORS and cross-site network errors can't happen,
// and when the backend is down or misconfigured the user gets a specific error instead of "Network Error".
//
// Each deployed environment must explicitly configure its own BACKEND_URL.

// Free-tier Render services can take ~50s to wake up; stay under the function's maxDuration (vercel.json)
const UPSTREAM_TIMEOUT_MS = 55000;

// Hop-by-hop and platform headers that must not be forwarded
const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'forwarded']);
const SKIP_RESPONSE_HEADERS = new Set(['connection', 'content-length', 'content-encoding', 'transfer-encoding', 'keep-alive']);

export const resolveBackendOrigin = (env = process.env) => {
  const raw = env.BACKEND_URL;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
};

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

export default async function handler(req, res) {
  const backendOrigin = resolveBackendOrigin();
  if (!backendOrigin) return sendJson(res, 503, 'The shop backend is not configured for this environment.');
  const target = `${backendOrigin}${buildUpstreamPath(req.url)}`;

  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (!SKIP_REQUEST_HEADERS.has(name) && !name.startsWith('x-vercel-')) headers[name] = value;
  }

  let upstream;
  try {
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
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
    return sendJson(
      res,
      timedOut ? 504 : 502,
      timedOut
        ? 'The server is taking too long to respond (it may be waking up). Please try again in a minute.'
        : 'Cannot connect to the backend server. Please try again later.'
    );
  }

  // Render answers with this header when no service exists at the address
  if (upstream.status === 404 && (upstream.headers.get('x-render-routing') || '').includes('no-server')) {
    console.error(`[proxy] No Render service at ${backendOrigin} — set BACKEND_URL in Vercel`);
    return sendJson(res, 502, 'The configured backend server is unavailable. Please try again later.');
  }

  const contentType = upstream.headers.get('content-type') || '';
  if (upstream.status >= 500 && !contentType.includes('application/json')) {
    console.error(`[proxy] ${target} returned ${upstream.status} (${contentType})`);
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
