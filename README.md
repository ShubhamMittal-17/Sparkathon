# 🛒 Sparkathon — Smart In-Store Shopping Assistant

A smart shopping web app that turns an online cart into an **optimal in-store walking route** and surfaces **content-based product recommendations**. Built for a Walmart Sparkathon-style challenge.

The big idea: you build your cart online, and the app computes the shortest path through the physical store to collect every item and leave fast rendered as a live, arrow-by-arrow map over the store floor plan. Alongside it, a recommender suggests similar products so you discover what you need without wandering.

---

## ✨ Features

- **Optimal in-store navigation** — A\* shortest-path + a Traveling-Salesman visit order turn your shopping list into the fastest route, rendered as an annotated map image.
- **Content-based recommendations** — a standalone Python service ranks products by **TF-IDF + cosine similarity** over item metadata, exposed as a top-N `/similar/:id` endpoint the storefront calls per product.
- **Product catalog** — browse products with infinite scroll; ranking defaults to best-sellers.
- **Auth + cart** — JWT-based sign up / sign in (bcrypt-hashed passwords) and a per-user persistent cart.

---

## 🏗️ Architecture

Four services communicating over HTTP:

```
 React (Vite) frontend ──HTTP/JSON──▶  Node/Express + MongoDB   (auth, products, cart)
        │                                     │
        │                                     └──proxy──▶ Python recommender (TF-IDF + cosine → top-N)
        │
        └──────HTTP (POST items)─────▶  Python/Flask microservice (navigation: A* + TSP → PNG map)
```

The ML/compute-heavy pieces are split into standalone Python services: the
**recommender** (TF-IDF vectorisation + cosine similarity, scikit-learn) and the
**navigation** engine (A\* + TSP, pygame/pytmx rendering). Keeping ranking logic
in its own service lets it evolve independently of the Node application layer;
the Node API simply proxies `/similar` to it and falls back to a lightweight
in-process scorer if the service is down.

---

## 📁 Repository layout

| Folder | What it is |
|---|---|
| `Frontend/` | React + Vite + Tailwind single-page app |
| `Backend Mongo/` | Express + MongoDB API (auth, products, cart; proxies `/similar`) — **primary backend** |
| `Backend_Postgres/` | Alternative Express + PostgreSQL backend (prototype) |
| `Recommender/` | Python/Flask microservice: TF-IDF + cosine-similarity recommender |
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

### Recommendations (`Recommender/`)
A **content-based** recommender (no user history required → no cold-start), served as a standalone Python/Flask microservice:

1. Each product becomes a text **document** from its metadata (title + tags + description), with title/tags repeated so they carry more weight.
2. **`TfidfVectorizer`** (scikit-learn) builds an L2-normalised **TF-IDF** matrix — `sublinear_tf`, English stop-words, unigrams + bigrams — so distinctive words (e.g. "earbuds", "wireless") count more than catalog-wide ones ("electronics").
3. **Cosine similarity** between TF-IDF vectors ranks items; the top-N are returned with their scores.

The Node API proxies `GET /similar/:id` to this service and degrades to a lightweight in-process scorer (`Backend Mongo/recommend.js`) if it is unavailable.

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

### 2. Recommender service (Python + scikit-learn)
```bash
cd Recommender
pip install -r requirements.txt
python demo.py                    # no-server demo: prints top-N + cosine scores
python demo.py P009               # similar items for one product
python app.py                     # starts the REST service on http://localhost:5002
```
On startup the service pulls the catalog from the Node products API and falls back to the bundled `catalog.json` snapshot if that is unreachable.

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
**Recommender:** Python, Flask, scikit-learn (TF-IDF + cosine similarity)
**Navigation:** Python, Flask, pytmx, pygame, Pillow
