# RaftLabs Backend — Order Management API

Node.js + Express 5 REST API with Prisma ORM and PostgreSQL (Neon). Implements a food delivery order management system with real-time order tracking via Server-Sent Events.

---

## Architecture

**3-layer pattern — strict, no service layer:**

```
src/routes/routes.js  →  src/controllers/  →  src/models/  →  DB (Prisma)
```

- **Routes** (`src/routes/routes.js`) — single flat file, all 5 endpoints registered here
- **Controllers** (`src/controllers/`) — parse and validate request params, call the model, forward the response. No business logic.
- **Models** (`src/models/`) — own all Prisma queries, validate business rules (item availability, status enum, order existence), and return the response envelope directly

**Response envelope — every endpoint, no exceptions:**
```json
{
  "success": 1,
  "status_code": 200,
  "message": "Human readable message",
  "result": {}
}
```

**Entry point separation:**
- `src/index.js` — Express app factory: middleware, routes, error handler. Exports `app`. No `app.listen()`.
- `src/server.js` — Entry point only: `dotenv.config()` + `app.listen()`. This separation lets Supertest import `app` cleanly without port conflicts.

---

## Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── menuController.js     ← getAllMenuItems
│   │   └── orderController.js    ← placeOrder, getOrderById, updateOrderStatus, streamOrderStatus
│   ├── models/
│   │   ├── menuModel.js          ← DB query + response envelope
│   │   └── orderModel.js         ← DB queries, price snapshot, status validation
│   ├── routes/
│   │   └── routes.js             ← all 5 routes in one file
│   ├── helpers/
│   │   └── dbHelper.js           ← Prisma client singleton
│   ├── middleware/
│   │   ├── errorHandler.js       ← central error handler (Zod, Prisma P2025, generic 500)
│   │   └── validate.js           ← Zod validation middleware factory
│   ├── validations/
│   │   └── orderValidations.js   ← PlaceOrderSchema (Zod)
│   ├── utils/
│   │   └── apiResponse.js        ← response envelope builder
│   ├── index.js                  ← Express app factory
│   └── server.js                 ← server entry point
├── prisma/
│   ├── schema.prisma             ← MenuItem, Order, OrderItem, OrderStatus enum
│   └── seed.js                   ← 8 menu items across 5 categories
├── __tests__/
│   ├── menu.test.js              ← 3 tests for GET /api/menu
│   └── orders.test.js            ← 12 tests for orders CRUD + status updates
├── .env.example
├── .gitignore
└── package.json
```

---

## Local Setup

### 1. Get a database

Create a free project at [neon.tech](https://neon.tech) and copy the **pooled** connection string.

### 2. Install and configure

```bash
# From the backend/ directory
npm install

cp .env.example .env
```

Fill in `.env`:
```env
PORT=8000
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
FRONTEND_URL="http://localhost:5173"
NODE_ENV=development
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon (creates tables)
npx prisma db push

# Seed with 8 menu items
npm run db:seed
```

### 4. Start the server

```bash
npm run dev        # development with nodemon (auto-reload)
npm start          # production
```

Server runs at: http://localhost:8000

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | — | Health check — returns `{ status: "ok", timestamp }` |
| GET | /api/menu | — | All available menu items ordered by category, with total count |
| POST | /api/orders | — | Place a new order (Zod validated body) |
| GET | /api/orders/:id | — | Get order by ID with nested items and menu details |
| PATCH | /api/orders/:id/status | — | Update order status (must be a valid enum value) |
| GET | /api/orders/:id/stream | — | SSE stream — pushes status updates every 10 seconds |

### POST /api/orders — Request Body

```json
{
  "customer_name": "Ronit Jain",
  "customer_address": "123, MG Road, Bengaluru - 560001",
  "customer_phone": "9876543210",
  "items": [
    { "menu_item_id": 1, "quantity": 2 }
  ]
}
```

**Validation rules:**
- `customer_name` — string, min 2 characters
- `customer_address` — string, min 5 characters
- `customer_phone` — 10-digit Indian mobile number (starts with 6–9)
- `items` — non-empty array; each item needs a positive integer `menu_item_id` and `quantity >= 1`

### PATCH /api/orders/:id/status — Request Body

```json
{ "status": "PREPARING" }
```

Valid status values: `ORDER_RECEIVED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`

### GET /api/orders/:id/stream — SSE Events

Each event is a JSON string on the `data:` line:
```
data: {"order_id": 1, "status": "PREPARING"}
```

The stream emits immediately on connect, then advances through statuses every 10 seconds. Closes automatically after `DELIVERED`.

---

## Database Schema

```
MenuItem      Order           OrderItem
─────────     ─────────       ─────────────
id            id              id
name          customer_name   order_id  → Order.id
description   customer_address menu_item_id → MenuItem.id
price         customer_phone  quantity
image_url     status (enum)   unit_price  ← snapshot at order time
category      created_at
is_available  updated_at
created_at
```

**OrderStatus enum:** `ORDER_RECEIVED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`

---

## Available Scripts

```bash
npm run dev          # start with nodemon
npm start            # start for production
npm test             # run all tests (--runInBand --forceExit)
npm run test:watch   # watch mode
npm run db:generate  # regenerate Prisma client after schema changes
npm run db:push      # push schema changes to the database
npm run db:seed      # seed menu items (safe to re-run)
npm run db:studio    # open Prisma Studio GUI
```

---

## Running Tests

Tests use Supertest and hit the real database. Make sure `DATABASE_URL` is set and the DB is seeded before running.

```bash
npm test
```

**Test coverage:**
- `menu.test.js` — 200 response shape, required fields on items, only available items returned, count field
- `orders.test.js` — place order success, unit_price snapshot, 5 validation failure cases (missing name, invalid phone, empty items, zero quantity, non-existent menu item ID), GET by ID (success, 404, 400 for non-numeric), PATCH status (valid transitions, invalid status value, 404 for non-existent order)
