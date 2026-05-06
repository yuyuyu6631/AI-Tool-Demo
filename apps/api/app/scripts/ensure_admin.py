from __future__ import annotations

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.dev_admin_seed import ensure_admin_user, ensure_dev_admin_user


def run() -> None:
    if settings.is_production_like and not settings.admin_seed_enabled:
        print("Admin seed skipped: set ADMIN_SEED_ENABLED=true and ADMIN_SEED_PASSWORD to enable.")
        return

    with SessionLocal() as session:
        if settings.is_production_like:
            user = ensure_admin_user(
                session,
                username=settings.admin_seed_username,
                password=settings.admin_seed_password,
                email=settings.admin_seed_email,
            )
        else:
            user = ensure_dev_admin_user(session)
        session.commit()
        print(f"Admin ensured: {user.username} (id={user.id}).")


if __name__ == "__main__":
    run()
