from pydantic import BaseModel, field_validator
from decimal import Decimal
from datetime import date
from typing import Optional
from app.models.transaction import TxType


class TxIn(BaseModel):
    amount: Decimal
    type: TxType
    category: str
    date: date
    note: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def positive(cls, v):
        if v <= 0:
            raise ValueError("amount must be positive")
        return v

    @field_validator("date")
    @classmethod
    def not_future(cls, v):
        if v > date.today():
            raise ValueError("date must not be in the future")
        return v


class TxOut(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    type: TxType
    category: str
    date: date
    note: Optional[str]
    is_deleted: bool

    model_config = {"from_attributes": True}


class TxUpdate(BaseModel):
    amount: Optional[Decimal] = None
    type: Optional[TxType] = None
    category: Optional[str] = None
    date: Optional[date] = None
    note: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("amount must be positive")
        return v

    @field_validator("date")
    @classmethod
    def not_future(cls, v):
        if v is not None and v > date.today():
            raise ValueError("date must not be in the future")
        return v
