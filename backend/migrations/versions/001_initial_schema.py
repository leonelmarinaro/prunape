"""Esquema inicial: patients, assessments, assessment_items

Revision ID: 001
Revises:
Create Date: 2026-05-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("birth_date", sa.Date, nullable=False),
        sa.Column("gestational_age_weeks", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_table(
        "assessments",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column(
            "patient_id",
            sa.Integer,
            sa.ForeignKey("patients.id"),
            nullable=False,
        ),
        sa.Column("assessment_date", sa.Date, nullable=False),
        sa.Column("chronological_age", sa.Float, nullable=False),
        sa.Column("corrected_age", sa.Float, nullable=True),
        sa.Column("result", sa.String(10), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_table(
        "assessment_items",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column(
            "assessment_id",
            sa.Integer,
            sa.ForeignKey("assessments.id"),
            nullable=False,
        ),
        sa.Column("pauta_id", sa.Integer, nullable=False),
        sa.Column("pauta_name", sa.String(200), nullable=False),
        sa.Column("area", sa.String(50), nullable=False),
        sa.Column("pauta_type", sa.String(5), nullable=False),
        sa.Column("passed", sa.Boolean, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("assessment_items")
    op.drop_table("assessments")
    op.drop_table("patients")
