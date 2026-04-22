from app.services.embedding_service import STUB_MODEL, STUB_PROVIDER, embed_text


def test_embed_text_forces_stub_backend_in_pytest(monkeypatch):
    def fail_if_called(*_args, **_kwargs):
        raise AssertionError("remote embedding should not be called in pytest")

    monkeypatch.setattr("app.services.embedding_service._request_remote_embedding", fail_if_called)

    result = embed_text("presentation assistant")

    assert result.provider == STUB_PROVIDER
    assert result.model == STUB_MODEL
    assert result.vector
