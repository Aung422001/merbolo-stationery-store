# Product Requirements Document — MerboloEbook

## 1. Overview

**MerboloEbook** is an online stationery shop. Customers browse products by category (notebooks, pens & pencils, art supplies, paper, office & school supplies), add items to a cart, and check out with card payment. Admins manage the product catalog and fulfil orders through a protected dashboard.

This is a portfolio-grade full-stack build: realistic enough to demonstrate CRUD, auth, payments, and an admin panel to a hiring manager, scoped small enough for one developer to finish.

## 2. Goals

- Ship a working storefront + checkout + admin panel, deployed and demoable.
- Practice the skills junior full-stack roles screen for: REST API design, auth, state management, third-party payment integration, and a protected admin surface.
- Keep the codebase clean enough to walk through in an interview.

## 3. Non-goals (v1)

- Multi-vendor / marketplace features
- Native mobile app
- Product variants (size/color) — flagged as a v2 stretch goal
- Multi-currency — THB only for v1
- Local Thai payment rails (PromptPay/Omise) — Stripe test mode only for v1, swappable later

## 4. Target users

- **Shopper** — browses and buys stationery. No account required to browse; account required to check out.
- **Admin (shop owner)** — manages products, categories, and order fulfilment. Single admin role for v1 (no staff permission tiers).

## 5. Core features (MVP)

### 5.1 Storefront
- Home page: hero banner, featured products, category shortcuts
- Category / shop listing page: grid of products, filter by category and price range, search by name, sort (price, newest)
- Product detail page: images, description, price, stock status, add-to-cart

### 5.2 Cart
- Add / update quantity / remove items
- Cart persists across page reloads (localStorage for guests; merged into account on login)
- Cart totals: subtotal, shipping estimate, total

### 5.3 Auth
- Register / login / logout (email + password, JWT-based sessions)
- Passwords hashed, never stored or logged in plaintext

### 5.4 Checkout
- Shipping address form
- Order summary
- Stripe Checkout (test mode) for payment
- Order confirmation page + order record created on successful payment

### 5.5 Customer account
- Order history with status
- Saved shipping address(es)

### 5.6 Admin dashboard (role-gated)
- Product CRUD (create, edit, delete, list, toggle active/featured)
- Category CRUD
- Order list with status filter, update order status (processing → shipped → delivered)
- Basic counts: total orders, revenue this month, low-stock products

## 6. User stories (representative)

- As a shopper, I can search for "notebook" and filter to under ฿200 so I can find something in my budget.
- As a shopper, I can see if an item is out of stock before I try to buy it.
- As a shopper, I can pay by card and get an order confirmation with an order number.
- As a returning customer, I can see my past orders and their delivery status.
- As the admin, I can add a new product with photos, price, and stock count in under two minutes.
- As the admin, I can mark an order "shipped" and the customer sees the updated status.

## 7. Non-functional requirements

- Mobile-first responsive layout (majority-mobile traffic assumption)
- API input validation on every write endpoint (never trust client input)
- No secrets committed to git — all config via `.env` (see `.env.example`)
- Reasonable performance: paginated product lists, indexed MongoDB queries on search/filter fields
- Basic hardening: helmet, CORS restricted to the frontend origin, rate limiting on auth routes

## 8. Success metrics (portfolio context)

- Deployed, publicly reachable URL with seeded demo data
- A full checkout can be completed end-to-end in Stripe test mode without errors
- Admin can complete the product-add → order-fulfilled loop without touching the database directly
- Codebase is clean enough to explain any file in an interview in under two minutes

## 9. Stretch goals (v2, not blocking v1 launch)

- Product reviews & star ratings
- Wishlist
- Discount / coupon codes
- Transactional email (order confirmation, password reset)
- TypeScript migration
- Expanded automated test coverage (Vitest/Jest)
- PromptPay / Omise payment option
- Thai-language UI toggle
