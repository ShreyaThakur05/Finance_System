import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
from decimal import Decimal
import random
from app.core.database import SessionLocal
from app.core.security import hash_pw
from app.models.user import User, Role
from app.models.transaction import Transaction, TxType

CATEGORIES = ["Food", "Rent", "Salary", "Transport", "Entertainment", "Healthcare", "Shopping", "Utilities"]
PW = hash_pw("Test@1234")

USERS = [
    {"name": "Admin User", "email": "admin@fin.com", "role": Role.admin},
    {"name": "Analyst User", "email": "analyst@fin.com", "role": Role.analyst},
    {"name": "Viewer User", "email": "viewer@fin.com", "role": Role.viewer},
]

def rand_date(days_back: int) -> date:
    return date.today() - timedelta(days=random.randint(0, days_back))

def seed():
    db = SessionLocal()
    try:
        if db.query(User).count():
            print("Already seeded — skipping.")
            return

        users = []
        for u in USERS:
            obj = User(name=u["name"], email=u["email"], hashed_password=PW, role=u["role"])
            db.add(obj)
            users.append(obj)
        db.flush()

        txs = []
        for i in range(60):
            u = random.choice(users)
            is_income = random.random() < 0.3
            cat = "Salary" if is_income else random.choice([c for c in CATEGORIES if c != "Salary"])
            amt = Decimal(str(round(random.uniform(20, 3000 if is_income else 500), 2)))
            t = Transaction(
                user_id=u.id,
                amount=amt,
                type=TxType.income if is_income else TxType.expense,
                category=cat,
                date=rand_date(180),
                note=f"{'Income' if is_income else 'Expense'} #{i+1}",
            )
            db.add(t)
            txs.append(t)

        db.commit()
        print(f"Seeded {len(users)} users and {len(txs)} transactions.")
        for u in USERS:
            print(f"  {u['role'].value:8s}  {u['email']}  /  Test@1234")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
