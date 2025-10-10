from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated, List
from app.db.session import get_db
from app.db.models import Skill
from app.core.deps import get_current_user

DbSess = Annotated[Session, Depends(get_db)]
router = APIRouter(prefix="/skills", tags=["skills"], dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[dict])
def list_skills(db: DbSess):
    rows = db.query(Skill).order_by(Skill.name).all()
    return [{"id": s.id, "name": s.name} for s in rows]
