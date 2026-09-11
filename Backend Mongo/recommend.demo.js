// Standalone demo of the content-based recommender — NO database required.
// Run:  node recommend.demo.js            (uses a few sample query products)
//       node recommend.demo.js P002       (similar items for one product_id)
//
// Handy for a live interview demo: it proves the algorithm works on the real
// catalog without needing Mongo running, and it prints the *why* behind each
// recommendation.
import { dummyProducts } from "./seed/products.data.js";
import { getSimilar } from "./recommend.js";

function show(queryId) {
  const query = dummyProducts.find((p) => p.product_id === queryId);
  if (!query) {
    console.log(`\n(no product with id ${queryId})`);
    return;
  }
  console.log(`\n🔎  Similar to  [${query.product_id}] ${query.title}`);
  console.log(`    tags="${query.tags}"  price=$${query.price}\n`);

  const results = getSimilar(queryId, dummyProducts, 4);
  for (const { product, score, reasons } of results) {
    const r = reasons;
    console.log(
      `   ${score.toFixed(3)}  ${product.title.padEnd(26)} $${String(product.price).padEnd(7)}` +
        `  [cat ${r.categorySim.toFixed(2)} | txt ${r.titleSim.toFixed(2)} | ` +
        `price ${r.priceSim.toFixed(2)} | pop ${r.popularity.toFixed(2)}]`
    );
  }
}

const arg = process.argv[2];
if (arg) {
  show(arg);
} else {
  // A spread that shows the signals doing different work.
  ["P001", "P002", "P005", "P013"].forEach(show);
  console.log("\n(tip: pass a product_id, e.g.  node recommend.demo.js P009)\n");
}
