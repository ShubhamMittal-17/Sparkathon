// ---------------------------------------------------------------------------
// Content-based "similar items" recommender
// ---------------------------------------------------------------------------
// Given a query product, score every other product by how *similar* it is,
// using only features we already store on the product (no user history / no
// ratings matrix needed). This is a classic CONTENT-BASED recommender:
//
//   score = w_cat * categorySim   // same category?           (Jaccard over tags)
//         + w_txt * titleSim      // similar words in name?    (Jaccard over title tokens)
//         + w_prc * priceSim      // similar price band?       (normalized price distance)
//         + w_pop * popularity    // tie-breaker toward proven sellers
//
// Every term is normalized to [0,1] and the weights sum to 1, so the final
// score is itself in [0,1] and directly comparable across catalogs.
//
// Design notes for the curious (and for interviews):
//  - Content-based (not collaborative filtering) => works from day one with
//    zero purchase history, so there's no cold-start problem for new users.
//  - The scorer is a PURE function of (query, candidate, stats). No DB, no I/O.
//    That makes it trivial to unit-test and to reason about. server.js just
//    feeds it rows and sorts the output.
//  - We return a per-signal breakdown ("reasons") so the recommendation is
//    EXPLAINABLE: you can tell the shopper *why* an item was suggested.
// ---------------------------------------------------------------------------

// Tiny stopword list so generic words don't create false "similarity".
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "with", "for", "of", "to", "in", "on",
  "pro", "plus", "new", "premium",
]);

/** Lowercase, strip punctuation, split into meaningful tokens. */
function tokenize(text) {
  if (!text) return new Set();
  const tokens = String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  return new Set(tokens);
}

/** Jaccard similarity between two sets: |A ∩ B| / |A ∪ B|, in [0,1]. */
function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const DEFAULT_WEIGHTS = {
  category: 0.5, // "similar item" mostly means "same kind of thing"
  title: 0.3, // then: does the name overlap? (headphones ~ earbuds won't, but that's honest)
  price: 0.15, // then: is it in the same price band?
  popularity: 0.05, // gentle nudge toward items that actually sell
};

/**
 * Pre-compute catalog-wide stats used to normalize per-item signals.
 * Called once per request, not per candidate.
 */
export function computeStats(products) {
  const prices = products.map((p) => Number(p.price) || 0);
  const sold = products.map((p) => Number(p?.count?.total_sold) || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  return {
    // Guard against a divide-by-zero when every product costs the same.
    priceRange: Math.max(maxPrice - minPrice, 1),
    maxSold: Math.max(...sold, 1),
  };
}

/**
 * Similarity of `candidate` to `query`, in [0,1], plus a per-signal breakdown.
 * Pure function — same inputs always give the same output.
 */
export function scoreSimilarity(query, candidate, stats, weights = DEFAULT_WEIGHTS) {
  const categorySim = jaccard(tokenize(query.tags), tokenize(candidate.tags));
  const titleSim = jaccard(tokenize(query.title), tokenize(candidate.title));

  const priceDelta = Math.abs((Number(query.price) || 0) - (Number(candidate.price) || 0));
  const priceSim = 1 - Math.min(priceDelta / stats.priceRange, 1);

  const popularity = (Number(candidate?.count?.total_sold) || 0) / stats.maxSold;

  const score =
    weights.category * categorySim +
    weights.title * titleSim +
    weights.price * priceSim +
    weights.popularity * popularity;

  return {
    score,
    reasons: { categorySim, titleSim, priceSim, popularity },
  };
}

/**
 * Rank `allProducts` by similarity to the product identified by `queryId`
 * (matched on either `_id` or `product_id`) and return the top `limit`.
 * The query product itself is excluded.
 */
export function getSimilar(queryId, allProducts, limit = 4, weights = DEFAULT_WEIGHTS) {
  const idOf = (p) => String(p._id ?? p.product_id);
  const query = allProducts.find((p) => idOf(p) === String(queryId));
  if (!query) return [];

  const stats = computeStats(allProducts);

  return allProducts
    .filter((p) => idOf(p) !== idOf(query))
    .map((p) => {
      const { score, reasons } = scoreSimilarity(query, p, stats, weights);
      return { product: p, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
