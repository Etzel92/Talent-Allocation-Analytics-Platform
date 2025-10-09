import os

import jwt
import pandas as pd
from fastapi import APIRouter, Depends, Header, HTTPException, Query

router = APIRouter(prefix="/employees", tags=["employees"])

DF = pd.read_csv(os.path.join(os.path.dirname(__file__), "..", "..", "data", "Employee.csv"))


def get_user_role(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    payload = jwt.decode(
        token, os.getenv("JWT_SECRET", "dev"), algorithms=[os.getenv("JWT_ALG", "HS256")]
    )
    return payload.get("role", "ANALYST")


@router.get("")
def list_employees(
    role: str = Depends(get_user_role),
    city: str | None = None,
    gender: str | None = None,
    min_age: int | None = Query(None, ge=0),
    max_age: int | None = Query(None, ge=0),
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    df = DF.copy()
    if city:
        df = df[df["City"].str.contains(city, case=False, na=False)]
    if gender:
        df = df[df["Gender"].str.lower() == gender.lower()]
    if min_age is not None:
        df = df[df["Age"] >= min_age]
    if max_age is not None:
        df = df[df["Age"] <= max_age]
    if q:  # búsqueda simple en Name/Role/Skills
        mask = (
            df["Name"].str.contains(q, case=False, na=False)
            | df.get("Role", "").astype(str).str.contains(q, case=False, na=False)
            | df.get("Skills", "").astype(str).str.contains(q, case=False, na=False)
        )
        df = df[mask]
    total = len(df)
    return {"total": total, "items": df.iloc[offset : offset + limit].to_dict(orient="records")}
