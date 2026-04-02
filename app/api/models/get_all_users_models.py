from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    avatar: Optional[str] = None
    created_at: datetime

class GetAllUsersResponse(BaseModel):
    status: str
    message: str
    users: List[UserSchema]
