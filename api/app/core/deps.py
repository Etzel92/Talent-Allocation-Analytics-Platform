from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import RoleEnum, User
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

TokenStr = Annotated[str, Depends(oauth2_scheme)]
DbSess = Annotated[Session, Depends(get_db)]


def get_current_user(token: TokenStr, db: DbSess) -> User:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if not email:
            raise cred_exc
    except JWTError as err:
        # B904: encadenar excepción original
        raise cred_exc from err

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise cred_exc
    return user


def require_roles(*roles: RoleEnum):

    def checker(user: Annotated[User, Depends(get_current_user)]):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return checker
