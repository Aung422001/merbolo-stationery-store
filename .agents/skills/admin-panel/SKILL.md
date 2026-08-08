---
name: admin-panel
description: Guides building the MerboloEbook admin dashboard — product, category, and order management screens, and the role-gating that protects them. Use when adding admin pages, admin-only API routes, or any role-gated UI.
---

# Admin Panel Skill

## Scope
Everything under `pages/admin/`, the `admin.js` backend middleware, and any route under `/api/*` marked "admin" access in `BACKEND.md`.

## Access control
- Every admin page is wrapped in `<ProtectedRoute requireAdmin>` — don't hand-roll a role check inside individual admin page components.
- Every admin API route runs `auth.js` then `admin.js` — `admin.js` always runs after `auth.js`, never standalone (it depends on `req.user` being set).
- A logged-in non-admin hitting an admin route gets a 403 with a clear message, not a silent redirect or a generic 401.

## UI conventions
- Admin screens are plain and functional (a data table + a form), not styled to match the storefront's warmer visual tone — optimize for the shop owner moving fast, not for browsing.
- Product/category CRUD: table view with edit/delete actions, separate form view/route for create and edit (don't do inline table editing for v1 — too fiddly for an MVP).
- Order management: list with status filter, status update is a dropdown/button on each row — updating status should not require navigating to a separate edit page.
- Every destructive action (delete product, delete category) gets a confirmation step before it fires.

## When adding a new admin capability
Check `PRD.md` §5.6 first — if it's not listed there, it's likely a v2 stretch goal (§9), not something to build into v1 without confirming.
