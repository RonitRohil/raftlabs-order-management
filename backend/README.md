# RaftLabs Order Management — Backend

Node.js + Express 5 REST API with Prisma ORM for a food delivery order management system.

## Architecture

**3-Layer pattern:** `routes/routes.js` → `controllers/` → `models/` → DB

- **Routes** — register all endpoints in a single flat file
- **Controllers** — parse request, call model, send response (`res.status(result.status_code).json(result)`)
- **Models** — own all DB queries and return the response envelope

**Response envelope (every endpoint):**
```json
{ "success": 1, "status_code": 200, "message": "...", "result": {} }
```

## Setup

```bash
cp .env.example .env
# Add your Neon DATABASE_URL to .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## API Endpoints

| Method | Path                      | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | /api/menu                 | Get all available menu items         |
| POST   | /api/orders               | Place a new order                    |
| GET    | /api/orders/:id           | Get order by ID with items           |
| PATCH  | /api/orders/:id/status    | Update order status                  |
| GET    | /api/orders/:id/stream    | Stream real-time order status (SSE)  |

## Run Tests

```bash
npm test
```
