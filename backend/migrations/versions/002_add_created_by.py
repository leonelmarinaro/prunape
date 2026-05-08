"""Agregar columna created_by a patients y assessments

Revision ID: 002
Revises: 001
Create Date: 2026-05-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("patients", sa.Column("created_by", sa.String(200), nullable=True))
    op.add_column("assessments", sa.Column("created_by", sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column("assessments", "created_by")
    op.drop_column("patients", "created_by")
