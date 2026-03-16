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
    # If tables were created, we should be able to query patients
    response = client.get("/api/patients")
    assert response.status_code == 200
