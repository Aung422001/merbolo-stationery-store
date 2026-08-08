# Backend Specification — MerboloEbook API

Node.js + Express + MongoDB (Mongoose) REST API. Plain JavaScript (ES modules), no TypeScript, to keep AI-agent codegen friction low.

## 1. Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Database | MongoDB (Atlas or local), via Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | express-validator |
| Payments | Stripe (test mode) |
| Security | helmet, cors, express-rate-limit |
| Env config | dotenv |

## 2. Folder structure

```
backend/
├── src/
│   ├── server.js            # entrypoint, starts HTTP server
│   ├── app.js                # express app, middleware wiring
│   ├── config/
│   │   └── db.js             # mongoose connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js           # verifies JWT, attaches req.user
│   │   ├── admin.js          # requires req.user.role === 'admin'
│   │   ├── errorHandler.js   # centralized error -> JSON response
│   │   └── validate.js       # runs express-validator, formats errors
│   ├── utils/
│   │   └── generateToken.js
│   └── seed/
│       └── seedData.js       # sample categories + products for demo
├── .env                       # not committed
└── package.json
```

## 3. Data models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| passwordHash | String | required, bcrypt hash |
| role | String | enum: `customer`, `admin`, default `customer` |
| addresses | [AddressSchema] | embedded subdocs |
| createdAt / updatedAt | Date | timestamps |

`AddressSchema`: `label`, `line1`, `line2`, `city`, `province`, `postalCode`, `country` (default `TH`), `isDefault`.

### Category
`name`, `slug` (unique, indexed), `description`, `image`, `createdAt`.

### Product
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| slug | String | unique, indexed |
| description | String | |
| price | Number | THB, required |
| compareAtPrice | Number | optional, for showing a discount |
| category | ObjectId ref Category | required |
| images | [String] | URLs |
| stock | Number | default 0 |
| sku | String | unique |
| isFeatured | Boolean | default false |
| isActive | Boolean | default true — inactive products are hidden from storefront, not deleted |
| createdAt / updatedAt | Date | timestamps |

Index `{ name: 'text', description: 'text' }` for search, plus `{ category: 1 }` and `{ price: 1 }`.

### Cart
`user` (ObjectId ref User, nullable for guest carts identified client-side), `items`: `[{ product: ObjectId ref Product, quantity: Number, priceAtAdd: Number }]`, `updatedAt`.

### Order
| Field | Type | Notes |
|---|---|---|
| user | ObjectId ref User | required |
| items | [{ product, name, price, quantity }] | snapshot at order time, not a live ref lookup |
| shippingAddress | AddressSchema | required |
| subtotal, shippingFee, total | Number | |
| paymentStatus | String | enum: `pending`, `paid`, `failed`, `refunded` |
| paymentIntentId | String | Stripe PaymentIntent id |
| orderStatus | String | enum: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, default `pending` |
| createdAt / updatedAt | Date | timestamps |

Snapshot `name`/`price` onto order line items even though `product` is also referenced — product price/name can change later and the order should keep what the customer actually paid.

## 4. API routes

All JSON. Protected routes require `Authorization: Bearer <token>`. Admin routes additionally require `role: admin`.

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | public | create account, returns token |
| POST | `/login` | public | returns token |
| GET | `/me` | protected | current user profile |

### Products — `/api/products`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | public | list, query: `category`, `search`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/:slug` | public | single product |
| POST | `/` | admin | create |
| PUT | `/:id` | admin | update |
| DELETE | `/:id` | admin | delete |

### Categories — `/api/categories`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | public | list all |
| POST | `/` | admin | create |
| PUT | `/:id` | admin | update |
| DELETE | `/:id` | admin | delete |

### Cart — `/api/cart`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | protected | current user's cart |
| POST | `/items` | protected | add item `{ productId, quantity }` |
| PUT | `/items/:productId` | protected | update quantity |
| DELETE | `/items/:productId` | protected | remove item |

### Orders — `/api/orders`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | protected | create order from cart + shipping address |
| GET | `/` | protected | current user's orders |
| GET | `/:id` | protected | single order (owner or admin) |
| GET | `/admin/all` | admin | all orders, filterable by status |
| PUT | `/admin/:id/status` | admin | update `orderStatus` |

### Payments — `/api/payment`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/create-intent` | protected | creates a Stripe PaymentIntent for the current cart total |
| POST | `/webhook` | public (Stripe-signed) | confirms payment, marks order `paid` |

## 5. Response conventions

Success:
```json
{ "success": true, "data": {} }
```
Error:
```json
{ "success": false, "message": "human-readable reason", "errors": [] }
```
`errors` is populated by `validate.js` when express-validator catches bad input. Never leak stack traces or raw Mongo errors to the client — `errorHandler.js` catches everything and maps to a clean message + appropriate status code (400/401/403/404/409/500).

## 6. Auth flow

1. `POST /api/auth/register` hashes password with bcrypt (cost 10+), saves user, returns `{ token, user }`.
2. `POST /api/auth/login` compares bcrypt hash, returns `{ token, user }` on match.
3. Token is a signed JWT (`JWT_SECRET`, expiry `JWT_EXPIRES_IN`, default `7d`) containing `{ id, role }`.
4. `auth.js` middleware verifies the token on protected routes and attaches `req.user`.
5. `admin.js` middleware runs after `auth.js` and checks `req.user.role === 'admin'`.

## 7. Seed data

`seed/seedData.js` should insert 5–6 categories and ~20 sample products (real-sounding stationery names, THB prices, placeholder image URLs) so the storefront looks populated in demos. Run via `npm run seed` (root) / `node src/seed/seedData.js` (backend).
