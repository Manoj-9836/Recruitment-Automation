"""Add password_hash column to users table

Revision ID: 001_add_password_hash
Revises: 5a268bf2965d
Create Date: 2026-03-20 10:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_password_hash'
down_revision = '5a268bf2965d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add password_hash column to users table
    op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=False, server_default=''))
    # Remove server default after adding the column
    op.alter_column('users', 'password_hash', server_default=None)


def downgrade() -> None:
    # Drop password_hash column
    op.drop_column('users', 'password_hash')
