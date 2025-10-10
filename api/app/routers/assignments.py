from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import Employee, Skill, EmployeeSkill
from app.core.deps import get_current_user

router = APIRouter(prefix="/assignments", tags=["assignments"], dependencies=[Depends(get_current_user)])

@router.get("/search")
def search(
    experience_min: Optional[int] = None,
    experience_max: Optional[int] = None,
    city: Optional[str] = None,
    education: Optional[str] = None,
    skills: Optional[str] = Query(None, description="CSV de skills"),
    limit: int = Query(100000, ge=1, le=100000),
    db: Session = Depends(get_db),
):
    q = db.query(Employee)
    if experience_min is not None:
        q = q.filter(Employee.experience_in_current_domain >= experience_min)
    if experience_max is not None:
        q = q.filter(Employee.experience_in_current_domain <= experience_max)
    if city:
        q = q.filter(Employee.city == city)
    if education:
        q = q.filter(Employee.education.ilike(f"%{education}%"))

    skill_names = [s.strip() for s in skills.split(",")] if skills else []
    if skill_names:
        # ANY / OR por defecto
        sub = (
            db.query(EmployeeSkill.employee_id)
              .join(Skill, Skill.id == EmployeeSkill.skill_id)
              .filter(Skill.name.in_(skill_names))
              .distinct()
        )
        q = q.filter(Employee.id.in_(sub))

    rows = q.order_by(Employee.experience_in_current_domain.desc()).limit(limit).all()
    return [
        {
            "id": e.id,
            "city": e.city,
            "education": e.education,
            "experience": e.experience_in_current_domain,
            "payment_tier": e.payment_tier,
        }
        for e in rows
    ]