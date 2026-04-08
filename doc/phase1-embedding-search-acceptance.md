# Phase 1 Embedding Search Acceptance

## Changed Files
- `apps/api/tests/test_catalog_cases.py`
- `apps/api/tests/test_backfill_tool_embeddings.py`

## Covered Checks
- `GET /api/tools?q=写作助手` returns writing-related tools
- `GET /api/tools?q=幻灯片` returns semantic hit `gamma`
- deleting part of `tool_embeddings` still preserves lexical fallback
- empty `q` keeps default `/api/tools` behavior
- embedding recall exceptions still fall back to lexical results
- backfill is idempotent across repeated runs
- backfill skips a single dirty row instead of failing the whole batch

## Commands And Results
- `pytest tests/test_catalog_cases.py -q`
- `pytest tests/test_backfill_tool_embeddings.py -q`

Latest local result:
- `20 passed` in `tests/test_catalog_cases.py`
- `2 passed` in `tests/test_backfill_tool_embeddings.py`

## Known Uncovered Risks
- API response still does not expose whether an item came from lexical recall or embedding recall
- hybrid recall inclusion is tested, but result-source explainability is still internal only
- final API ordering is still governed by existing `_sort_tools`, not by explicit recall-source ranking metadata
