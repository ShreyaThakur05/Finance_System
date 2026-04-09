import pytest
from datetime import date

BASE = "/api/v1/transactions"
AUTH = "/api/v1/auth"


def reg_login(client, email, role="viewer"):
    from app.tests.conftest import TestSession
    from app.models.user import User, Role
    from app.core.security import hash_pw
    db = TestSession()
    u = db.query(User).filter(User.email == email).first()
    if not u:
        u = User(name=email, email=email, hashed_password=hash_pw("Pass@1234"), role=Role[role])
        db.add(u)
        db.commit()
    db.close()
    r = client.post(f"{AUTH}/login", json={"email": email, "password": "Pass@1234"})
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token(client):
    return reg_login(client, "tx_admin@test.com", "admin")


@pytest.fixture(scope="module")
def viewer_token(client):
    return reg_login(client, "tx_viewer@test.com", "viewer")


@pytest.fixture(scope="module")
def analyst_token(client):
    return reg_login(client, "tx_analyst@test.com", "analyst")


def auth(token):
    return {"Authorization": f"Bearer {token}"}


TX_PAYLOAD = {"amount": 100.00, "type": "expense", "category": "Food", "date": str(date.today()), "note": "lunch"}


def test_create_as_admin(client, admin_token):
    r = client.post(BASE + "/", json=TX_PAYLOAD, headers=auth(admin_token))
    assert r.status_code == 201
    assert r.json()["category"] == "Food"


def test_create_as_viewer_forbidden(client, viewer_token):
    r = client.post(BASE + "/", json=TX_PAYLOAD, headers=auth(viewer_token))
    assert r.status_code == 403


def test_list(client, viewer_token):
    r = client.get(BASE + "/", headers=auth(viewer_token))
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_get_one(client, admin_token):
    r = client.post(BASE + "/", json=TX_PAYLOAD, headers=auth(admin_token))
    tid = r.json()["id"]
    r2 = client.get(f"{BASE}/{tid}", headers=auth(admin_token))
    assert r2.status_code == 200


def test_update_as_admin(client, admin_token):
    r = client.post(BASE + "/", json=TX_PAYLOAD, headers=auth(admin_token))
    tid = r.json()["id"]
    r2 = client.put(f"{BASE}/{tid}", json={"amount": 200.00}, headers=auth(admin_token))
    assert r2.status_code == 200
    assert float(r2.json()["amount"]) == 200.00


def test_update_as_viewer_forbidden(client, viewer_token, admin_token):
    r = client.post(BASE + "/", json=TX_PAYLOAD, headers=auth(admin_token))
    tid = r.json()["id"]
    r2 = client.put(f"{BASE}/{tid}", json={"amount": 50.00}, headers=auth(viewer_token))
    assert r2.status_code == 403


def test_delete_as_admin(client, admin_token):
    r = client.post(BASE + "/", json=TX_PAYLOAD, headers=auth(admin_token))
    tid = r.json()["id"]
    r2 = client.delete(f"{BASE}/{tid}", headers=auth(admin_token))
    assert r2.status_code == 200
    r3 = client.get(f"{BASE}/{tid}", headers=auth(admin_token))
    assert r3.status_code == 404


def test_invalid_amount(client, admin_token):
    r = client.post(BASE + "/", json={**TX_PAYLOAD, "amount": -10}, headers=auth(admin_token))
    assert r.status_code == 422


def test_future_date(client, admin_token):
    r = client.post(BASE + "/", json={**TX_PAYLOAD, "date": "2099-01-01"}, headers=auth(admin_token))
    assert r.status_code == 422


def test_csv_export_analyst(client, analyst_token):
    r = client.get(f"{BASE}/export/csv", headers=auth(analyst_token))
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]


def test_csv_export_viewer_forbidden(client, viewer_token):
    r = client.get(f"{BASE}/export/csv", headers=auth(viewer_token))
    assert r.status_code == 403
