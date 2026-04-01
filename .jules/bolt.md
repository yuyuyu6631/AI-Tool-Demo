## 2024-05-13 - [Performance] Hoist static local data outside React components
**Learning:** This AI toolbox app heavily relies on static JSON datasets. If static arrays/objects derived from these imports are mapped or sliced inside the component, they are unnecessarily recreated on every render.
**Action:** When a static JSON import is merely mapped or subsetted with fixed criteria, define the resulting variable outside the React component.
