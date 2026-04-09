from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.deps import get_db, require_role
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.user import UserOut, UserPatch
from app.services import user_service as svc

router = APIRouter(tags=["users & admin"])
admin = Depends(require_role("admin"))


@router.get("/users", response_model=list[UserOut], summary="List all users (admin)")
def list_users(db: Session = Depends(get_db), _=admin):
    return svc.list_users(db)


@router.get("/users/{uid}", response_model=UserOut, summary="Get user by ID (admin)")
def get_user(uid: int, db: Session = Depends(get_db), _=admin):
    u = svc.get_by_id(db, uid)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.patch("/users/{uid}", response_model=UserOut, summary="Update user role or status (admin)")
def patch_user(uid: int, data: UserPatch, db: Session = Depends(get_db), _=admin):
    u = svc.get_by_id(db, uid)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return svc.patch_user(db, u, role=data.role, is_active=data.is_active)


@router.delete("/users/{uid}", summary="Deactivate user (admin, soft delete)")
def deactivate(uid: int, db: Session = Depends(get_db), _=admin):
    u = svc.get_by_id(db, uid)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    svc.patch_user(db, u, is_active=False)
    return {"success": True, "message": "User deactivated"}


@router.get("/admin/audit-logs", summary="Paginated audit logs (admin)")
def audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=admin,
):
    q = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    total = q.count()
    items = q.offset((page - 1) * limit).limit(limit).all()
    data = [
        {"id": a.id, "user_id": a.user_id, "action": a.action, "entity": a.entity, "entity_id": a.entity_id, "timestamp": str(a.timestamp)}
        for a in items
    ]
    return {"success": True, "data": data, "meta": {"page": page, "limit": limit, "total": total}, "message": "ok"}
