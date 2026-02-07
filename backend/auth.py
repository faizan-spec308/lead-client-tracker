import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session, select
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials



import models
from deps import get_session


bearer_scheme = HTTPBearer()


# ---- Config ----
SECRET_KEY = os.getenv("JWT_SECRET", "CHANGE_THIS_SECRET_IN_PRODUCTION")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Swagger uses this to show the Authorize button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---- Password hashing ----
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ---- JWT ----
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---- User lookup ----
def get_user_by_email(session: Session, email: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.email == email)
    return session.exec(statement).first()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> models.User:
    token = credentials.credentials  # This is the raw JWT token
    payload = decode_token(token)

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token missing subject (sub)")

    user = get_user_by_email(session, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
