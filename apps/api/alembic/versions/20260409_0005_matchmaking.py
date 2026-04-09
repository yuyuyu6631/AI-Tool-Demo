"""add matchmaking profile and usage tables

Revision ID: 20260409_0005
Revises: 20260408_0004
Create Date: 2026-04-09 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260409_0005"
down_revision = "20260408_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_match_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("bio", sa.String(length=512), nullable=False, server_default=""),
        sa.Column("is_matchmaking_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_match_profiles_is_matchmaking_enabled"), "user_match_profiles", ["is_matchmaking_enabled"], unique=False)
    op.create_index(op.f("ix_user_match_profiles_user_id"), "user_match_profiles", ["user_id"], unique=True)

    op.create_table(
        "user_tool_usages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tool_id", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False, server_default="manual"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tool_id"], ["tools.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "tool_id", name="uq_user_tool_usage"),
    )
    op.create_index(op.f("ix_user_tool_usages_tool_id"), "user_tool_usages", ["tool_id"], unique=False)
    op.create_index(op.f("ix_user_tool_usages_user_id"), "user_tool_usages", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_tool_usages_user_id"), table_name="user_tool_usages")
    op.drop_index(op.f("ix_user_tool_usages_tool_id"), table_name="user_tool_usages")
    op.drop_table("user_tool_usages")

    op.drop_index(op.f("ix_user_match_profiles_user_id"), table_name="user_match_profiles")
    op.drop_index(op.f("ix_user_match_profiles_is_matchmaking_enabled"), table_name="user_match_profiles")
    op.drop_table("user_match_profiles")
