from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.security import decode_token
from app.core.database import SessionLocal
from app.models.user import User

bearer = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    try:
        data = decode_token(creds.credentials)
        if data.get("kind") != "access":
            raise exc
    except JWTError:
        raise exc
    u = db.query(User).filter(User.id == int(data["sub"]), User.is_active == True).first()
    if not u:
        raise exc
    return u


def require_role(*roles: str):
    def dep(u: User = Depends(get_current_user)):
        if u.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return u
    return dep
