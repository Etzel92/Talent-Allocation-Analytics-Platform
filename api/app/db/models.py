import enum

from sqlalchemy import Column, Integer, String
from sqlalchemy import Enum as SAEnum

from app.db.base import Base


# ---- Roles de usuario ----
class RoleEnum(str, enum.Enum):
    HR = "HR"
    MANAGER = "MANAGER"
    ANALYST = "ANALYST"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False, default=RoleEnum.HR)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"


# ---- Employees alineado a tu CSV (Employee.csv) ----
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Columnas reales del CSV:
    education = Column(String(64), nullable=False)  # Education
    joining_year = Column(Integer, nullable=False)  # JoiningYear
    city = Column(String(64), nullable=False)  # City
    payment_tier = Column(Integer, nullable=False)  # PaymentTier (1/2/3)
    age = Column(Integer, nullable=False)  # Age
    gender = Column(String(16), nullable=False)  # Gender
    ever_benched = Column(String(8), nullable=False)  # EverBenched ("Yes"/"No")
    years_experience = Column(Integer, nullable=False)  # ExperienceInCurrentDomain
    leave_or_not = Column(Integer, nullable=False)  # LeaveOrNot (0/1)

    def __repr__(self) -> str:
        return f"<Employee id={self.id} city={self.city} tier={self.payment_tier}>"
