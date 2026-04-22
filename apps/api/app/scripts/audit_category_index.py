from __future__ import annotations

import json

from app.db.session import SessionLocal
from app.services.catalog_service import audit_category_index


def main() -> None:
    db = SessionLocal()
    try:
        report = audit_category_index(db=db)
    finally:
        db.close()

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
