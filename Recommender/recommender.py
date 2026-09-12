"""
Content-based product recommender: TF-IDF over item metadata + cosine similarity.

This is the ranking core, deliberately kept free of any web framework so it can
be unit-tested and reused. The Flask app (app.py) is a thin REST wrapper around
a single TfidfRecommender instance; the demo script (demo.py) drives the same
class with no server at all.

How it works
------------
1. Each product becomes one text "document" built from its metadata (title,
   tags/category, description). Title and tags are repeated so the vectorizer
   weights them more heavily than the free-text description -- a simple form of
   field weighting.
2. TfidfVectorizer turns the corpus into an L2-normalized TF-IDF matrix:
       - TF-IDF = term frequency x inverse document frequency, so words that are
         common across the whole catalog (e.g. "electronics") count for less and
         distinctive words (e.g. "earbuds", "wireless") count for more.
       - sublinear_tf=True uses 1 + log(tf) instead of raw counts.
       - ngram_range=(1, 2) also indexes bigrams so phrases like
         "noise cancelling" carry signal.
3. Similarity between two items is the cosine of the angle between their TF-IDF
   vectors, in [0, 1]. Because the vectors are L2-normalized, cosine similarity
   is just their dot product -- computed for all pairs at once with
   linear_kernel, which is why lookups are O(1) against a precomputed matrix.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel


class TfidfRecommender:
    def __init__(self, products, title_weight=2, tag_weight=2):
        """
        products: list of dicts with keys product_id, title, tags, des.
        The weights control how many times the title / tags are repeated in the
        document, i.e. how much they dominate the free-text description.
        """
        self.products = list(products)
        self._index = {p["product_id"]: i for i, p in enumerate(self.products)}

        corpus = [self._document(p, title_weight, tag_weight) for p in self.products]

        # min_df=1 because the catalog is small; for a large catalog you would
        # raise it to drop ultra-rare tokens and shrink the vocabulary.
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            sublinear_tf=True,
            ngram_range=(1, 2),
            min_df=1,
        )
        self.tfidf = self.vectorizer.fit_transform(corpus)

        # Precompute the full item-item cosine-similarity matrix once. For big
        # catalogs you would skip this and compute one row on demand, or use an
        # approximate-nearest-neighbor index (e.g. FAISS) instead.
        self.similarity = linear_kernel(self.tfidf, self.tfidf)

    @staticmethod
    def _document(product, title_weight, tag_weight):
        title = (product.get("title") or "").strip()
        tags = (product.get("tags") or "").strip()
        des = (product.get("des") or "").strip()
        parts = [title] * title_weight + [tags] * tag_weight + [des]
        return " ".join(parts)

    def similar(self, product_id, limit=4):
        """Return the top-`limit` products most similar to `product_id`."""
        idx = self._index.get(product_id)
        if idx is None:
            return []

        scores = list(enumerate(self.similarity[idx]))
        scores.sort(key=lambda pair: pair[1], reverse=True)

        results = []
        for i, score in scores:
            if i == idx:
                continue  # skip the query product itself
            results.append({
                "product": self.products[i],
                "similarity": round(float(score), 4),
            })
            if len(results) >= limit:
                break
        return results
