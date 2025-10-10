from pydantic import BaseModel

# Compatibilidad Pydantic:
# - v1: Config con orm_mode = True
# - v2: ConfigDict(from_attributes=True)
try:
    # Pydantic v2
    from pydantic import ConfigDict

    _MODEL_CONFIG = {"model_config": ConfigDict(from_attributes=True)}
except Exception:
    # Pydantic v1
    class _Cfg:
        orm_mode = True

    _MODEL_CONFIG = {"Config": _Cfg}


class EmployeeOut(BaseModel):
    id: int
    education: str
    joining_year: int
    city: str
    payment_tier: int
    age: int
    gender: str
    ever_benched: str
    years_experience: int
    leave_or_not: int
    # aplica config según versión
    locals().update(_MODEL_CONFIG)


class Filters(BaseModel):
    city: str | None = None
    gender: str | None = None
    age_min: int | None = None
    age_max: int | None = None
    education: str | None = None
    payment_tier: int | None = None
    joining_year: int | None = None
    ever_benched: str | None = None  # "Yes"/"No"
    leave_or_not: int | None = None  # 0/1


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str
