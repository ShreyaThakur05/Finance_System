from decimal import Decimal
from datetime import date, timedelta
from calendar import month_abbr
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.transaction import Transaction, TxType
from app.schemas.analytics import Summary, MonthlyItem, CategoryItem, Insights


def _active(db: Session):
    return db.query(Transaction).filter(Transaction.is_deleted == False)


def summary(db: Session, date_from: date = None, date_to: date = None) -> Summary:
    q = _active(db)
    if date_from:
        q = q.filter(Transaction.date >= date_from)
    if date_to:
        q = q.filter(Transaction.date <= date_to)
    inc = q.filter(Transaction.type == TxType.income).with_entities(func.sum(Transaction.amount)).scalar() or Decimal(0)
    exp = q.filter(Transaction.type == TxType.expense).with_entities(func.sum(Transaction.amount)).scalar() or Decimal(0)
    cnt = q.count()
    return Summary(total_income=inc, total_expenses=exp, net_balance=inc - exp, tx_count=cnt)


def monthly(db: Session) -> list[MonthlyItem]:
    today = date.today()
    result = []
    for i in range(11, -1, -1):
        d = date(today.year, today.month, 1) - timedelta(days=i * 28)
        yr, mo = d.year, d.month
        q = _active(db).filter(extract("year", Transaction.date) == yr, extract("month", Transaction.date) == mo)
        inc = q.filter(Transaction.type == TxType.income).with_entities(func.sum(Transaction.amount)).scalar() or Decimal(0)
        exp = q.filter(Transaction.type == TxType.expense).with_entities(func.sum(Transaction.amount)).scalar() or Decimal(0)
        result.append(MonthlyItem(month=f"{month_abbr[mo]} {yr}", income=inc, expense=exp, net=inc - exp))
    return result


def categories(db: Session) -> list[CategoryItem]:
    rows = (
        _active(db)
        .filter(Transaction.type == TxType.expense)
        .with_entities(Transaction.category, func.sum(Transaction.amount).label("total"))
        .group_by(Transaction.category)
        .all()
    )
    grand = sum(r.total for r in rows) or Decimal(1)
    return [CategoryItem(category=r.category, amount=r.total, percentage=round(float(r.total / grand) * 100, 2)) for r in rows]


def insights(db: Session) -> Insights:
    today = date.today()
    cur_mo = date(today.year, today.month, 1)
    prev_mo_end = cur_mo - timedelta(days=1)
    prev_mo = date(prev_mo_end.year, prev_mo_end.month, 1)

    def mo_exp(start: date, end: date) -> Decimal:
        return (
            _active(db)
            .filter(Transaction.type == TxType.expense, Transaction.date >= start, Transaction.date <= end)
            .with_entities(func.sum(Transaction.amount))
            .scalar()
            or Decimal(0)
        )

    cur_exp = mo_exp(cur_mo, today)
    prev_exp = mo_exp(prev_mo, prev_mo_end)
    pct = float((cur_exp - prev_exp) / prev_exp * 100) if prev_exp else None

    top = (
        _active(db)
        .filter(Transaction.type == TxType.expense, Transaction.date >= cur_mo)
        .with_entities(Transaction.category, func.sum(Transaction.amount).label("t"))
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )

    best = (
        _active(db)
        .filter(Transaction.type == TxType.expense)
        .with_entities(
            extract("year", Transaction.date).label("y"),
            extract("month", Transaction.date).label("m"),
            func.sum(Transaction.amount).label("t"),
        )
        .group_by("y", "m")
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )

    days = (today - cur_mo).days + 1
    avg = cur_exp / days if days else Decimal(0)

    return Insights(
        top_category=top.category if top else None,
        highest_expense_month=f"{month_abbr[int(best.m)]} {int(best.y)}" if best else None,
        spending_change_pct=round(pct, 2) if pct is not None else None,
        avg_daily_spend=round(avg, 2),
    )


def recent(db: Session) -> list[Transaction]:
    return _active(db).order_by(Transaction.date.desc()).limit(10).all()
