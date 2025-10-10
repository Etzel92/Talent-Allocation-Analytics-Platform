# api/app/db/models.py
import enum
from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from app.db.base import Base

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

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 👇 nombres EXACTOS que existen hoy en tu SQLite
    education = Column("education", String(64), nullable=False)
    joining_year = Column("joining_year", Integer, nullable=False)
    city = Column("city", String(64), nullable=False)
    payment_tier = Column("payment_tier", Integer, nullable=False)
    age = Column("age", Integer, nullable=False)
    gender = Column("gender", String(16), nullable=False)
    ever_benched = Column("ever_benched", String(8), nullable=False)
    # atributo python = experience_in_current_domain, columna real = years_experience
    experience_in_current_domain = Column("years_experience", Integer, nullable=False)
    leave_or_not = Column("leave_or_not", Integer, nullable=False)

    # relaciones (si ya creaste estas tablas)
    skills = relationship("Skill", secondary="employee_skills", lazy="selectin")
    bench_events = relationship("BenchEvent", backref="employee",
                                order_by="BenchEvent.start_date.desc()", lazy="selectin")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True, index=True, nullable=False)

class EmployeeSkill(Base):
    __tablename__ = "employee_skills"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    __table_args__ = (UniqueConstraint("employee_id", "skill_id", name="uq_employee_skill"),)

class BenchEvent(Base):
    __tablename__ = "bench_events"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    reason = Column(String(120), nullable=True)
