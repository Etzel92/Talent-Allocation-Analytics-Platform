from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.db.models import User
from app.db.session import get_db
from app.schemas import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["auth"])

DbSess = Annotated[Session, Depends(get_db)]


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: DbSess):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    role_str = getattr(user.role, "value", str(user.role))
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer", "role": role_str}
