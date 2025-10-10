from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Employee, RoleEnum
from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.schemas import EmployeeOut
from pydantic import BaseModel

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    dependencies=[Depends(get_current_user)],
)

DbSess = Annotated[Session, Depends(get_db)]


def apply_filters(
    q,
    city: Optional[str],
    gender: Optional[str],
    age_min: Optional[int],
    age_max: Optional[int],
    education: Optional[str],
    payment_tier: Optional[int],
    joining_year: Optional[int],
    ever_benched: Optional[str],
    leave_or_not: Optional[int],
    experience_min: Optional[int] = None,
    experience_max: Optional[int] = None,
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
        q = q.filter(Employee.education.ilike(f"%{education}%"))
    if payment_tier is not None:
        q = q.filter(Employee.payment_tier == payment_tier)
    if joining_year is not None:
        q = q.filter(Employee.joining_year == joining_year)
    if ever_benched:
        q = q.filter(Employee.ever_benched == ever_benched)
    if leave_or_not is not None:
        q = q.filter(Employee.leave_or_not == leave_or_not)
    if experience_min is not None:
        q = q.filter(Employee.experience_in_current_domain >= experience_min)
    if experience_max is not None:
        q = q.filter(Employee.experience_in_current_domain <= experience_max)
    return q


@router.get("", response_model=List[EmployeeOut])
def list_employees(
    response: Response,
    city: Optional[str] = None,
    gender: Optional[str] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    education: Optional[str] = None,
    payment_tier: Optional[int] = None,
    joining_year: Optional[int] = None,
    ever_benched: Optional[str] = None,
    leave_or_not: Optional[int] = None,
    experience_min: Optional[int] = None,
    experience_max: Optional[int] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(100000, ge=1, le=100000),
    db: DbSess = None,
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
        experience_min,
        experience_max,
    )

    total = q.with_entities(func.count()).scalar()
    items = (
        q.order_by(Employee.joining_year.desc(), Employee.id.desc())
         .offset(offset).limit(limit).all()
    )
    response.headers["X-Total-Count"] = str(total)
    return items


class EmployeeCreate(BaseModel):
    education: str
    joining_year: int
    city: str
    payment_tier: int
    age: int
    gender: str
    ever_benched: str  # "Yes" | "No"
    experience_in_current_domain: int
    leave_or_not: int  # 0 | 1


@router.post(
    "",
    response_model=EmployeeOut,
    dependencies=[Depends(require_roles(RoleEnum.HR, RoleEnum.MANAGER))],
)
def create_employee(payload: EmployeeCreate, db: DbSess):
    obj = Employee(
        education=payload.education,
        joining_year=payload.joining_year,
        city=payload.city,
        payment_tier=payload.payment_tier,
        age=payload.age,
        gender=payload.gender,
        ever_benched=payload.ever_benched,
        experience_in_current_domain=payload.experience_in_current_domain,
        leave_or_not=payload.leave_or_not,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj