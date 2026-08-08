---
name: cart-checkout
description: Guides implementing or modifying the shopping cart, checkout flow, and Stripe payment integration for MerboloEbook. Use when working on cart state, the Cart or Checkout pages, order creation, or Stripe PaymentIntent/webhook handling.
---

# Cart & Checkout Skill

## Scope
`cartStore` (Zustand), `Cart`/`Checkout`/`OrderConfirmation` pages, the `Order` model, and the payment routes/controllers.

## Cart conventions
- Guests get a cart in `localStorage` via `cartStore`; there is no guest cart on the server.
- On login, walk the local cart items and `POST` each to `/api/cart/items` to merge into the server-side cart, then clear local storage — don't just overwrite one with the other silently if both have items (sum quantities for matching products).
- `cartStore` actions are the only place that mutate cart state — pages call actions, they don't reach into the store's internals directly.
- Cart totals (`subtotal`, `itemCount`) are computed from `items`, never stored as separate state that can drift out of sync.

## Checkout flow (in order)
1. `Checkout` page collects/confirms shipping address (pull from saved addresses if the user has one, else a form).
2. `POST /api/orders` creates an `Order` with `paymentStatus: 'pending'`, snapshotting `name`/`price` from each cart item onto the order's line items.
3. `POST /api/payment/create-intent` creates a Stripe PaymentIntent for the order total, returns `client_secret`.
4. Frontend confirms payment with Stripe using the `client_secret`.
5. Stripe webhook (`POST /api/payment/webhook`) is the source of truth for marking an order `paid` — never mark an order paid directly from the frontend confirmation callback alone, the webhook is what actually confirms the charge succeeded.
6. On confirmed payment, redirect to `OrderConfirmation`, clear the cart.

## Never
- Never trust a client-reported "payment succeeded" without the webhook confirming it server-side.
- Never recompute the order total from the cart at webhook time — charge and confirm against the amount recorded on the `Order` at creation time.
