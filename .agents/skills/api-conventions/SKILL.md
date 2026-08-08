---
name: api-conventions
description: Defines REST API conventions for the MerboloEbook backend — response envelope shape, error handling, validation pattern, and route/controller/model layering. Use when adding or modifying any Express route, controller, or middleware.
---

# API Conventions Skill

## Response shape
Every endpoint returns one of:
```json
{ "success": true, "data": {} }
```
```json
{ "success": false, "message": "human-readable reason", "errors": [] }
```
`errors` (array) is only populated for validation failures; omit it otherwise. Never return a raw Mongoose error or stack trace to the client.

## Layering
- **Routes** (`routes/*.js`): define the path + HTTP method, wire up middleware (`auth`, `admin`, `validate`), call the controller. No logic here beyond that.
- **Controllers** (`controllers/*.js`): read `req`, call the model, shape the response. This is where business logic lives for a project this size.
- **Models** (`models/*.js`): Mongoose schemas + any schema-level methods/statics (e.g., a `Product.search()` static). No Express-specific code (`req`/`res`) in a model file.

## Validation
- Every route that writes data (`POST`/`PUT`/`DELETE` with a body) has an `express-validator` chain in the route definition and runs through `validate.js` before hitting the controller.
- Validate types, required fields, and reasonable bounds (e.g., `price` must be a positive number, `quantity` must be a positive integer) — don't rely on the frontend form to be the only thing stopping bad data.

## Error handling
- Controllers use `try/catch` (or an async-handler wrapper) and call `next(err)` on failure — don't send a response directly from a catch block, let `errorHandler.js` do it centrally so the shape is always consistent.
- Map known error types to status codes in `errorHandler.js`: validation → 400, auth missing/invalid → 401, role mismatch → 403, not found → 404, duplicate key (e.g., email/slug) → 409, everything else → 500.

## Auth-protected routes
Any route requiring a logged-in user imports and applies `auth.js` in the route file itself (`router.get('/me', auth, getMe)`), not globally in `app.js` — keeps it obvious per-route which endpoints are protected.
