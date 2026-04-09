import pytest

BASE = "/api/v1/auth"


@pytest.fixture(scope="module")
def tokens(client):
    client.post(f"{BASE}/register", json={"name": "Test Admin", "email": "tadmin@test.com", "password": "Pass@1234"})
    r = client.post(f"{BASE}/login", json={"email": "tadmin@test.com", "password": "Pass@1234"})
    return r.json()


def test_register(client):
    r = client.post(f"{BASE}/register", json={"name": "Alice", "email": "alice@test.com", "password": "Pass@1234"})
    assert r.status_code == 201
    assert r.json()["email"] == "alice@test.com"


def test_register_duplicate(client):
    client.post(f"{BASE}/register", json={"name": "Bob", "email": "bob@test.com", "password": "Pass@1234"})
    r = client.post(f"{BASE}/register", json={"name": "Bob", "email": "bob@test.com", "password": "Pass@1234"})
    assert r.status_code == 400


def test_login_success(client):
    client.post(f"{BASE}/register", json={"name": "Carol", "email": "carol@test.com", "password": "Pass@1234"})
    r = client.post(f"{BASE}/login", json={"email": "carol@test.com", "password": "Pass@1234"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password(client):
    r = client.post(f"{BASE}/login", json={"email": "alice@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_refresh(client, tokens):
    r = client.post(f"{BASE}/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_refresh_invalid(client):
    r = client.post(f"{BASE}/refresh", json={"refresh_token": "bad.token.here"})
    assert r.status_code == 401


def test_logout(client):
    r = client.post(f"{BASE}/logout")
    assert r.status_code == 200
