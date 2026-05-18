# RaftLabs Frontend — Order Management UI

React 19 + Vite + Tailwind CSS SPA for the food delivery order management feature. Lets customers browse a menu, manage a cart, place an order, and watch live order status updates via Server-Sent Events.

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | MenuPage | Browse all menu items, filter by category, add items to cart |
| `/cart` | CartPage | Review cart, fill delivery details, validate and submit order |
| `/orders/:id` | OrderPage | Real-time order tracking via SSE — animated 4-step progress tracker |

---

## Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js               ← Axios instance + named API functions
│   ├── context/
│   │   └── CartContext.jsx          ← Cart state with useCallback, derived totals
│   ├── hooks/
│   │   └── useOrderStream.js        ← EventSource SSE hook with cleanup
│   ├── components/
│   │   ├── MenuCard.jsx             ← Item card with Add to Cart button
│   │   ├── CartItem.jsx             ← Cart row with quantity controls
│   │   └── OrderStatusTracker.jsx   ← Animated 4-step progress bar
│   ├── pages/
│   │   ├── MenuPage.jsx             ← Menu browser with category filters
│   │   ├── CartPage.jsx             ← Cart + checkout form
│   │   └── OrderPage.jsx            ← Order tracking page
│   ├── App.jsx                      ← BrowserRouter + CartProvider + Routes
│   ├── main.jsx                     ← Vite entry point
│   └── index.css                    ← Tailwind directives only
├── __tests__/
│   ├── MenuCard.test.jsx
│   ├── CartItem.test.jsx
│   └── OrderStatusTracker.test.jsx
├── __mocks__/
│   └── fileMock.js                  ← stub for image imports in Jest
├── .env.example
├── babel.config.cjs                 ← Babel config for Jest
├── tailwind.config.js               ← Custom brand orange color palette
└── package.json
```

---

## Local Setup

### Prerequisites

The backend must be running locally (or you can point to the deployed API).

### 1. Install dependencies

```bash
# From the frontend/ directory
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

To use the deployed backend instead:
```env
VITE_API_BASE_URL=https://raftlabs-order-management-1rzy.onrender.com/api
```

### 3. Start the dev server

```bash
npm run dev
```

App runs at: http://localhost:5173

---

## Available Scripts

```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm test         # run component tests (Jest + RTL)
```

---

## Running Tests

```bash
npm test
```

Tests run in a jsdom environment using Jest and React Testing Library. No backend connection needed — all API calls are handled by the component's internal state in tests.

**Test coverage:**

`MenuCard.test.jsx` (5 tests):
- Renders item name, price, and category badge
- Renders item description
- Shows "Add to Cart" button initially
- Shows "In Cart (1)" after first click
- Increments count on subsequent clicks

`CartItem.test.jsx` (5 tests):
- Renders item name
- Renders price per unit
- Shows correct quantity value
- Shows line total (price × quantity)
- Renders increase, decrease, and remove controls

`OrderStatusTracker.test.jsx` (4 tests):
- All 4 step elements render with correct `data-testid` attributes
- All step labels render
- Completion message absent when `is_complete` is false
- Completion message present when `is_complete` is true

---

## Key Implementation Details

### CartContext

State is a single `cart` array of `{ menu_item, quantity }` objects. `cart_total` and `cart_count` are derived from that array on every render — not stored as separate state — so they can never go out of sync. All mutating functions use `useCallback` to avoid unnecessary re-renders of child components.

### useOrderStream hook

Creates an `EventSource` pointed at `/api/orders/:id/stream`. Parses each SSE event, updates `status` and `current_step`, and sets `is_complete = true` when `DELIVERED` is received. Closes the connection on delivery and on component unmount (cleanup function in `useEffect`). Sets an error message if the connection drops unexpectedly.

### Tailwind brand colors

Custom `brand` color scale is defined in `tailwind.config.js`:
- `brand-50` — light orange background (`#fff7ed`)
- `brand-500` — primary orange (`#f97316`)
- `brand-600` — hover state (`#ea580c`)
- `brand-700` — active state (`#c2410c`)

### Image fallback

Both `MenuCard` and `CartItem` use `onError` on `<img>` tags to fall back to a placeholder image if the Unsplash URL fails to load.

---

## Deployment

The frontend is deployed on [Vercel](https://vercel.com) (free tier):

1. Connect GitHub repo in Vercel → set **Root Directory** to `frontend`
2. Vercel auto-detects Vite — no changes to build settings needed
3. Add environment variable: `VITE_API_BASE_URL=https://<backend-url>/api`
4. Every push to `main` triggers an automatic redeploy

Live URL: https://raftlabs-order-management-dusky.vercel.app
