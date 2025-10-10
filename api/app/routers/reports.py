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
    "age",  # habilitar Age en /distribution
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
    db: DbSess = None,  # <-- ver nota abajo si prefieres sin default
):
    # Nota: si quieres forzar inyección estricta, cambia a: db: DbSess
    key = (by or dimension or "gender").strip().lower()
    if key not in _ALLOWED_BY:
        raise HTTPException(status_code=400, detail="dimension inválida")

    col = getattr(Employee, key)
    q = db.query(col.label("key"), func.count(Employee.id).label("count"))
    q = apply_filters(
        q, city, gender, age_min, age_max, education, payment_tier,
        joining_year, ever_benched, leave_or_not
    )
    rows = q.group_by(col).order_by(col).all()
    # Respuesta plana para consumir directo en Recharts:
    return [{"key": str(r.key), "count": int(r.count)} for r in rows]

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
    db: DbSess = None,  # idem nota de inyección
):
    q = db.query(Employee)
    q = apply_filters(
        q, city, gender, age_min, age_max, education, payment_tier,
        joining_year, ever_benched, leave_or_not
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
        "experience_in_current_domain",  # <-- FIX: nombre correcto en el modelo
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
    db: DbSess = None,  # idem
):
    """
    Baseline: probabilidad empírica de abandono = avg(leave_or_not)
    """
    avg_q = db.query(func.avg(cast(Employee.leave_or_not, Float)))
    avg_q = apply_filters(
        avg_q, city, gender, age_min, age_max, education, payment_tier,
        joining_year, ever_benched, leave_or_not
    )
    prob = avg_q.scalar() or 0.0
    return {"probability": round(float(prob), 4)}

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
    # Detecta la columna de experiencia que realmente existe en tu modelo
    exp_attr = None
    for cand in ("experience_in_current_domain", "years_experience", "experience"):
        if hasattr(Employee, cand):
            exp_attr = getattr(Employee, cand)
            break
    if exp_attr is None:
        raise HTTPException(status_code=500, detail="No se encontró columna de experiencia")

    # Castea a float para evitar strings/decimales que Recharts no dibuja
    x_col = cast(exp_attr, Float).label("x")
    y_col = cast(Employee.payment_tier, Float).label("y")

    q = db.query(x_col, y_col)
    q = apply_filters(
        q, city, gender, age_min, age_max, education,
        payment_tier, joining_year, ever_benched, leave_or_not
    )
    # Filtra nulos
    q = q.filter(exp_attr.isnot(None), Employee.payment_tier.isnot(None))
    rows = q.all()

    return [{"x": float(r.x), "y": float(r.y)} for r in rows]
