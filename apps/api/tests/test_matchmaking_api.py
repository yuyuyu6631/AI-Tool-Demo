import json
import os
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

_TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test_matchmaking_api.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"
os.environ.setdefault("AUTH_SECRET_KEY", "test-auth-secret")
os.environ.setdefault("SESSION_COOKIE_NAME", "xingdianping_session")
os.environ.setdefault("COOKIE_SECURE", "false")

import app.db.session as session_mod  # noqa: E402
from app.db.session import Base  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models import models  # noqa: E402, F401
from app.models.models import Tool, ToolEmbedding, UserToolUsage  # noqa: E402

app = create_app()

_test_engine = create_engine(
    f"sqlite:///{_TEST_DB_PATH}",
    connect_args={"check_same_thread": False},
)
_TestSession = sessionmaker(bind=_test_engine, autoflush=False, autocommit=False, class_=Session)
_ORIGINAL_SESSION_LOCAL = session_mod.SessionLocal


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    session_mod.SessionLocal = _TestSession
    Base.metadata.create_all(bind=_test_engine)

    db = _TestSession()
    try:
        db.add_all(
            [
                Tool(
                    slug="tool-a",
                    name="Tool A",
                    category_name="助手",
                    summary="A summary",
                    description="A desc",
                    editor_comment="A",
                    official_url="https://example.com/a",
                    score=4.2,
                    status="published",
                    featured=False,
                    created_on=date(2026, 4, 1),
                    last_verified_at=date(2026, 4, 1),
                ),
                Tool(
                    slug="tool-b",
                    name="Tool B",
                    category_name="助手",
                    summary="B summary",
                    description="B desc",
                    editor_comment="B",
                    official_url="https://example.com/b",
                    score=4.0,
                    status="published",
                    featured=False,
                    created_on=date(2026, 4, 1),
                    last_verified_at=date(2026, 4, 1),
                ),
                Tool(
                    slug="tool-c",
                    name="Tool C",
                    category_name="助手",
                    summary="C summary",
                    description="C desc",
                    editor_comment="C",
                    official_url="https://example.com/c",
                    score=3.8,
                    status="published",
                    featured=False,
                    created_on=date(2026, 4, 1),
                    last_verified_at=date(2026, 4, 1),
                ),
            ]
        )
        db.commit()

        tools = {tool.slug: tool for tool in db.scalars(select(Tool)).all()}
        db.add_all(
            [
                ToolEmbedding(tool_id=tools["tool-b"].id, provider="stub", model="semantic", content_hash="b", source_text="", embedding_json=json.dumps([1.0, 0.0, 0.0])),
                ToolEmbedding(tool_id=tools["tool-c"].id, provider="stub", model="semantic", content_hash="c", source_text="", embedding_json=json.dumps([0.9, 0.1, 0.0])),
            ]
        )
        db.commit()
    finally:
        db.close()

    yield

    session_mod.SessionLocal = _ORIGINAL_SESSION_LOCAL
    Base.metadata.drop_all(bind=_test_engine)
    try:
        if os.path.exists(_TEST_DB_PATH):
            os.remove(_TEST_DB_PATH)
    except PermissionError:
        pass


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


def _register_and_login(client: TestClient, username: str, email: str) -> dict:
    register = client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "password123",
            "confirmPassword": "password123",
            "agreed": True,
        },
    )
    assert register.status_code == 201
    return register.json()


def test_unauthorized_requests_return_401(client: TestClient):
    response = client.get("/api/matchmaking/me")
    assert response.status_code == 401


def test_add_tool_is_idempotent_and_delete_missing_is_safe(client: TestClient):
    me = _register_and_login(client, "match-user-1", "match-user-1@example.com")

    tools = client.get("/api/tools").json()["items"]
    tool_a = next(item for item in tools if item["name"] == "Tool A")

    first_add = client.post("/api/matchmaking/me/tools", json={"toolId": tool_a["id"]})
    second_add = client.post("/api/matchmaking/me/tools", json={"toolId": tool_a["id"]})
    assert first_add.status_code == 200
    assert second_add.status_code == 200
    assert len(second_add.json()["tools"]) == 1

    delete_missing = client.delete("/api/matchmaking/me/tools/999999")
    assert delete_missing.status_code == 200

    with _TestSession() as db:
        rows = db.scalars(select(UserToolUsage).where(UserToolUsage.user_id == me["id"])).all()
        assert len(rows) == 1


def test_candidates_require_overlap_and_matchmaking_switch(client: TestClient):
    user_a = _register_and_login(client, "match-a", "match-a@example.com")
    tools = client.get("/api/tools").json()["items"]
    tool_by_name = {item["name"]: item for item in tools}

    client.post("/api/matchmaking/me/tools", json={"toolId": tool_by_name["Tool A"]["id"]})
    client.post("/api/matchmaking/me/tools", json={"toolId": tool_by_name["Tool B"]["id"]})
    client.put("/api/matchmaking/me", json={"bio": "I use A+B", "isMatchmakingEnabled": True})

    client_b = TestClient(app)
    _register_and_login(client_b, "match-b", "match-b@example.com")
    client_b.post("/api/matchmaking/me/tools", json={"toolId": tool_by_name["Tool A"]["id"]})
    client_b.post("/api/matchmaking/me/tools", json={"toolId": tool_by_name["Tool C"]["id"]})
    client_b.put("/api/matchmaking/me", json={"bio": "I use A+C", "isMatchmakingEnabled": True})

    client_c = TestClient(app)
    _register_and_login(client_c, "match-c", "match-c@example.com")
    client_c.post("/api/matchmaking/me/tools", json={"toolId": tool_by_name["Tool C"]["id"]})
    client_c.put("/api/matchmaking/me", json={"bio": "only C", "isMatchmakingEnabled": True})

    candidates = client.get("/api/matchmaking/me/candidates?limit=20")
    assert candidates.status_code == 200
    payload = candidates.json()
    assert len(payload) == 1
    assert payload[0]["username"] == "match-b"
    assert payload[0]["sharedTools"] == ["Tool A"]
    assert payload[0]["matchScore"] >= 100

    client_b.put("/api/matchmaking/me", json={"bio": "off", "isMatchmakingEnabled": False})
    no_candidates = client.get("/api/matchmaking/me/candidates?limit=20")
    assert no_candidates.status_code == 200
    assert no_candidates.json() == []


def test_profile_update_persists_bio_and_switch(client: TestClient):
    _register_and_login(client, "match-profile", "match-profile@example.com")
    updated = client.put("/api/matchmaking/me", json={"bio": "我用工具做播客剪辑", "isMatchmakingEnabled": True})
    assert updated.status_code == 200
    assert updated.json()["bio"] == "我用工具做播客剪辑"
    assert updated.json()["isMatchmakingEnabled"] is True

    read_back = client.get("/api/matchmaking/me")
    assert read_back.status_code == 200
    assert read_back.json()["bio"] == "我用工具做播客剪辑"
    assert read_back.json()["isMatchmakingEnabled"] is True
