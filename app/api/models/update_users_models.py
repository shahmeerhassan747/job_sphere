from pydantic import BaseModel, EmailStr
from typing import Optional

class UpdateUsersRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None

class UpdateUsersResponse(BaseModel):
    status: str
    message: str
    user_id: Optional[int] = None
