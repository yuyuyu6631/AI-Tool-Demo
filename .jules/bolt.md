## 2023-10-27 - Hoisting derived variables and maps for static JSON

**Learning:** This codebase relies heavily on static JSON files imported at the module level. Doing `.find` or `.filter` on these arrays within React component render methods turns static data lookups into expensive O(N) operations that run on every render.

**Action:** Whenever using static JSON data in this app, hoist derived arrays (like slices) outside the component. More importantly, create `Map` instances (`new Map(data.map(item => [item.slug, item]))`) at the module level and use them inside the component for O(1) lookups instead of `.find()` or `.filter()`.
