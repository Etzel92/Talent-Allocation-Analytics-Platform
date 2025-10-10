"""rename employees columns to CSV names

Revision ID: f04d43d460b3
Revises: 6a4332c874f9
Create Date: 2025-10-10 13:50:42.517117

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f04d43d460b3'
down_revision: Union[str, None] = '6a4332c874f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
