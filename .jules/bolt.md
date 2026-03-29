## 2024-05-18 - [Optimize Local Data Lookups]
 **Learning:** In an architecture that relies heavily on local JSON datasets (like `src/data/tools.json` and `src/data/scenarios.json`), components frequently performing `Array.find` or `Array.filter` + `Array.includes` on these datasets during render can become a significant bottleneck as the data size grows.
 **Action:** Pre-compute O(1) lookup Maps (`new Map(data.map(item => [item.slug, item]))`) outside the React component's render cycle for datasets that are static or rarely change, avoiding O(N) or O(N*M) operations on every render.
