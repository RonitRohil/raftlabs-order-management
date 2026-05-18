# RaftLabs backend — order management API

Node.js + Express 5 REST API with Prisma ORM and Neon PostgreSQL. Real-time order tracking runs over Server-Sent Events.

---

## Architecture

3-layer, no service layer:

```
src/routes/routes.js  →  src/controllers/  →  src/models/  →  DB (Prisma)
```

Routes register endpoints. Controllers parse params, call the model, send back whatever the model returned. Models own all Prisma queries, run business checks (item availability, status validation, order existence), and return the response envelope directly.

Every endpoint returns:
```json
{
  "success": 1,
  "status_code": 200,
  "message": "Human readable message",
  "result": {}
}
```

`src/index.js` is the Express app factory — it sets up middleware, mounts routes, and registers the error handler, then exports `app` with no `listen()`.
`src/server.js` is the entry point — it calls `dotenv.config()` then `app.listen()`.
Supertest imports `app` from `index.js` directly, which is why the two files need to stay separate.

---

## Folder structure

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
│   │   └── dbHelper.js           ← Prisma client singleton (global.db)
│   ├── middleware/
│   │   ├── errorHandler.js       ← handles Zod errors, Prisma P2025, and generic 500s
│   │   └── validate.js           ← Zod validation middleware factory
│   ├── validations/
│   │   └── orderValidations.js   ← PlaceOrderSchema
│   ├── utils/
│   │   └── apiResponse.js        ← response envelope builder
│   ├── index.js                  ← Express app factory
│   └── server.js                 ← entry point
├── prisma/
│   ├── schema.prisma             ← MenuItem, Order, OrderItem, OrderStatus enum
│   └── seed.js                   ← 8 menu items across 5 categories
├── __tests__/
│   ├── menu.test.js              ← 3 tests for GET /api/menu
│   └── orders.test.js            ← 12 tests for orders CRUD and status updates
├── .env.example
├── .gitignore
└── package.json
```

---

## Local setup

### 1. Get a database

Create a free project at [neon.tech](https://neon.tech) and copy the pooled connection string.

### 2. Install and configure

```bash
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
npx prisma generate   # generate Prisma client
npx prisma db push    # create tables in Neon
npm run db:seed       # load 8 menu items
```

### 4. Start

```bash
npm run dev    # nodemon, auto-reloads on changes
npm start      # plain node for production
```

Running at: http://localhost:8000

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Returns `{ status: "ok", timestamp }` |
| GET | /api/menu | Available menu items ordered by category, includes total count |
| POST | /api/orders | Place a new order |
| GET | /api/orders/:id | Order by ID with nested items and menu details |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/orders/:id/stream | SSE stream, pushes status updates every 10 seconds |

### POST /api/orders — request body

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

Validation (Zod):
- `customer_name` — string, min 2 characters
- `customer_address` — string, min 5 characters
- `customer_phone` — 10-digit Indian mobile number starting with 6-9
- `items` — non-empty array, each item needs a positive integer `menu_item_id` and `quantity >= 1`

### PATCH /api/orders/:id/status — request body

```json
{ "status": "PREPARING" }
```

Valid values: `ORDER_RECEIVED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`

### GET /api/orders/:id/stream — SSE events

```
data: {"order_id": 1, "status": "PREPARING"}
```

Emits on connect, then every 10 seconds until `DELIVERED`. Closes automatically after delivery.

---

## Database schema

```
MenuItem      Order           OrderItem
─────────     ─────────       ─────────────
id            id              id
name          customer_name   order_id      → Order.id
description   customer_address menu_item_id → MenuItem.id
price         customer_phone  quantity
image_url     status (enum)   unit_price    ← copied at order time
category      created_at
is_available  updated_at
created_at
```

OrderStatus enum: `ORDER_RECEIVED` > `PREPARING` > `OUT_FOR_DELIVERY` > `DELIVERED`

---

## Scripts

```bash
npm run dev          # nodemon dev server
npm start            # production
npm test             # run all tests
npm run test:watch   # watch mode
npm run db:generate  # regenerate Prisma client after schema changes
npm run db:push      # push schema to the database
npm run db:seed      # seed menu items (safe to re-run)
npm run db:studio    # open Prisma Studio
```

---

## Running tests

Needs `DATABASE_URL` set in `.env` and the DB seeded first.

```bash
npm test
```

What's covered:
- `menu.test.js` — response shape, required fields, only available items, count field
- `orders.test.js` — place order success, unit_price snapshot, 5 validation failure cases (missing name, bad phone, empty items, zero quantity, non-existent menu item ID), GET by ID (success / 404 / 400 for non-numeric), PATCH status (valid transitions / invalid value / 404 for missing order)
