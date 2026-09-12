"""
Standalone demo of the TF-IDF + cosine-similarity recommender -- no server, no DB.

Run:  python demo.py            # a few sample query products
      python demo.py P009       # similar items for one product_id

Handy for a live demo: proves the ranking works on the real catalog and prints
the cosine similarity behind every recommendation.
"""

import json
import os
import sys

from recommender import TfidfRecommender

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "catalog.json"), encoding="utf-8") as f:
    catalog = json.load(f)

recommender = TfidfRecommender(catalog)
by_id = {p["product_id"]: p for p in catalog}


def show(query_id):
    query = by_id.get(query_id)
    if not query:
        print(f"\n(no product with id {query_id})")
        return
    print(f"\nSimilar to  [{query['product_id']}] {query['title']}")
    print(f"    tags=\"{query['tags']}\"  price=${query['price']}\n")
    for r in recommender.similar(query_id, limit=4):
        p = r["product"]
        print(f"   {r['similarity']:.4f}  {p['title']:<26} ${p['price']:<7}  tags=\"{p['tags']}\"")


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    if arg:
        show(arg)
    else:
        for pid in ["P001", "P002", "P005", "P013"]:
            show(pid)
        print("\n(tip: pass a product_id, e.g.  python demo.py P009)\n")
