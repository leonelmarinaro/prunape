import base64
from unittest.mock import MagicMock

import httpx
import pytest
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwt as jose_jwt

from backend.security import clerk_auth


# ── Helpers ────────────────────────────────────────────────────────────────────


def _generate_rsa_keypair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    return private_key


def _public_key_to_jwk(private_key, kid: str = "test-key-1") -> dict:
    pub_numbers = private_key.public_key().public_numbers()

    def _int_to_b64url(n: int) -> str:
        length = (n.bit_length() + 7) // 8
        b = n.to_bytes(length, byteorder="big")
        return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

    return {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "kid": kid,
        "n": _int_to_b64url(pub_numbers.n),
        "e": _int_to_b64url(pub_numbers.e),
    }


def _sign_jwt(private_key, payload: dict, kid: str = "test-key-1") -> str:
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
    return jose_jwt.encode(payload, pem, algorithm="RS256", headers={"kid": kid})


# ── _fetch_jwks (función real con httpx) ──────────────────────────────────────


def test_fetch_jwks_calls_httpx(monkeypatch):
    fake_resp = MagicMock()
    fake_resp.json.return_value = {"keys": []}
    monkeypatch.setattr(httpx, "get", lambda url, **kwargs: fake_resp)
    clerk_auth._fetch_jwks.cache_clear()
    result = clerk_auth._fetch_jwks("https://test.example/.well-known/jwks.json")
    assert result == {"keys": []}
    clerk_auth._fetch_jwks.cache_clear()


# ── Dev mode (CLERK_JWKS_URL vacío) ───────────────────────────────────────────


def test_dev_mode_no_token_returns_200(client):
    response = client.get("/api/patients")
    assert response.status_code == 200


def test_dev_mode_invalid_bearer_returns_200(client):
    response = client.get("/api/patients", headers={"Authorization": "Bearer notajwt"})
    assert response.status_code == 200


def test_dev_mode_valid_hs256_bearer_extracts_claims(client):
    token = jose_jwt.encode(
        {"sub": "user_123", "email": "doctor@garrahan.ar"}, "secret", algorithm="HS256"
    )
    response = client.get("/api/patients", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


# ── Prod mode (CLERK_JWKS_URL seteado) ────────────────────────────────────────


@pytest.fixture()
def prod_settings(monkeypatch):
    monkeypatch.setattr(
        clerk_auth.settings,
        "CLERK_JWKS_URL",
        "https://fake.clerk.dev/.well-known/jwks.json",
    )
    clerk_auth._fetch_jwks.cache_clear()
    yield


def test_prod_mode_no_token_returns_401(client, prod_settings):
    response = client.get("/api/patients")
    assert response.status_code == 401


def test_prod_mode_kid_not_in_jwks_returns_401(client, prod_settings, monkeypatch):
    monkeypatch.setattr(clerk_auth, "_fetch_jwks", lambda url: {"keys": []})
    private_key = _generate_rsa_keypair()
    token = _sign_jwt(private_key, {"sub": "u1", "email": "x@x.com"}, kid="missing-kid")
    response = client.get("/api/patients", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_prod_mode_malformed_token_returns_401(client, prod_settings, monkeypatch):
    private_key = _generate_rsa_keypair()
    jwk = _public_key_to_jwk(private_key)
    monkeypatch.setattr(clerk_auth, "_fetch_jwks", lambda url: {"keys": [jwk]})
    response = client.get(
        "/api/patients", headers={"Authorization": "Bearer garbage.token.here"}
    )
    assert response.status_code == 401


def test_prod_mode_valid_token_no_email_returns_403(client, prod_settings, monkeypatch):
    private_key = _generate_rsa_keypair()
    jwk = _public_key_to_jwk(private_key)
    monkeypatch.setattr(clerk_auth, "_fetch_jwks", lambda url: {"keys": [jwk]})
    token = _sign_jwt(private_key, {"sub": "user_without_email"})
    response = client.get("/api/patients", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_prod_mode_valid_token_with_email_returns_200(
    client, prod_settings, monkeypatch
):
    private_key = _generate_rsa_keypair()
    jwk = _public_key_to_jwk(private_key)
    monkeypatch.setattr(clerk_auth, "_fetch_jwks", lambda url: {"keys": [jwk]})
    token = _sign_jwt(private_key, {"sub": "user_123", "email": "medico@garrahan.ar"})
    response = client.get("/api/patients", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_prod_mode_created_by_stored_on_create(client, prod_settings, monkeypatch):
    private_key = _generate_rsa_keypair()
    jwk = _public_key_to_jwk(private_key)
    monkeypatch.setattr(clerk_auth, "_fetch_jwks", lambda url: {"keys": [jwk]})
    token = _sign_jwt(
        private_key, {"sub": "clerk_user_abc", "email": "medico@garrahan.ar"}
    )
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/patients",
        json={"name": "Pedro Test", "birth_date": "2020-01-01"},
        headers=headers,
    )
    assert response.status_code == 201
