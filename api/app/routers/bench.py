from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import Annotated, Optional, List
from app.db.session import get_db
from app.db.models import BenchEvent, Employee
from app.core.deps import get_current_user

DbSess = Annotated[Session, Depends(get_db)]
router = APIRouter(prefix="/bench", tags=["bench"], dependencies=[Depends(get_current_user)])

@router.get("/employees/{employee_id}/events")
def list_events(employee_id: int, db: DbSess):
    if not db.query(Employee.id).filter(Employee.id == employee_id).first():
        raise HTTPException(404, "Employee not found")
    rows = db.query(BenchEvent).filter(BenchEvent.employee_id == employee_id)\
            .order_by(BenchEvent.start_date.desc()).all()
    return [dict(id=r.id, start_date=r.start_date.isoformat(),
                 end_date=r.end_date.isoformat() if r.end_date else None,
                 reason=r.reason) for r in rows]

@router.post("/employees/{employee_id}/events")
def start_bench(employee_id: int, start_date: date, reason: Optional[str] = None, db: DbSess = None):
    ev = BenchEvent(employee_id=employee_id, start_date=start_date, end_date=None, reason=reason)
    db.add(ev); db.commit(); db.refresh(ev)
    return {"id": ev.id}

@router.patch("/events/{event_id}/end")
def end_bench(event_id: int, end_date: date, db: DbSess):
    ev = db.query(BenchEvent).get(event_id)
    if not ev:
        raise HTTPException(404, "Bench event not found")
    ev.end_date = end_date
    db.commit()
    return {"ok": True}
