from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func
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
        # antes: igualdad estricta; mejor coincidencia flexible
        q = q.filter(Employee.education.ilike(f"%{education}%"))
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
    response: Response,
    city: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    education: str | None = None,
    payment_tier: int | None = None,
    joining_year: int | None = None,
    ever_benched: str | None = None,
    leave_or_not: int | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(100000, ge=1, le=100000),  # ← adiós 1000 fijo, ahora configurable
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
    )

    # total con filtros aplicados (sin límite)
    total = q.with_entities(func.count()).scalar()

    # pagina resultados
    items = q.order_by(Employee.joining_year.desc()).offset(offset).limit(limit).all()

    # expón el total para el front (nuestro front ya lo lee si está)
    response.headers["X-Total-Count"] = str(total)

    return items
