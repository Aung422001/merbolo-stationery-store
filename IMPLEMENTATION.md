# Implementation Plan — MerboloEbook

How to actually build this in Antigravity, in order. Each phase is small enough to be one or two agent tasks — don't ask the agent to build everything in one shot.

## Phase 0 — Scaffold
- Root `package.json` with npm workspaces (`frontend`, `backend`)
- `backend/` — Express app boots, connects to MongoDB, `GET /api/health` returns 200
- `frontend/` — Vite + React boots, Tailwind configured, renders a placeholder home page
- Confirm both run together via `npm run dev` from the root

## Phase 1 — Backend foundation
- `User`, `Category`, `Product` models
- Auth: register/login/me, JWT issuing + `auth.js`/`admin.js` middleware
- `errorHandler.js` and `validate.js` wired into `app.js`
- Seed script with sample categories + products

## Phase 2 — Product & category CRUD
- Product + category routes/controllers (public read, admin write) per `BACKEND.md`
- Admin frontend: `AdminProducts`, `AdminProductForm`, `AdminCategories`, gated by `ProtectedRoute requireAdmin`

## Phase 3 — Public storefront
- `Shop` page: product grid, category filter, price filter, search, pagination
- `ProductDetail` page
- `Home` page: featured products pulled from `isFeatured` products

## Phase 4 — Cart
- `cartStore` (Zustand) with localStorage persistence
- `Cart` page, `CartItem`, `CartSummary`
- Cart badge in `Navbar` showing item count

## Phase 5 — Checkout & payments
- `Order` model, `POST /api/orders`
- Stripe: `create-intent` endpoint, `Checkout` page collecting shipping address then confirming payment
- Stripe webhook marks order `paid`, redirect to `OrderConfirmation`
- On login, merge guest cart into server cart (see `FRONTEND.md` §4)

## Phase 6 — Account & order management
- `Account` page: order history (`GET /api/orders`), saved addresses
- `AdminOrders`: list, filter by status, update status

## Phase 7 — Polish
- Responsive pass on every page (mobile-first breakpoints)
- Loading/empty/error states everywhere data is fetched
- `helmet`, `cors` (restricted to `CLIENT_URL`), rate limiting on `/api/auth`
- README setup instructions verified by running the project from a clean clone

## Phase 8 — Deploy (stretch, once v1 is stable)
- Backend → Render/Railway, MongoDB → Atlas
- Frontend → Vercel/Netlify
- Set production env vars, point `VITE_API_URL` at the deployed backend, update the Stripe webhook URL

## Working with the Antigravity agent

- Point it at `PRD.md` + this file + `BACKEND.md`/`FRONTEND.md` before asking for code — don't make it guess the spec.
- Work phase by phase. Reviewing a 200-line diff is realistic; reviewing a 2,000-line diff is not.
- Let it plan before it writes code (Antigravity does this by default — don't skip the plan step).
- If it wants to add a library not listed in `BACKEND.md`/`FRONTEND.md`, that's a signal to stop and decide deliberately, not a bug to work around.

## Architecture at a glance

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐        Mongoose        ┌───────────┐
│   Frontend   │  ────────────────────▶  │   Backend    │  ────────────────────▶ │  MongoDB  │
│ React + Vite │  ◀────────────────────  │ Express API  │  ◀──────────────────── │           │
└─────────────┘                          └──────┬───────┘                        └───────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │    Stripe    │
                                          │  (payments)  │
                                          └──────────────┘
```
