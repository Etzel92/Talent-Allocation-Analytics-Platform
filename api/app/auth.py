import os
from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

USERS = {
    "hr@example.com": {"password": "hr123", "role": "HR"},
    "manager@example.com": {"password": "mgr123", "role": "MANAGER"},
    "analyst@example.com": {"password": "ana123", "role": "ANALYST"},
}


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    role: str


SECRET = os.getenv("JWT_SECRET", "dev")
ALG = os.getenv("JWT_ALG", "HS256")


@router.post("/login", response_model=LoginOut)
def login(body: LoginIn):
    u = USERS.get(body.email)
    if not u or u["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    payload = {"sub": body.email, "role": u["role"], "exp": datetime.utcnow() + timedelta(hours=8)}
    token = jwt.encode(payload, SECRET, algorithm=ALG)
    return {"access_token": token, "role": u["role"]}
