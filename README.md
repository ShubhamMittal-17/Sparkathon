# 🛒 Sparkathon — Smart In-Store Shopping Assistant

A smart shopping web app that turns an online cart into an **optimal in-store walking route** and surfaces **content-based product recommendations**. Built for a Walmart Sparkathon-style challenge.

The big idea: you build your cart online, and the app computes the shortest path through the physical store to collect every item and leave fast — rendered as a live, arrow-by-arrow map over the store floor plan. Alongside it, a recommender suggests similar products so you discover what you need without wandering.

---

## ✨ Features

- **Optimal in-store navigation** — A\* shortest-path + a Traveling-Salesman visit order turn your shopping list into the fastest route, rendered as an annotated map image.
- **Content-based recommendations** — a `/similar/:id` endpoint ranks products by category/tag, title overlap, price band, and popularity, with an explainable per-signal breakdown.
- **Product catalog** — browse products with infinite scroll; ranking defaults to best-sellers.
- **Auth + cart** — JWT-based sign up / sign in (bcrypt-hashed passwords) and a per-user persistent cart.

---

## 🏗️ Architecture

Three independent services communicating over HTTP:

```
 React (Vite) frontend ──HTTP/JSON──▶  Node/Express + MongoDB   (auth, products, cart, /similar)
        │
        └──────HTTP (POST items)─────▶  Python/Flask microservice (navigation: A* + TSP → PNG map)
```

The navigation service is split out because it is CPU-bound path computation + image rendering, which fits Python's `pygame`/`pytmx` ecosystem, while Node handles the I/O-bound web API.

---

## 📁 Repository layout

| Folder | What it is |
|---|---|
| `Frontend/` | React + Vite + Tailwind single-page app |
| `Backend Mongo/` | Express + MongoDB API (auth, products, cart, recommender) — **primary backend** |
| `Backend_Postgres/` | Alternative Express + PostgreSQL backend (prototype) |
| `Navigation Algo/` | Python/Flask microservice: A\* + TSP routing and map rendering |

---

## 🧠 How the core algorithms work

### Navigation (`Navigation Algo/`)
Given a list of item grid-coordinates:
1. Each item maps to the walkable aisle tile in front of its shelf.
2. **A\*** (Manhattan heuristic, 4-connected unit-cost grid → provably optimal) computes the shortest path between every pair of stops.
3. A **nearest-neighbor TSP heuristic** orders the stops to minimize total walking.
4. The stitched path is drawn with directional arrow sprites (straight / curve / u-turn / item) over a Tiled `.tmx` store map and returned as a PNG.

Complexity: `O(N² · V log V)` to build the distance matrix (N = stops, V = grid cells). The visit-ordering is the NP-hard TSP; nearest-neighbor is a fast approximation (future work: 2-opt / Held-Karp).

### Recommendations (`Backend Mongo/recommend.js`)
A **content-based** recommender (no user history required → no cold-start). For a query product, every other product is scored in `[0, 1]`:

```
score = 0.5 · categorySim   (Jaccard over tags)
      + 0.3 · titleSim       (Jaccard over title tokens)
      + 0.15 · priceSim      (normalized price closeness)
      + 0.05 · popularity    (normalized total_sold, tie-breaker)
```

The endpoint returns the top-N products plus a `reasons` breakdown so each recommendation is explainable.

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A MongoDB instance (local or Atlas)

### 1. Backend (Node + MongoDB)
```bash
cd "Backend Mongo"
npm install
# create a .env file:
#   DB_LOCATION=<your MongoDB connection string>
#   SECRET_ACCESS_KEY=<any long random string>
npm run start          # starts the API on http://localhost:5000
node seed/seedProducts.js   # (optional) seed the product catalog
```

### 2. Recommender demo (no DB needed)
```bash
cd "Backend Mongo"
node recommend.demo.js            # sample products
node recommend.demo.js P009       # similar items for one product
```

### 3. Navigation service (Python + Flask)
```bash
cd "Navigation Algo"
pip install flask flask-cors pytmx pygame pillow
python server.py       # starts on http://127.0.0.1:5000
```

### 4. Frontend (React + Vite)
```bash
cd Frontend
npm install
# Frontend/.env:
#   VITE_SERVER_DOMAIN=http://localhost:5000
npm run dev            # starts the app (Vite dev server)
```

> Note: the Node API and the Flask service both default to port `5000` — run them on different ports (or hosts) when using them together.

---

## 🔌 Key API endpoints (Node backend)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Register; returns a JWT |
| `POST` | `/signin` | — | Log in; returns a JWT |
| `GET` | `/all-products` | — | List products (sorted by best-sellers) |
| `GET` | `/similar/:productId?limit=4` | — | Content-based similar items |
| `POST` | `/add-item` | JWT | Add / increment a cart item |
| `POST` | `/remove-item` | JWT | Decrement / remove a cart item |
| `GET` | `/get-cart` | JWT | Get the current user's cart |

Navigation service: `POST /api/path_image` with `{ "items": [[x, y], ...] }` → returns a PNG route map.

---

## 🛠️ Tech stack

**Frontend:** React, Vite, React Router, Tailwind CSS, axios, react-hot-toast, lucide-react
**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt (PostgreSQL variant available)
**Navigation:** Python, Flask, pytmx, pygame, Pillow
