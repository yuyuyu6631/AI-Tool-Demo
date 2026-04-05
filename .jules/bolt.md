## 2024-04-05 - O(1) Map Lookups for Static JSON

**Learning:** This codebase relies heavily on static JSON array imports. React component renders iterate with `O(N)` methods like `.find` and `O(N*M)` methods like `.filter` combined with `.includes` when selecting derived values (like specific tools from a list of strings). This can cause measurable performance bottlenecks as the JSON grows.

**Action:** Consistently extract and hoist static JSON data into Maps (e.g., `new Map(toolsData.map(t => [t.slug, t]))`) outside of React components for `O(1)` performance and to prevent constant recalculations during every render cycle.
