from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.schemas.auth import RegisterIn
from app.core.security import hash_pw


def create_user(db: Session, data: RegisterIn) -> User:
    role = Role(data.role) if data.role in [r.value for r in Role] else Role.viewer
    u = User(name=data.name, email=data.email, hashed_password=hash_pw(data.password), role=role)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_by_id(db: Session, uid: int) -> User | None:
    return db.query(User).filter(User.id == uid).first()


def list_users(db: Session) -> list[User]:
    return db.query(User).all()


def patch_user(db: Session, u: User, **kwargs) -> User:
    for k, v in kwargs.items():
        if v is not None:
            setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u
