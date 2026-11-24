# Release environment checklist

This checklist applies to `fix/security-checkout-audit`. Do not merge or deploy production until the owner approves the release.

## Environment separation

| Setting | Production | Preview / staging |
| --- | --- | --- |
| Vercel `BACKEND_URL` | Explicit HTTPS production API origin, no `/api` suffix | Explicit HTTPS staging API origin; never the production API |
| Render `NODE_ENV` | `production` | `production` for production-like checks |
| Render `CLIENT_URL` | Exact production storefront HTTPS origin | Exact approved staging storefront HTTPS origin |
| Render `MONGODB_URI` | Production database | Separate disposable staging database |
| Render `JWT_SECRET` | Strong unique secret | Different strong unique secret |
| Stripe credentials | Unset for demo-only checkout | Unset for demo-only checkout |
| Node runtime | Confirm Node 24 | Node 24, matching branch CI |

Do not commit real environment values. Only public client configuration may be exposed through Vite's `VITE_` variables. Use hosting-provider secret settings for server credentials. No production database or payment credentials should be copied into staging.

## CI staging rehearsal

The branch workflow builds the production frontend and runs the real checkout browser suite against a loopback-only Express backend with a disposable MongoDB replica set. Run `npm exec --workspace=frontend -- playwright test --config=playwright.staging.config.js` after dependency and Chromium installation. This is an isolated rehearsal, not a hosted staging deployment. A remote staging API and dedicated database are still required before the hosted smoke check.

## Before staging

- Verify the Vercel project is the correct Merbolo project, not another storefront or portfolio.
- Confirm Preview has a separate `BACKEND_URL`; missing or invalid config intentionally returns 503 instead of selecting a live backend.
- Confirm Render service branch and auto-deploy rules before creating or updating a staging service.
- Confirm database connection permissions, isolation, replica-set support for checkout transactions and backup policy.
- Confirm staging uses a disposable database populated only with fixtures.

## Before production release

- Confirm all required secrets are present without displaying values and production origins match exactly.
- Confirm the intended Render runtime, and configure the HTTP readiness check at `/api/ready`. The liveness check `/api/health` remains independent.
- Confirm the Vercel production backend origin is an HTTPS origin with no path, query, or credentials.
- Confirm the deployment source, environment, domain and rollback target.
- Review production dependency advisories, CI and browser test results.
- Check the demo-only payment disclosure and do not activate Stripe live payments.
- Obtain explicit release approval. Do not merge main or promote a preview as part of merely completing this checklist.

## After an approved deployment

Use non-mutating health/readiness checks first. Perform purchase-flow smoke checks only against isolated staging fixtures; never submit real customer payment or order data in production testing. If readiness or smoke verification fails, stop the release and investigate before promotion.

Official references: [Render health checks](https://render.com/docs/health-checks), [Render Node version](https://render.com/docs/node-version), [Vercel environment variables](https://vercel.com/docs/environment-variables).
