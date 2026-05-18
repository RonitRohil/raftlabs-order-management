# RaftLabs Order Management — Frontend

React 18 + Vite + Tailwind CSS food delivery UI with real-time order tracking.

## Pages

| Route          | Description                                      |
|----------------|--------------------------------------------------|
| `/`            | Menu browser — browse items, filter by category, add to cart |
| `/cart`        | Cart page — review items, fill delivery details, checkout |
| `/orders/:id`  | Order tracking — real-time status via SSE stream |

## Setup

```bash
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000/api in .env
npm install
npm run dev
```

## Run Tests

```bash
npm test
```

## Deploy Note

Build with `npm run build`. The `dist/` folder can be deployed to Vercel, Netlify, or any static host. Set the `VITE_API_BASE_URL` environment variable to your deployed backend URL.
