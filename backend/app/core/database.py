from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import cfg

engine = create_engine(
    cfg.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in cfg.DATABASE_URL else {},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass
