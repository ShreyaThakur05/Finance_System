"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String, nullable=False),
        sa.Column("role", sa.Enum("viewer", "analyst", "admin", name="role"), nullable=False, server_default="viewer"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("type", sa.Enum("income", "expense", name="txtype"), nullable=False),
        sa.Column("category", sa.String, nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("note", sa.String, nullable=True),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, nullable=True),
        sa.Column("updated_at", sa.DateTime, nullable=True),
    )
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("action", sa.String, nullable=False),
        sa.Column("entity", sa.String, nullable=False),
        sa.Column("entity_id", sa.Integer, nullable=False),
        sa.Column("timestamp", sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("transactions")
    op.drop_table("users")
