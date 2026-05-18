# RaftLabs — Order Management System

A full-stack food delivery order management application built as a job assignment. The system lets customers browse a menu, add items to a cart, place an order, and watch their order status update in real time — all without polling, using Server-Sent Events (SSE).

**Live Demo:**
- Frontend: https://raftlabs-order-management-dusky.vercel.app
- Backend API: https://raftlabs-order-management-1rzy.onrender.com/api
- Health Check: https://raftlabs-order-management-1rzy.onrender.com/health

> **Note:** The backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idle may take up to 30 seconds. Open the health check URL a minute before demoing to warm it up.

---

## Project Structure

```
raftlabs-order-management/
├── backend/          → Node.js + Express 5 REST API
│   ├── src/          → Application source code
│   ├── prisma/       → Prisma schema and seed script
│   └── __tests__/    → Jest + Supertest API tests
├── frontend/         → React + Vite SPA
│   ├── src/          → Application source code
│   └── __tests__/    → Jest + React Testing Library component tests
└── README.md
```

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, React Router v7      |
| Backend    | Node.js, Express 5, CommonJS                       |
| Database   | PostgreSQL via Prisma ORM + Neon (serverless)      |
| Real-time  | Server-Sent Events (SSE)                           |
| Validation | Zod (backend schema validation)                    |
| Testing    | Jest + Supertest (API), Jest + React Testing Library (UI) |
| Deploy     | Vercel (frontend), Render (backend), Neon (DB)     |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A free [Neon](https://neon.tech) account for the PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/raftlabs-order-management.git
cd raftlabs-order-management
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Open .env and fill in:
#   DATABASE_URL  → your Neon connection string
#   FRONTEND_URL  → http://localhost:5173 (for local dev)

# Push schema to the database and generate Prisma client
npx prisma generate
npx prisma db push

# Seed the menu with 8 items
npm run db:seed

# Start the dev server (runs on port 8000)
npm run dev
```

Backend is now live at: http://localhost:8000

### 3. Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Open .env and set:
#   VITE_API_BASE_URL=http://localhost:8000/api

# Start the dev server (runs on port 5173)
npm run dev
```

Frontend is now live at: http://localhost:5173

---

## Running Tests

### Backend tests (Jest + Supertest)

```bash
cd backend
npm test
```

Tests hit the real database, so `DATABASE_URL` must be set in `backend/.env` before running.

### Frontend tests (Jest + React Testing Library)

```bash
cd frontend
npm test
```

---

## Deployment

The app is deployed fully free using three services:

### Database — Neon

- Create a free project at [neon.tech](https://neon.tech)
- Copy the connection string (pooled) into `DATABASE_URL`
- Neon provides serverless PostgreSQL with a 0.5 GB free tier — more than sufficient

### Backend — Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect the GitHub repo, set **Root Directory** to `backend`
3. Set:
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add environment variables:
   ```
   DATABASE_URL=<neon connection string>
   FRONTEND_URL=https://<your-vercel-url>.vercel.app
   NODE_ENV=production
   PORT=8000
   ```
5. The server auto-seeds the database on first startup if the menu table is empty — no shell access required.

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import the same GitHub repo, set **Root Directory** to `frontend`
3. Vercel auto-detects Vite — no build command changes needed
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://<your-render-url>.onrender.com/api
   ```
5. After deploying, go back to Render and update `FRONTEND_URL` to the Vercel URL to fix CORS.

Every `git push` to `main` automatically redeploys both services.

---

## Assignment Requirements — Coverage Checklist

This section maps every requirement from the assignment brief to how it was implemented.

### Architecture

| Requirement | Implementation |
|-------------|----------------|
| 3-layer architecture: routes → controllers → models | `src/routes/routes.js` → `src/controllers/` → `src/models/` — no service layer |
| Models own all DB queries and return the response envelope | `menuModel.js` and `orderModel.js` call Prisma and return `apiResponse(...)` directly |
| Controllers only call the model and forward the response | Each controller is a thin wrapper: `const response = await model.fn(); res.status(response.status_code).json(response)` |
| Business logic lives in models | Price snapshot, menu item availability check, order existence check — all in `orderModel.js` |
| `index.js` = app factory only, `server.js` = entry point | `index.js` exports `app` with no `listen()`. `server.js` calls `dotenv.config()` then `app.listen()`. This separation makes Supertest work cleanly |

### Response Envelope

Every endpoint returns exactly:
```json
{ "success": 1, "status_code": 200, "message": "...", "result": {} }
```
The `apiResponse()` utility in `src/utils/apiResponse.js` enforces this shape — no raw responses anywhere.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/menu | All available menu items (ordered by category, includes count) |
| POST | /api/orders | Place a new order (Zod validated) |
| GET | /api/orders/:id | Get order by ID with nested items and menu details |
| PATCH | /api/orders/:id/status | Update order status (validates enum) |
| GET | /api/orders/:id/stream | SSE real-time order status stream |

### Validation

- **Backend:** Zod schema (`PlaceOrderSchema`) validates `customer_name` (min 2 chars), `customer_address` (min 5 chars), `customer_phone` (Indian 10-digit regex `/^[6-9]\d{9}$/`), and `items` (non-empty array, each with positive `menu_item_id` and `quantity >= 1`).
- **Frontend:** Client-side form validation on the Cart page before the API call, with field-level error messages.
- **Controller-level:** `parseInt(req.params.id)` + `isNaN` check on all routes that take an order ID, returning 400 immediately.

### Price Snapshot

When an order is placed, `unit_price` is copied from the menu item at that moment and stored on each `OrderItem` row. Future price changes to `MenuItem` do not affect historical orders.

### Real-time Updates (SSE)

The `GET /api/orders/:id/stream` endpoint:
1. Verifies the order exists before opening the stream
2. Sets SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`)
3. Immediately emits `ORDER_RECEIVED`
4. Advances through `PREPARING → OUT_FOR_DELIVERY → DELIVERED` every 10 seconds, updating the DB at each step
5. Closes the stream 1 second after `DELIVERED`
6. Clears the interval on `req.on("close")` to prevent memory leaks when the client disconnects

The frontend `useOrderStream` hook manages the `EventSource` lifecycle, closes it on `DELIVERED`, and cleans up on component unmount.

### Error Handling

- Zod validation errors → `400` with joined field messages
- Prisma P2025 (record not found) → `404`
- All other errors → `500`
- Central `errorHandler.js` middleware is the single place all errors flow through
- Every controller wraps its logic in `try/catch → next(err)`

### Database

- **Schema:** `MenuItem`, `Order`, `OrderItem` models with an `OrderStatus` enum
- **Seed:** 8 menu items across 5 categories (Pizza ×2, Burger ×2, Starters ×2, Pasta ×1, Desserts ×1) with realistic Indian pricing (₹99–₹399)
- **Prisma singleton:** `global.db` pattern in `dbHelper.js` prevents connection pool exhaustion during hot-reload in development

### Frontend

| Requirement | Implementation |
|-------------|----------------|
| Menu browser | `MenuPage` — fetches items, category filter pills, responsive 4-column grid |
| Cart management | `CartContext` — `add_to_cart`, `remove_from_cart`, `update_quantity`, `clear_cart` with `useCallback`; `cart_total` and `cart_count` derived (not extra state) |
| Checkout | `CartPage` — two-panel layout, form validation, calls `POST /api/orders`, redirects to order tracking |
| Order tracking | `OrderPage` + `useOrderStream` + `OrderStatusTracker` — live SSE stream, animated progress bar |
| State management | React Context API only — no Redux, no Zustand |
| HTTP client | Axios with 10s timeout |

### Testing

**Backend (`backend/__tests__/`):**
- `menu.test.js` — 3 tests: 200 response, required fields present, only available items returned, count field present
- `orders.test.js` — 12 tests covering POST (success + 5 validation failures), GET (success + 404 + 400 for non-numeric ID), PATCH (3 status updates + invalid status + 404)

**Frontend (`frontend/__tests__/`):**
- `MenuCard.test.jsx` — renders name/price/category/description, Add to Cart button state changes
- `CartItem.test.jsx` — renders item details, quantity display, all control buttons present
- `OrderStatusTracker.test.jsx` — all 4 steps render, completion message conditional on `is_complete`

---

## Design Decisions & Thoughts

### Why SSE instead of WebSockets?

The order status flow is one-directional — the server pushes updates to the client, the client never needs to send anything back. SSE is the right tool here: it's simpler (plain HTTP, no upgrade handshake), works through standard load balancers and CDNs without special configuration, and browsers handle reconnection natively. WebSockets would be over-engineering for a read-only stream.

### Why Prisma over raw SQL or Knex?

Prisma's schema-first approach means the `schema.prisma` file is the single source of truth for the DB structure — no migration files to maintain for a project this size, `db push` is enough. The generated client gives full TypeScript-style autocomplete even in JavaScript files via JSDoc. The main tradeoff is the Prisma binary size adds ~30 MB to the deployment, acceptable here.

### Why Neon for the database?

Neon is serverless Postgres — it scales to zero when idle (critical for a free-tier deployment) and the connection string works with Prisma out of the box. The pooled connection mode handles the serverless cold-start connection spikes well.

### Why Render for the backend instead of Railway?

Railway changed its free tier to be very limited. Render's free tier gives 750 instance hours per month with automatic deploys from GitHub, which is enough for demo and assignment purposes. The main limitation is the spin-down after 15 minutes idle, which is acceptable here.

### index.js vs server.js separation

This is the most important architectural decision for testability. When Supertest imports `app` from `index.js`, it starts the Express app without binding to a port — Supertest creates its own ephemeral server. If `app.listen()` were in `index.js`, every test file import would attempt to bind port 8000, causing conflicts. This separation is intentional and critical.

### Price snapshot on order creation

Storing `unit_price` on `OrderItem` at order time rather than joining to `MenuItem.price` at query time is essential for correctness. If a menu item's price changes after an order is placed, the order history should still show what the customer was actually charged. This is standard e-commerce practice.

### Cart state as derived values

`cart_total` and `cart_count` in `CartContext` are computed from the `cart` array on every render, not stored as separate `useState` values. This avoids the classic bug where state can go out of sync — there is one source of truth (the `cart` array) and everything else derives from it.
