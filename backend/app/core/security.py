from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import cfg

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_pw(plain: str) -> str:
    return pwd.hash(plain)


def verify_pw(plain: str, hashed: str) -> bool:
    return pwd.verify(plain, hashed)


def make_token(sub: str, kind: str, email: str = None, role: str = None) -> str:
    exp = (
        timedelta(minutes=cfg.ACCESS_TOKEN_EXPIRE_MINUTES)
        if kind == "access"
        else timedelta(days=cfg.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    payload = {
        "sub": sub,
        "kind": kind,
        "exp": datetime.now(timezone.utc) + exp,
    }
    if kind == "access" and email and role:
        payload.update({"email": email, "role": role})
    return jwt.encode(payload, cfg.SECRET_KEY, algorithm=cfg.ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, cfg.SECRET_KEY, algorithms=[cfg.ALGORITHM])