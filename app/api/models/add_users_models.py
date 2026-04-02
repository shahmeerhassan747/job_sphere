from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AddUsersRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    avatar: Optional[str] = None

class AddUsersResponse(BaseModel):
    status: str
    message: str
    user_id: Optional[int] = None
