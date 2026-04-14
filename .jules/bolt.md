## 2024-04-09 - Pre-computing static JSON arrays
**Learning:** Found redundant O(N log N) sorting and O(N) searching logic on every render and API call because data comes from static JSON files.
**Action:** Always pre-compute derived arrays and maps from static JSON imports at the module level.
