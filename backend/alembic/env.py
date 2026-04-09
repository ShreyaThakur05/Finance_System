from logging.config import fileConfig
from sqlalchemy import create_engine, pool, text
from alembic import context
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import Base
from app.core.config import cfg
import app.models  # noqa: F401

alembic_cfg = context.config
if alembic_cfg.config_file_name:
    fileConfig(alembic_cfg.config_file_name)

target_metadata = Base.metadata
DB_URL = cfg.DATABASE_URL


def run_migrations_offline():
    context.configure(
        url=DB_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    kw = {"check_same_thread": False} if "sqlite" in DB_URL else {}
    engine = create_engine(DB_URL, connect_args=kw, poolclass=pool.NullPool)
    with engine.begin() as conn:
        context.configure(connection=conn, target_metadata=target_metadata)
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
