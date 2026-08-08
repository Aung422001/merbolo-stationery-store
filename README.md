# MerboloEbook

An online stationery shop — React/Vite storefront, Express/MongoDB API, JWT auth, Stripe checkout, and an admin dashboard for managing products and orders.

## Docs

| File | What it covers |
|---|---|
| [`PRD.md`](./PRD.md) | Product requirements — what to build and why |
| [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) | Build order, phased roadmap |
| [`BACKEND.md`](./BACKEND.md) | API routes, data models, backend conventions |
| [`FRONTEND.md`](./FRONTEND.md) | Pages, components, state management |
| [`GEMINI.md`](./GEMINI.md) | Rules for the Antigravity agent — see setup note below |

Read these (via the agent, or yourself) before generating code — they're the actual spec, this README is just setup instructions.

## Tech stack

**Frontend:** React, Vite, React Router, Tailwind CSS, Zustand, Axios
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Stripe
**Tooling:** npm workspaces (monorepo), Antigravity IDE

## Project structure

```
merboloebook/
├── frontend/          # React + Vite app
├── backend/           # Express API
├── .agents/
│   ├── rules/         # Antigravity workspace rules (loads GEMINI.md)
│   └── skills/        # Antigravity agent skills for this project
├── PRD.md
├── IMPLEMENTATION.md
├── BACKEND.md
├── FRONTEND.md
├── GEMINI.md
└── package.json       # workspace root
```

## Prerequisites

- Node.js 20+
- MongoDB — either running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Stripe](https://dashboard.stripe.com/register) account (test mode is free, no real business details needed to start)

## Setup

```bash
# 1. Install dependencies for both workspaces
npm install

# 2. Copy the env template and fill in real values
cp .env.example backend/.env
cp .env.example frontend/.env

# 3. Seed the database with sample categories + products
npm run seed

# 4. Run both frontend and backend together
npm run dev
```

Frontend runs at `http://localhost:5173`, backend API at `http://localhost:5000/api`.

> Vite only reads `VITE_`-prefixed variables, and only from `frontend/.env` — that's why the example gets copied into both `backend/.env` and `frontend/.env` rather than shared from one root file.

## Scripts (root)

| Command | Does |
|---|---|
| `npm run dev` | Runs frontend + backend concurrently |
| `npm run dev:backend` | Backend only |
| `npm run dev:frontend` | Frontend only |
| `npm run seed` | Seeds sample categories + products |

## Environment variables

See [`.env.example`](./.env.example) for the full list (Mongo URI, JWT secret, Stripe keys, API/client URLs).

## Using the Antigravity agent on this project

`GEMINI.md` at the project root holds the rules the agent should follow (stack, conventions, do's/don'ts). To make Antigravity actually apply it:

1. **Already wired up** — `.agents/rules/project-rules.md` references `GEMINI.md` via an `@` mention, and Antigravity reads everything under `.agents/rules/` automatically as workspace rules.
2. **Or manually** — open the Customizations panel (`···` at the top of the Agent panel) → Rules → **+ Workspace**, and paste in `GEMINI.md`'s contents.

Project-specific agent skills live in `.agents/skills/` (product catalog, cart/checkout, admin panel, API conventions) — the agent picks these up automatically when a task matches; no setup needed.

## Deployment (later)

Suggested free-tier path once v1 is stable: MongoDB Atlas (database), Render or Railway (backend), Vercel or Netlify (frontend). Not required to develop locally.
