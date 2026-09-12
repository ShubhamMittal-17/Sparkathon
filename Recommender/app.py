"""
Recommender microservice -- a thin Flask REST wrapper around TfidfRecommender.

The storefront (or the Node API) calls this service; the ranking logic lives
here and can evolve independently of the Node.js application layer.

Endpoints
---------
GET  /health                     -> liveness + how many products are indexed
GET  /similar/<product_id>?limit=N  -> top-N similar products with cosine scores
POST /reindex                    -> rebuild the TF-IDF index (after a refresh)

Catalog source
--------------
On startup it tries to pull the live catalog from the Node products API
(CATALOG_API, default http://localhost:5000/all-products). If that is
unreachable it falls back to the bundled catalog.json snapshot, so the service
always starts -- useful for offline demos.
"""

import json
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from recommender import TfidfRecommender

HERE = os.path.dirname(os.path.abspath(__file__))
CATALOG_API = os.environ.get("CATALOG_API", "http://localhost:5000/all-products")
PORT = int(os.environ.get("PORT", 5002))

app = Flask(__name__)
CORS(app)

recommender = None  # built at startup by load_catalog()


def _normalize(raw):
    """Accept either the bundled snapshot shape or the Node /all-products shape."""
    products = raw.get("products", raw) if isinstance(raw, dict) else raw
    normalized = []
    for p in products:
        normalized.append({
            # product_id drives the recommender; _id / product_img are carried
            # through untouched so the storefront can render the cards.
            "product_id": str(p.get("product_id") or p.get("_id")),
            "_id": p.get("_id"),
            "title": p.get("title", ""),
            "tags": p.get("tags", ""),
            "des": p.get("des", ""),
            "price": p.get("price", 0),
            "product_img": p.get("product_img", ""),
        })
    return normalized


def load_catalog():
    """Pull the catalog from the products API, else fall back to the snapshot."""
    global recommender
    products = None
    try:
        import urllib.request

        with urllib.request.urlopen(CATALOG_API, timeout=3) as resp:
            products = _normalize(json.loads(resp.read().decode("utf-8")))
            print(f">> Loaded {len(products)} products from {CATALOG_API}")
    except Exception as err:
        print(f">> Catalog API unavailable ({err}); using bundled catalog.json")
        with open(os.path.join(HERE, "catalog.json"), encoding="utf-8") as f:
            products = _normalize(json.load(f))

    recommender = TfidfRecommender(products)
    return len(products)


@app.route("/health")
def health():
    n = len(recommender.products) if recommender else 0
    return jsonify({"status": "ok", "indexed_products": n})


@app.route("/similar/<product_id>")
def similar(product_id):
    limit = min(int(request.args.get("limit", 4)), 20)
    results = recommender.similar(product_id, limit=limit)
    if not results:
        return jsonify({"error": "Product not found or no similar items."}), 404
    return jsonify({
        "similar": [
            {**r["product"], "similarity": r["similarity"]} for r in results
        ]
    })


@app.route("/reindex", methods=["POST"])
def reindex():
    count = load_catalog()
    return jsonify({"status": "reindexed", "indexed_products": count})


if __name__ == "__main__":
    load_catalog()
    print(f">>> Recommender service starting on port {PORT}...")
    app.run(port=PORT, debug=True)
