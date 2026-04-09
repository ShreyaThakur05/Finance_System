from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "viewer"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str
