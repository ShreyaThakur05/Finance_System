from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.analytics import Summary, MonthlyItem, CategoryItem, Insights
from app.schemas.transaction import TxOut
from app.services import analytics_service as svc

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=Summary, summary="Total income, expenses, balance, count")
def get_summary(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return svc.summary(db, date_from, date_to)


@router.get("/recent", response_model=list[TxOut], summary="Last 10 transactions")
def get_recent(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return svc.recent(db)


@router.get("/monthly", response_model=list[MonthlyItem], summary="Monthly income/expense for last 12 months (analyst+)")
def get_monthly(db: Session = Depends(get_db), _: User = Depends(require_role("analyst", "admin"))):
    return svc.monthly(db)


@router.get("/categories", response_model=list[CategoryItem], summary="Spending breakdown by category (analyst+)")
def get_categories(db: Session = Depends(get_db), _: User = Depends(require_role("analyst", "admin"))):
    return svc.categories(db)


@router.get("/insights", response_model=Insights, summary="Computed spending insights (analyst+)")
def get_insights(db: Session = Depends(get_db), _: User = Depends(require_role("analyst", "admin"))):
    return svc.insights(db)
