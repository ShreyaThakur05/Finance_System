from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class Summary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    tx_count: int


class MonthlyItem(BaseModel):
    month: str
    income: Decimal
    expense: Decimal
    net: Decimal


class CategoryItem(BaseModel):
    category: str
    amount: Decimal
    percentage: float


class Insights(BaseModel):
    top_category: Optional[str]
    highest_expense_month: Optional[str]
    spending_change_pct: Optional[float]
    avg_daily_spend: Decimal
