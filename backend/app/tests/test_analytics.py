import pytest
from datetime import date

AUTH = "/api/v1/auth"
BASE = "/api/v1/analytics"


def reg_login(client, email, role):
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
def admin_tok(client):
    return reg_login(client, "an_admin@test.com", "admin")


@pytest.fixture(scope="module")
def viewer_tok(client):
    return reg_login(client, "an_viewer@test.com", "viewer")


@pytest.fixture(scope="module")
def analyst_tok(client):
    return reg_login(client, "an_analyst@test.com", "analyst")


def h(t):
    return {"Authorization": f"Bearer {t}"}


def test_summary_viewer(client, viewer_tok):
    r = client.get(f"{BASE}/summary", headers=h(viewer_tok))
    assert r.status_code == 200
    assert "total_income" in r.json()


def test_recent_viewer(client, viewer_tok):
    r = client.get(f"{BASE}/recent", headers=h(viewer_tok))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_monthly_analyst(client, analyst_tok):
    r = client.get(f"{BASE}/monthly", headers=h(analyst_tok))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_monthly_viewer_forbidden(client, viewer_tok):
    r = client.get(f"{BASE}/monthly", headers=h(viewer_tok))
    assert r.status_code == 403


def test_categories_analyst(client, analyst_tok):
    r = client.get(f"{BASE}/categories", headers=h(analyst_tok))
    assert r.status_code == 200


def test_categories_viewer_forbidden(client, viewer_tok):
    r = client.get(f"{BASE}/categories", headers=h(viewer_tok))
    assert r.status_code == 403


def test_insights_admin(client, admin_tok):
    r = client.get(f"{BASE}/insights", headers=h(admin_tok))
    assert r.status_code == 200
    data = r.json()
    assert "avg_daily_spend" in data


def test_insights_viewer_forbidden(client, viewer_tok):
    r = client.get(f"{BASE}/insights", headers=h(viewer_tok))
    assert r.status_code == 403
