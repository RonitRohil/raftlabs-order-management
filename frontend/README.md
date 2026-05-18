# RaftLabs frontend — order management UI

React 19 + Vite + Tailwind CSS. Three pages: browse a menu, manage a cart and checkout, watch an order's live status via SSE.

---

## Pages

| Route | Page | What it does |
|-------|------|--------------|
| `/` | MenuPage | Browse items, filter by category, add to cart |
| `/cart` | CartPage | Review cart, fill delivery details, place order |
| `/orders/:id` | OrderPage | Live order status — 4-step tracker updating in real time |

---

## Folder structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js               ← Axios instance + named API functions
│   ├── context/
│   │   └── CartContext.jsx          ← cart state, derived totals
│   ├── hooks/
│   │   └── useOrderStream.js        ← EventSource hook with cleanup
│   ├── components/
│   │   ├── MenuCard.jsx             ← item card with add-to-cart button
│   │   ├── CartItem.jsx             ← cart row with quantity controls
│   │   └── OrderStatusTracker.jsx   ← animated 4-step progress bar
│   ├── pages/
│   │   ├── MenuPage.jsx
│   │   ├── CartPage.jsx
│   │   └── OrderPage.jsx
│   ├── App.jsx                      ← BrowserRouter + CartProvider + Routes
│   ├── main.jsx                     ← Vite entry point
│   └── index.css                    ← Tailwind directives only
├── __tests__/
│   ├── MenuCard.test.jsx
│   ├── CartItem.test.jsx
│   └── OrderStatusTracker.test.jsx
├── __mocks__/
│   └── fileMock.js                  ← image import stub for Jest
├── .env.example
├── babel.config.cjs
├── tailwind.config.js
└── package.json
```

---

## Local setup

The backend needs to be running first (or point at the deployed API instead).

```bash
npm install

cp .env.example .env
# For local backend:
#   VITE_API_BASE_URL=http://localhost:5000/api
#
# For deployed backend:
#   VITE_API_BASE_URL=https://raftlabs-order-management-1rzy.onrender.com/api

npm run dev
```

Runs at: http://localhost:5173

---

## Scripts

```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm test         # run component tests
```

---

## Running tests

No backend needed. Tests run in jsdom with Jest and React Testing Library.

```bash
npm test
```

`MenuCard.test.jsx` (5 tests):
- renders item name, price, and category badge
- renders item description
- shows "Add to Cart" button initially
- button shows "In Cart (1)" after first click
- count increments on subsequent clicks

`CartItem.test.jsx` (5 tests):
- renders item name
- renders price per unit
- shows correct quantity
- shows correct line total (price x quantity)
- renders increase, decrease, and remove controls

`OrderStatusTracker.test.jsx` (4 tests):
- all 4 steps render with correct `data-testid` values
- all step labels render
- completion message absent when `is_complete` is false
- completion message present when `is_complete` is true

---

## Implementation notes

### CartContext

Cart is a single array of `{ menu_item, quantity }` objects. `cart_total` and `cart_count` compute from that array on each render rather than being stored as separate state. Mutating functions use `useCallback` to keep child components from re-rendering unnecessarily.

### useOrderStream

Opens an `EventSource` against `/api/orders/:id/stream`. On each message it updates `status` and `current_step`. When `DELIVERED` arrives it sets `is_complete = true` and closes the connection. Also closes on component unmount. If the connection drops unexpectedly, it sets an error message.

### Tailwind brand colors

Defined in `tailwind.config.js`:
- `brand-50` (#fff7ed) — light background
- `brand-500` (#f97316) — primary orange
- `brand-600` (#ea580c) — hover
- `brand-700` (#c2410c) — active

### Image fallback

`MenuCard` and `CartItem` both use `onError` on `<img>` to swap in a placeholder if the Unsplash URL fails.

---

## Deployment

Deployed on [Vercel](https://vercel.com) free tier.

1. Connect the GitHub repo, set root directory to `frontend`
2. Vercel detects Vite automatically
3. Add env var: `VITE_API_BASE_URL=https://<backend-url>/api`

Pushes to `main` redeploy automatically.

Live: https://raftlabs-order-management-dusky.vercel.app
