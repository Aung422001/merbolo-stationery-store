# Frontend Specification — MerboloEbook

React + Vite SPA. Plain JavaScript (JSX, no TypeScript) to match the backend and keep AI-agent codegen friction low.

## 1. Stack

| Concern | Choice |
|---|---|
| Build tool | Vite |
| UI library | React 18 |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Global state | Zustand |
| HTTP client | Axios |
| Icons | lucide-react |
| Forms | plain controlled components (react-hook-form optional if forms get complex) |

## 2. Folder structure

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx                # router setup
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Account.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProducts.jsx
│   │       ├── AdminProductForm.jsx
│   │       ├── AdminCategories.jsx
│   │       └── AdminOrders.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── product/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   └── ProductFilters.jsx
│   │   ├── cart/
│   │   │   ├── CartItem.jsx
│   │   │   └── CartSummary.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Spinner.jsx
│   │       ├── EmptyState.jsx
│   │       └── ProtectedRoute.jsx   # redirects if not authed / not admin
│   ├── store/
│   │   ├── authStore.js        # user, token, login, logout, hydrate from storage
│   │   └── cartStore.js        # items, add/update/remove, totals, persist
│   ├── api/
│   │   ├── client.js           # axios instance, base URL, auth header interceptor
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── payment.js
│   ├── hooks/
│   │   └── useDebounce.js      # for search input
│   └── utils/
│       └── formatCurrency.js   # THB formatting helper
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## 3. Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home | public |
| `/shop` | Shop (listing + filters) | public |
| `/product/:slug` | ProductDetail | public |
| `/cart` | Cart | public (guest cart allowed) |
| `/checkout` | Checkout | protected |
| `/order-confirmation/:orderId` | OrderConfirmation | protected |
| `/login`, `/register` | Login, Register | public (redirect if already authed) |
| `/account` | Account (order history, profile) | protected |
| `/admin` | AdminDashboard | admin only |
| `/admin/products`, `/admin/products/:id` | AdminProducts, AdminProductForm | admin only |
| `/admin/categories` | AdminCategories | admin only |
| `/admin/orders` | AdminOrders | admin only |

Gate protected/admin routes with a shared `<ProtectedRoute requireAdmin>` wrapper component, not duplicated checks in every page.

## 4. State management

**`authStore` (Zustand)**
- state: `user`, `token`, `isAuthenticated`
- actions: `login(credentials)`, `register(data)`, `logout()`, `hydrate()` (reads persisted token on app load)
- persist `token` to localStorage; refetch `/api/auth/me` on hydrate to confirm it's still valid

**`cartStore` (Zustand)**
- state: `items` (`{ productId, name, price, image, quantity }[]`)
- actions: `addItem`, `updateQuantity`, `removeItem`, `clearCart`
- derived: `subtotal`, `itemCount` (computed via selectors, not stored)
- persist to localStorage for guests; on login, merge local cart into the server-side cart via `POST /api/cart/items` for each item, then clear local

Keep server calls and local state changes in the store actions themselves (not scattered in components) so any page can call `useCartStore.getState().addItem(...)` and get consistent behavior.

## 5. API layer

`api/client.js` exports a single configured Axios instance (`baseURL` from `VITE_API_URL`, request interceptor attaching `Authorization: Bearer <token>` from `authStore`, response interceptor normalizing error messages). Every other file in `api/` is a thin set of functions (`getProducts(params)`, `createOrder(payload)`, etc.) that call this instance — no raw `fetch`/`axios` calls inside components or pages.

## 6. Design direction

- Mobile-first, clean and light — this is a stationery shop, not a tech product, so a warmer/softer visual tone than a typical SaaS dashboard is appropriate for the storefront (the admin panel can be plainer/utilitarian).
- Product grid: 2 columns on mobile, 3–4 on desktop.
- Prices always formatted via `formatCurrency.js` (THB, e.g. `฿1,290`).
- Loading states: skeleton or spinner on every async page, never a blank screen.
- Empty states: explicit message + action (e.g., empty cart → "Your cart is empty" + "Browse products" link).

## 7. Environment variables (frontend)

Vite only exposes vars prefixed `VITE_`:
- `VITE_API_URL` — backend base URL, e.g. `http://localhost:5000/api`
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key for Checkout
