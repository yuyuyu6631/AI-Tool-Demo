## 2024-05-20 - React Router Lazy Loading
**Learning:** React Router 7's `lazy` property on routes can be used to dramatically reduce initial bundle sizes by dynamically importing page components.
**Action:** When adding new routes or optimizing existing ones with large components, use `lazy: () => import('./path').then(m => ({ Component: m.default }))` instead of standard imports to improve load times via code splitting.
