import pytest


class _DummyPool:
    def __init__(self) -> None:
        self.disconnected = False

    def disconnect(self) -> None:
        self.disconnected = True


class _DummyRedis:
    def get(self, _: str) -> str:
        raise TimeoutError("redis timeout")


@pytest.fixture(autouse=True)
def restore_cache_service_state():
    from app.services import cache_service

    original_pool = cache_service._redis_pool
    original_client = cache_service._redis_client
    original_retry_after = cache_service._redis_retry_after

    try:
        yield
    finally:
        cache_service._redis_pool = original_pool
        cache_service._redis_client = original_client
        cache_service._redis_retry_after = original_retry_after


def test_mark_redis_unavailable_resets_cached_client_and_starts_cooldown(monkeypatch):
    from app.services import cache_service

    dummy_pool = _DummyPool()
    cache_service._redis_pool = dummy_pool
    cache_service._redis_client = _DummyRedis()

    monkeypatch.setattr(cache_service.time, "monotonic", lambda: 123.0)

    cache_service.mark_redis_unavailable(TimeoutError("redis timeout"))

    assert dummy_pool.disconnected is True
    assert cache_service._redis_pool is None
    assert cache_service._redis_client is None
    assert cache_service._redis_retry_after == 153.0


def test_get_redis_client_skips_reconnect_during_cooldown(monkeypatch):
    from app.services import cache_service

    cache_service._redis_pool = None
    cache_service._redis_client = None
    cache_service._redis_retry_after = 50.0

    monkeypatch.setattr(cache_service.time, "monotonic", lambda: 40.0)

    assert cache_service.get_redis_client() is None
