from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
import io
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.transaction import TxIn, TxOut, TxUpdate
from app.services import transaction_service as svc

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _envelope(data, page, limit, total):
    return {"success": True, "data": data, "meta": {"page": page, "limit": limit, "total": total}, "message": "ok"}


def _err(msg):
    return {"success": False, "data": None, "message": msg}


@router.post("/", response_model=TxOut, status_code=201, summary="Create transaction (admin)")
def create(
    data: TxIn,
    db: Session = Depends(get_db),
    u: User = Depends(require_role("admin")),
):
    return svc.create_tx(db, data, u.id)


@router.get("/export/csv", summary="Export transactions as CSV (analyst, admin)")
def export(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("analyst", "admin")),
):
    content = svc.export_csv(db)
    return StreamingResponse(io.StringIO(content), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=transactions.csv"})


@router.get("/", summary="List transactions with filters and pagination")
def list_tx(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    category: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items, total = svc.list_tx(db, page, limit, type, category, date_from, date_to, search)
    return _envelope([TxOut.model_validate(t) for t in items], page, limit, total)


@router.get("/{tid}", response_model=TxOut, summary="Get single transaction")
def get_one(tid: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    t = svc.get_tx(db, tid)
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return t


@router.put("/{tid}", response_model=TxOut, summary="Update transaction (admin)")
def update(
    tid: int,
    data: TxUpdate,
    db: Session = Depends(get_db),
    u: User = Depends(require_role("admin")),
):
    t = svc.get_tx(db, tid)
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return svc.update_tx(db, t, data, u.id)


@router.delete("/{tid}", summary="Soft-delete transaction (admin)")
def delete(tid: int, db: Session = Depends(get_db), u: User = Depends(require_role("admin"))):
    t = svc.get_tx(db, tid)
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    svc.delete_tx(db, t, u.id)
    return {"success": True, "message": "Deleted"}
