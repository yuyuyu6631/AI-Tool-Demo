from __future__ import annotations

from app.db.session import SessionLocal
from app.services.catalog_service import refresh_search_index


def run() -> bool:
    session = SessionLocal()
    try:
        refreshed = refresh_search_index(session)
        print(f"Search index refreshed: {refreshed}")
        return refreshed
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(0 if run() else 1)
