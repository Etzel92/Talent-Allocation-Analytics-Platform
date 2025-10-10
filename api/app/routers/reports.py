import csv
from io import StringIO
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import Float, cast, func
from sqlalchemy.orm import Session

from app.db.models import Employee
from app.db.session import get_db
from app.core.deps import get_current_user
from app.routers.employees import apply_filters

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    dependencies=[Depends(get_current_user)],
)

DbSess = Annotated[Session, Depends(get_db)]

_ALLOWED_BY = {
    "gender",
    "city",
    "education",
    "payment_tier",
    "joining_year",
    "ever_benched",
    "leave_or_not",
}

# ---------- DISTRIBUTION ----------
@router.get("/distribution")
def distribution(
    dimension: str | None = None,
    by: str | None = None,
    city: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    education: str | None = None,
    payment_tier: int | None = None,
    joining_year: int | None = None,
    ever_benched: str | None = None,
    leave_or_not: int | None = None,
    db: DbSess = None,
):
    # Acepta ?dimension=Gender o ?by=gender
    key = (by or dimension or "gender").strip().lower()
    if key not in _ALLOWED_BY:
        raise HTTPException(status_code=400, detail="dimension inválida")

    col = getattr(Employee, key)
    q = db.query(col.label("label"), func.count(Employee.id).label("count"))

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

    rows = q.group_by(col).order_by(col).all()
    total = sum(int(c) for _, c in rows)

    return {
        "dimension": key,
        "total": total,
        "items": [{"label": str(lbl), "count": int(cnt)} for lbl, cnt in rows],
    }

# ---------- EXPORT ----------
@router.get("/export")
def export_csv(
    city: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    education: str | None = None,
    payment_tier: int | None = None,
    joining_year: int | None = None,
    ever_benched: str | None = None,
    leave_or_not: int | None = None,
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
    cols = [
        "id",
        "education",
        "joining_year",
        "city",
        "payment_tier",
        "age",
        "gender",
        "ever_benched",
        "years_experience",
        "leave_or_not",
    ]

    def stream():
        buf = StringIO()
        w = csv.DictWriter(buf, fieldnames=cols)
        w.writeheader()
        for e in q.all():
            w.writerow({k: getattr(e, k) for k in cols})
        yield buf.getvalue()

    return StreamingResponse(
        stream(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="employees_export.csv"'},
    )

# ---------- LEAVE PROBABILITY ----------
@router.get("/leave_probability")
def leave_probability(
    city: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    education: str | None = None,
    payment_tier: int | None = None,
    joining_year: int | None = None,
    ever_benched: str | None = None,
    leave_or_not: int | None = None,
    db: DbSess = None,
):
    """
    Predicción baseline: probabilidad empírica de abandono
    = promedio de leave_or_not (0/1) en el conjunto filtrado.
    """
    base_q = db.query(Employee)
    base_q = apply_filters(
        base_q,
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
    count = base_q.count()

    avg_q = db.query(func.avg(cast(Employee.leave_or_not, Float)))
    avg_q = apply_filters(
        avg_q,
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
    prob = avg_q.scalar() or 0.0
    return {"count": count, "leave_prob": round(float(prob), 3)}

# ---------- CORRELATION ----------
@router.get("/correlation")
def correlation(
    db: DbSess,
    city: str | None = None,
    gender: str | None = None,
    age_min: int | None = None,
    age_max: int | None = None,
    education: str | None = None,
    payment_tier: int | None = None,
    joining_year: int | None = None,
    ever_benched: str | None = None,
    leave_or_not: int | None = None,
):
    q = db.query(Employee.years_experience.label("x"), Employee.payment_tier.label("y"))
    q = apply_filters(
        q, city, gender, age_min, age_max, education, payment_tier, joining_year, ever_benched, leave_or_not
    )
    rows = q.limit(5000).all()
    return [{"x": int(x or 0), "y": int(y or 0)} for x, y in rows]
