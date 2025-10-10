"""skills + employee_skills + bench_events

Revision ID: 6a4332c874f9
Revises: 046583122091
Create Date: 2025-10-10 12:49:32.639985
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "6a4332c874f9"
down_revision: Union[str, None] = "046583122091"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # --- safety (dev): limpia restos si ya existían ---
    op.execute("DROP TABLE IF EXISTS bench_events")
    op.execute("DROP TABLE IF EXISTS employee_skills")
    op.execute("DROP TABLE IF EXISTS skills")

    # --- skills ---
    op.create_table(
        "skills",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(length=80), nullable=False, unique=True),
    )
    # (UNIQUE ya crea índice en SQLite)

    # --- employee_skills ---
def upgrade():
    # Renombra columnas existentes a las del CSV
    op.alter_column('employees', 'education',            new_column_name='Education')
    op.alter_column('employees', 'joining_year',         new_column_name='JoiningYear')
    op.alter_column('employees', 'city',                 new_column_name='City')
    op.alter_column('employees', 'payment_tier',         new_column_name='PaymentTier')
    op.alter_column('employees', 'age',                  new_column_name='Age')
    op.alter_column('employees', 'gender',               new_column_name='Gender')
    op.alter_column('employees', 'ever_benched',         new_column_name='EverBenched')
    op.alter_column('employees', 'years_experience',     new_column_name='ExperienceInCurrentDomain')
    op.alter_column('employees', 'leave_or_not',         new_column_name='LeaveOrNot')

def downgrade():
    op.alter_column('employees', 'LeaveOrNot',                 new_column_name='leave_or_not')
    op.alter_column('employees', 'ExperienceInCurrentDomain',  new_column_name='years_experience')
    op.alter_column('employees', 'EverBenched',                new_column_name='ever_benched')
    op.alter_column('employees', 'Gender',                     new_column_name='gender')
    op.alter_column('employees', 'Age',                        new_column_name='age')
    op.alter_column('employees', 'PaymentTier',                new_column_name='payment_tier')
    op.alter_column('employees', 'City',                       new_column_name='city')
    op.alter_column('employees', 'JoiningYear',                new_column_name='joining_year')
    op.alter_column('employees', 'Education',                  new_column_name='education')