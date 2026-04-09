from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import Role


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPatch(BaseModel):
    role: Role | None = None
    is_active: bool | None = None
