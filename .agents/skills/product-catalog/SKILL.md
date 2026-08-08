---
name: product-catalog
description: Guides building or modifying the product and category catalog for MerboloEbook — models, CRUD API, search/filter query logic, and the storefront listing/detail UI. Use when adding or changing product fields, category structure, search behavior, or product-related endpoints/components.
---

# Product Catalog Skill

## Scope
`Product` and `Category` models, their routes/controllers, and the frontend pieces that consume them (`Shop`, `ProductDetail`, `ProductCard`, `ProductGrid`, `ProductFilters`, and the admin equivalents).

## Backend conventions
- Product schema and field list are defined in `BACKEND.md` §3 — don't add fields there without checking if `FRONTEND.md` needs updating too (a new field the UI can't show is dead weight).
- `slug` is generated from `name` on create (kebab-case, unique — append a short suffix on collision, don't error out).
- List endpoint (`GET /api/products`) supports `category`, `search`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` query params — always paginate, default `limit=20`.
- `search` uses the Mongo text index on `name`/`description`; don't implement search with a regex scan over all products.
- Inactive products (`isActive: false`) are excluded from every public-facing query but still visible/editable in the admin list.

## Frontend conventions
- `Shop` page owns filter state (category, price range, search, sort) and syncs it to the URL query string, so a filtered view is shareable/bookmarkable.
- `ProductCard` is the single source of truth for how a product preview looks — used on `Home`, `Shop`, and anywhere else a product grid appears. Don't duplicate its markup.
- Out-of-stock products still display (don't hide them) but show a clear "Out of stock" state and disable add-to-cart.

## When adding a new filter or field
1. Add it to the `Product` schema and the list-endpoint query params (`BACKEND.md`).
2. Add it to `ProductFilters` and the admin `AdminProductForm`.
3. Confirm the Mongo index still covers the fields you're filtering/sorting on.
