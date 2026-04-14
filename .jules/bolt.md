## 2025-04-11 - Route-Level Code Splitting Impact
**Learning:** In typical React Router DOM apps, putting all pages inside a single `import` structure statically bundles all pages together. Using the `lazy` property inside `createBrowserRouter` easily triggers Vite to split each page component into a separate chunk.
**Action:** Use `lazy` and `import()` natively within `createBrowserRouter` to achieve significant chunk size reductions early on in performance tuning.
