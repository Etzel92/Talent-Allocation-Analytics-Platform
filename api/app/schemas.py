from typing import Optional

# Compatibilidad Pydantic v1/v2 con una base común
try:
    from pydantic import BaseModel, ConfigDict

    class ORMModel(BaseModel):
        model_config = ConfigDict(from_attributes=True)  # v2
except Exception:
    from pydantic import BaseModel as _BaseModel

    class ORMModel(_BaseModel):  # v1
        class Config:
            orm_mode = True


class EmployeeOut(ORMModel):
    id: int
    education: str
    joining_year: int
    city: str
    payment_tier: int
    age: int
    gender: str
    ever_benched: str
    # 👇 lo que expone el API (no years_experience)
    experience_in_current_domain: int
    leave_or_not: int


class Filters(ORMModel):
    city: Optional[str] = None
    gender: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    education: Optional[str] = None
    payment_tier: Optional[int] = None
    joining_year: Optional[int] = None
    ever_benched: Optional[str] = None  # "Yes"/"No"
    leave_or_not: Optional[int] = None  # 0/1


class Token(ORMModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class LoginRequest(ORMModel):
    email: str
    password: str