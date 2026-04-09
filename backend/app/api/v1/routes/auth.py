import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from jose import JWTError
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.deps import get_db
from app.core.security import verify_pw, make_token, decode_token
from app.schemas.auth import RegisterIn, LoginIn, TokenOut, RefreshIn
from app.schemas.user import UserOut
from app.services.user_service import create_user, get_by_email, get_by_id

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)
TESTING = os.getenv("TESTING", "0") == "1"


@router.post("/register", response_model=UserOut, status_code=201, summary="Register a new user")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if get_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, data)


def _do_login(data: LoginIn, db: Session) -> TokenOut:
    u = get_by_email(db, data.email)
    if not u or not verify_pw(data.password, u.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not u.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return TokenOut(
        access_token=make_token(str(u.id), "access", u.email, u.role.value),
        refresh_token=make_token(str(u.id), "refresh"),
    )


if TESTING:
    @router.post("/login", response_model=TokenOut, summary="Login and receive JWT tokens")
    def login(request: Request, data: LoginIn, db: Session = Depends(get_db)):
        return _do_login(data, db)
else:
    @router.post("/login", response_model=TokenOut, summary="Login and receive JWT tokens")
    @limiter.limit("5/minute")
    def login(request: Request, data: LoginIn, db: Session = Depends(get_db)):  # type: ignore[misc]
        return _do_login(data, db)


@router.post("/refresh", response_model=TokenOut, summary="Refresh access token")
def refresh(data: RefreshIn, db: Session = Depends(get_db)):
    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("kind") != "refresh":
            raise exc
    except JWTError:
        raise exc
    u = get_by_id(db, int(payload["sub"]))
    if not u or not u.is_active:
        raise exc
    return TokenOut(
        access_token=make_token(str(u.id), "access", u.email, u.role.value),
        refresh_token=make_token(str(u.id), "refresh"),
    )


@router.post("/logout", summary="Logout (client-side token discard)")
def logout():
    return {"success": True, "message": "Logged out"}