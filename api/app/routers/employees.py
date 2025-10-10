from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import Employee
from app.db.session import get_db
from app.schemas import EmployeeOut

router = APIRouter(prefix="/employees", tags=["employees"])

# Alias tipado para la sesión con Depends (evita B008)
DbSess = Annotated[Session, Depends(get_db)]


def apply_filters(
    q,
    city: str | None,
    gender: str | None,
    age_min: int | None,
    age_max: int | None,
    education: str | None,
    payment_tier: int | None,
    joining_year: int | None,
    ever_benched: str | None,
    leave_or_not: int | None,
):
    if city:
        q = q.filter(Employee.city == city)
    if gender:
        q = q.filter(Employee.gender == gender)
    if age_min is not None:
        q = q.filter(Employee.age >= age_min)
    if age_max is not None:
        q = q.filter(Employee.age <= age_max)
    if education:
        q = q.filter(Employee.education == education)
    if payment_tier is not None:
        q = q.filter(Employee.payment_tier == payment_tier)
    if joining_year is not None:
        q = q.filter(Employee.joining_year == joining_year)
    if ever_benched:
        q = q.filter(Employee.ever_benched == ever_benched)
    if leave_or_not is not None:
        q = q.filter(Employee.leave_or_not == leave_or_not)
    return q


@router.get("", response_model=list[EmployeeOut])
def list_employees(
    city: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    education: str | None = None,
    payment_tier: int | None = None,
    joining_year: int | None = None,
    ever_benched: str | None = None,
    leave_or_not: int | None = None,
    db: DbSess = None,  # <- antes: Session = Depends(get_db)
):
    q = db.query(Employee)
    q = apply_filters(
        q,
        city,
        gender,
        age_min,
        age_max,
        education,
        payment_tier,
        joining_year,
        ever_benched,
        leave_or_not,
    )
    return q.limit(1000).all()
