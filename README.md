# RaftLabs order management

Full-stack food delivery app for a job assignment. Browse a menu, cart items, place an order, watch the status update live via SSE.

**Live links:**
- Frontend: https://raftlabs-order-management-dusky.vercel.app
- API: https://raftlabs-order-management-1rzy.onrender.com/api
- Health: https://raftlabs-order-management-1rzy.onrender.com/health

> Render's free tier spins down after 15 min idle. First request after that takes ~30 seconds. Hit the health URL before a demo to wake it up.

---

## Project structure

```
raftlabs-order-management/
├── backend/          → Node.js + Express 5 REST API
│   ├── src/          → source files
│   ├── prisma/       → schema and seed
│   └── __tests__/    → Jest + Supertest
├── frontend/         → React + Vite SPA
│   ├── src/          → source files
│   └── __tests__/    → Jest + React Testing Library
└── README.md
```

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend    | Node.js, Express 5, CommonJS |
| Database   | PostgreSQL via Prisma ORM + Neon |
| Real-time  | Server-Sent Events (SSE) |
| Validation | Zod |
| Testing    | Jest + Supertest (API), Jest + RTL (UI) |
| Deploy     | Vercel (frontend), Render (backend), Neon (DB) |

---

## Local setup

### Prerequisites

- Node.js 18+
- A free [Neon](https://neon.tech) account for the database

### 1. Clone

```bash
git clone https://github.com/<your-username>/raftlabs-order-management.git
cd raftlabs-order-management
```

### 2. Backend

```bash
cd backend
npm install

cp .env.example .env
# Fill in:
#   DATABASE_URL  → Neon connection string
#   FRONTEND_URL  → http://localhost:5173

npx prisma generate
npx prisma db push
npm run db:seed

npm run dev
```

Runs at: http://localhost:5000

### 3. Frontend

New terminal:

```bash
cd frontend
npm install

cp .env.example .env
# Set: VITE_API_BASE_URL=http://localhost:5000/api

npm run dev
```

Runs at: http://localhost:5173

---

## Running tests

```bash
# Backend — needs DATABASE_URL set in backend/.env
cd backend && npm test

# Frontend — no backend needed
cd frontend && npm test
```

---

## Deployment

Everything runs free across three services.

### Database — Neon

Sign up at [neon.tech](https://neon.tech), create a project, copy the pooled connection string. Free tier is 0.5 GB.

### Backend — Render

1. New > Web Service, connect the repo, root directory: `backend`
2. Build command: `npm install && npx prisma generate && npx prisma db push`
3. Start command: `npm start`
4. Instance type: Free
5. Environment variables:
   ```
   DATABASE_URL=<neon string>
   FRONTEND_URL=https://<your-vercel-url>.vercel.app
   NODE_ENV=production
   PORT=8000
   ```

The server seeds the database on first boot if the menu table is empty, so no shell access is needed.

### Frontend — Vercel

1. New Project, connect the same repo, root directory: `frontend`
2. Vercel picks up Vite automatically
3. Add: `VITE_API_BASE_URL=https://<render-url>.onrender.com/api`
4. After deploying, go back to Render and update `FRONTEND_URL` to the Vercel URL — this is what fixes CORS.

Both services redeploy on every push to `main`.

---

## Assignment requirements

### Architecture

| Requirement | How it's done |
|-------------|---------------|
| 3-layer pattern: routes > controllers > models | `routes/routes.js` calls controllers, controllers call models, models call Prisma. No service layer. |
| Models own DB queries and return the envelope | `menuModel.js` and `orderModel.js` return `apiResponse(...)` directly |
| Controllers are thin wrappers | Each one gets the response from the model and does `res.status(response.status_code).json(response)` |
| Business logic in models | Price snapshot, item availability check, order existence check — all in `orderModel.js` |
| `index.js` = app factory, `server.js` = entry point | `index.js` exports `app` with no `listen()`. `server.js` does `dotenv.config()` then `app.listen()`. Supertest needs this split to avoid port conflicts when importing `app` in tests. |

### Response envelope

Every endpoint returns:
```json
{ "success": 1, "status_code": 200, "message": "...", "result": {} }
```
The `apiResponse()` utility in `src/utils/apiResponse.js` builds this — no raw responses anywhere.

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/menu | Available items ordered by category, with count |
| POST | /api/orders | Place a new order (Zod validated) |
| GET | /api/orders/:id | Order by ID with nested items |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/orders/:id/stream | SSE real-time status stream |

### Validation

Backend uses Zod (`PlaceOrderSchema`) to validate the order body: name (min 2 chars), address (min 5 chars), phone (Indian 10-digit regex `/^[6-9]\d{9}$/`), items (non-empty, each with positive `menu_item_id` and `quantity >= 1`).

Controllers do `parseInt(req.params.id)` + `isNaN` check immediately, returning 400 before anything else runs.

The checkout form on the frontend re-runs the same phone regex client-side and shows per-field errors before the request even goes out.

### Price snapshot

`unit_price` is copied from the menu item at order creation time and stored on each `OrderItem` row. If a menu price changes later, existing orders are unaffected.

### Real-time updates (SSE)

`GET /api/orders/:id/stream` verifies the order exists, sets SSE headers, then immediately sends `ORDER_RECEIVED`. Every 10 seconds it advances to the next status, writes it to the DB, and pushes the event. Closes 1 second after `DELIVERED`. The interval is cleared on `req.on("close")` so a client disconnecting mid-stream doesn't leave a zombie process running.

The `useOrderStream` hook closes the `EventSource` when `DELIVERED` arrives and again on component unmount.

### Error handling

Zod errors go to 400 with the joined field messages. Prisma P2025 goes to 404. Everything else goes to 500. All of this runs through a single `errorHandler.js` middleware so there's no scattered error logic.

### Database

Three models (`MenuItem`, `Order`, `OrderItem`) and one enum (`OrderStatus`). Seed has 8 items across Pizza, Burger, Starters, Pasta, and Desserts, all priced between ₹99 and ₹399.

`dbHelper.js` uses the `global.db` singleton pattern to avoid opening a new Prisma connection on every hot-reload during dev.

### Frontend

| Requirement | How it's done |
|-------------|---------------|
| Menu browser | `MenuPage` fetches items, shows category filter pills, renders a responsive grid |
| Cart management | `CartContext` with `add_to_cart`, `remove_from_cart`, `update_quantity`, `clear_cart`. `cart_total` and `cart_count` derive from the cart array — not stored as separate state |
| Checkout | `CartPage` shows cart items on the left, delivery form on the right. Validates, calls `POST /api/orders`, redirects to the order page |
| Order tracking | `OrderPage` uses `useOrderStream` and `OrderStatusTracker` to show live status via SSE |
| State management | React Context API only |
| HTTP client | Axios with 10s timeout |

### Testing

Backend (`backend/__tests__/`):
- `menu.test.js` — 3 tests: response shape, required fields, only available items returned, count field
- `orders.test.js` — 12 tests: place order success + unit_price snapshot, 5 validation failures, GET by ID (success / 404 / 400 for non-numeric ID), PATCH status (3 valid transitions / invalid value / 404)

Frontend (`frontend/__tests__/`):
- `MenuCard.test.jsx` — renders name, price, category, description; button state changes on click
- `CartItem.test.jsx` — renders item details, quantity, line total, all three controls
- `OrderStatusTracker.test.jsx` — all 4 steps render; completion message tied to `is_complete`

---

## Design decisions

### SSE, not WebSockets

Order status is one-way. The server pushes, the client reads, there's nothing to send back. SSE is plain HTTP, needs no upgrade handshake, and works through standard proxies without any special config. WebSockets would be the wrong call here.

### Prisma over raw SQL

The `schema.prisma` file is the only place the database structure lives. For a project this size, `db push` is simpler than managing migration files. The generated client gives autocomplete and catches typos at write time even in plain JS. The tradeoff is ~30 MB of binary added to the deploy, which is fine.

### Neon for the database

Serverless Postgres that scales to zero when idle. That matters when the backend is on a free tier that also sleeps. The pooled connection mode handles cold-start connection spikes without any extra config.

### Render over Railway

Railway's free tier got cut significantly in 2024. Render gives 750 instance hours per month with Git-connected autodeploys. The 15-minute spin-down is annoying for demos but workable for an assignment submission.

### `index.js` vs `server.js`

If `app.listen()` were in `index.js`, every Supertest import would try to bind port 8000 and tests would start conflicting with each other. Keeping `listen()` only in `server.js` means Supertest can import `app` and spin up its own ephemeral server cleanly. It's one of those things that seems overly pedantic until your test suite breaks.

### Price snapshot

`unit_price` is stored on `OrderItem` at creation time rather than joining to the current `MenuItem.price`. If a price changes after an order is placed, the order history should still show what the customer was actually charged — joining live would silently corrupt historical data.

### Derived cart totals

`cart_total` and `cart_count` compute from the `cart` array on each render instead of being stored as separate state. Keeping multiple state values in sync is a common way to introduce bugs. One array, everything else derives from it.
