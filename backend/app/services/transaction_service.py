import csv
import io
from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.transaction import Transaction
from app.models.audit import AuditLog
from app.schemas.transaction import TxIn, TxUpdate


def _audit(db: Session, uid: int, action: str, entity_id: int):
    db.add(AuditLog(user_id=uid, action=action, entity="transaction", entity_id=entity_id))


def create_tx(db: Session, data: TxIn, uid: int) -> Transaction:
    t = Transaction(**data.model_dump(), user_id=uid)
    db.add(t)
    db.flush()
    _audit(db, uid, "created", t.id)
    db.commit()
    db.refresh(t)
    return t


def list_tx(
    db: Session,
    page: int,
    limit: int,
    type: str | None,
    category: str | None,
    date_from: date | None,
    date_to: date | None,
    search: str | None,
) -> tuple[list[Transaction], int]:
    q = db.query(Transaction).filter(Transaction.is_deleted == False)
    if type:
        q = q.filter(Transaction.type == type)
    if category:
        q = q.filter(Transaction.category == category)
    if date_from:
        q = q.filter(Transaction.date >= date_from)
    if date_to:
        q = q.filter(Transaction.date <= date_to)
    if search:
        q = q.filter(or_(Transaction.note.ilike(f"%{search}%"), Transaction.category.ilike(f"%{search}%")))
    total = q.count()
    items = q.order_by(Transaction.date.desc()).offset((page - 1) * limit).limit(limit).all()
    return items, total


def get_tx(db: Session, tid: int) -> Transaction | None:
    return db.query(Transaction).filter(Transaction.id == tid, Transaction.is_deleted == False).first()


def update_tx(db: Session, t: Transaction, data: TxUpdate, uid: int) -> Transaction:
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(t, k, v)
    _audit(db, uid, "updated", t.id)
    db.commit()
    db.refresh(t)
    return t


def delete_tx(db: Session, t: Transaction, uid: int):
    t.is_deleted = True
    _audit(db, uid, "deleted", t.id)
    db.commit()


def export_csv(db: Session) -> str:
    rows = db.query(Transaction).filter(Transaction.is_deleted == False).all()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "amount", "type", "category", "date", "note"])
    for t in rows:
        w.writerow([t.id, t.amount, t.type, t.category, t.date, t.note])
    return buf.getvalue()
