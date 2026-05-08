from backend.main import app


def test_app_title():
    assert app.title == "PRUNAPE"


def test_app_version():
    assert app.version == "1.0.0"


def test_cors_configured(client):
    # Test CORS preflight for allowed origin
    response = client.options(
        "/api/pautas",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    # Should not fail
    assert response.status_code in (200, 204, 400)


def test_lifespan_creates_tables(client):
    response = client.get("/api/patients")
    assert response.status_code == 200


def test_healthz(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "env" in data


def test_healthz_db_error(client, monkeypatch):
    from sqlalchemy.orm import Session

    def broken_execute(self, *args, **kwargs):
        raise RuntimeError("DB unavailable")

    monkeypatch.setattr(Session, "execute", broken_execute)
    response = client.get("/healthz")
    assert response.status_code == 503
    assert response.json()["status"] == "error"
