import csv
from io import StringIO
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import Float, cast, func
from sqlalchemy.orm import Session

from app.db.models import Employee, Skill, EmployeeSkill, BenchEvent
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
    "age",
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
    return [{"key": str(r.key), "count": int(r.count)} for r in rows]

# ---------- EXPORT (empleados completos) ----------
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
        q, city, gender, age_min, age_max, education, payment_tier,
        joining_year, ever_benched, leave_or_not
    ).order_by(Employee.id.asc()).execution_options(stream_results=True)

    cols = [
        "id",
        "education",
        "joining_year",
        "city",
        "payment_tier",
        "age",
        "gender",
        "ever_benched",
        "experience_in_current_domain",
        "leave_or_not",
    ]

    def stream():
        buf = StringIO()
        w = csv.DictWriter(buf, fieldnames=cols)
        w.writeheader()
        yield buf.getvalue(); buf.seek(0); buf.truncate(0)

        # stream por chunks ~64KB
        for i, e in enumerate(q.yield_per(1000), 1):
            w.writerow({k: getattr(e, k) for k in cols})
            if buf.tell() > 64 * 1024:
                yield buf.getvalue()
                buf.seek(0); buf.truncate(0)
        # flush final
        rem = buf.getvalue()
        if rem:
            yield rem

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
    avg_q = db.query(func.avg(cast(Employee.leave_or_not, Float)))
    avg_q = apply_filters(
        avg_q, city, gender, age_min, age_max, education, payment_tier,
        joining_year, ever_benched, leave_or_not
    )
    prob = avg_q.scalar() or 0.0
    return {"probability": round(float(prob), 4)}

# ---------- CORRELATION (experiencia vs tier) ----------
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
    limit: int = 5000,
):
    exp_attr = None
    for cand in ("experience_in_current_domain", "years_experience", "experience"):
        if hasattr(Employee, cand):
            exp_attr = getattr(Employee, cand)
            break
    if exp_attr is None:
        raise HTTPException(status_code=500, detail="No se encontró columna de experiencia")

    x_col = cast(exp_attr, Float).label("x")
    y_col = cast(Employee.payment_tier, Float).label("y")

    q = db.query(x_col, y_col)
    q = apply_filters(
        q, city, gender, age_min, age_max, education,
        payment_tier, joining_year, ever_benched, leave_or_not
    ).filter(exp_attr.isnot(None), Employee.payment_tier.isnot(None)) \
     .execution_options(stream_results=True)

    rows = q.limit(limit).all()
    return [{"x": float(r.x), "y": float(r.y)} for r in rows]

# ---------- EXPORTS TEMÁTICOS ----------
@router.get("/export_preset")
def export_preset(
    kind: str,  # "diversity" | "attrition" | "talent"
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
    kind = (kind or "").lower()
    base = db.query(Employee)
    base = apply_filters(base, city, gender, age_min, age_max, education,
                         payment_tier, joining_year, ever_benched, leave_or_not)

    buf = StringIO()
    w = csv.writer(buf)

    if kind == "diversity":
        w.writerow(["dimension", "label", "count"])
        for colname in ("gender", "age", "city", "education"):
            col = getattr(Employee, colname)
            for lbl, cnt in base.with_entities(col, func.count(Employee.id))\
                                .group_by(col).order_by(col).all():
                w.writerow([colname, lbl, int(cnt)])

    elif kind == "attrition":
        w.writerow(["metric", "value"])
        total = base.with_entities(func.count()).scalar() or 0
        leave = base.filter(Employee.leave_or_not == 1)\
                    .with_entities(func.count()).scalar() or 0
        stay = total - leave
        prob = round(leave / total, 4) if total else 0.0
        for k, v in (("total", total), ("leave", leave), ("stay", stay),
                     ("leave_probability", prob)):
            w.writerow([k, v])

    elif kind == "talent":
        w.writerow(["metric", "label", "count"])
        sk = (db.query(Skill.name, func.count(EmployeeSkill.employee_id))
                .join(EmployeeSkill, Skill.id == EmployeeSkill.skill_id)
                .group_by(Skill.name)
                .order_by(func.count().desc()).limit(50).all())
        for name, cnt in sk:
            w.writerow(["skill", name, int(cnt)])
        be = db.query(func.count(BenchEvent.id)).scalar() or 0
        w.writerow(["bench_events", "total", int(be)])
    else:
        raise HTTPException(status_code=400, detail="kind inválido")

    def stream():
        yield buf.getvalue()

    return StreamingResponse(
        stream(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{kind}_report.csv"'},
    )
