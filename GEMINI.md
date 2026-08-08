# MerboloEbook — Agent Rules

## What this project is
An online stationery shop ("MerboloEbook"): React/Vite storefront + Express/MongoDB API, JWT auth, Stripe checkout, admin dashboard. Full spec lives in `PRD.md`, `BACKEND.md`, `FRONTEND.md`, `IMPLEMENTATION.md` — read the relevant one before generating code for that area, don't guess the shape of a model or route.

## Stack — do not substitute without asking
- Backend: Node.js, Express, MongoDB via Mongoose, JWT (jsonwebtoken) + bcrypt, express-validator, Stripe, helmet/cors/express-rate-limit
- Frontend: React + Vite, React Router v6, Tailwind CSS, Zustand, Axios
- Plain JavaScript everywhere (JSX on the frontend). No TypeScript, no alternate state libraries (Redux, Context-as-global-store), no alternate CSS approach (styled-components, CSS modules) unless explicitly asked.

## Always
- Plan before coding. Show the plan, then implement in the smallest reviewable increment.
- Follow the folder structures in `BACKEND.md` / `FRONTEND.md` exactly — don't invent new top-level folders.
- Validate every write endpoint server-side (express-validator), even if the frontend also validates.
- Hash passwords with bcrypt; never log or return `passwordHash`.
- Read config from `process.env` / `import.meta.env`, never hardcode secrets, URLs, or API keys in source.
- Snapshot product `name`/`price` onto order line items at order-creation time (see `BACKEND.md` §3 Order model) — don't rely on a live join back to the product.
- Use the shared API response envelope (`{ success, data }` / `{ success, message, errors }`) on every endpoint.
- Format currency as Thai Baht (฿) via `formatCurrency.js` on the frontend — never render a raw number as a price.
- Add a loading state and an empty state to any page that fetches data.

## Never
- Never commit `.env` or print secret values in chat, comments, or seed data.
- Never add a new npm dependency that isn't in `BACKEND.md`/`FRONTEND.md` without flagging it first and explaining why.
- Never build a feature that isn't in `PRD.md`'s MVP scope (§5) without confirming first — check the stretch-goals list (§9) before assuming something's out of scope.
- Never remove or weaken `auth.js`/`admin.js` middleware to "make a route work" — fix the actual auth bug instead.
- Never generate a single file that mixes route + controller + model logic — keep the layers separated per `BACKEND.md`'s folder structure.

## Conventions
- ES modules (`import`/`export`), `async/await` (no raw `.then` chains).
- Controllers stay thin-ish but DB queries belong in the model/controller, not scattered into route files.
- React: function components + hooks only. No class components.
- One component per file, default export matching the filename.
- Commit messages: `type(scope): summary` (e.g. `feat(cart): add quantity update endpoint`).

## When something's ambiguous
Stop and ask, or note the assumption explicitly in the plan — don't silently invent scope, especially around payments, auth, or anything that touches money or user data.
