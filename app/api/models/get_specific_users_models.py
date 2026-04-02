from pydantic import BaseModel
from typing import Optional
from app.api.models.get_all_users_models import UserSchema

class GetSpecificUserResponse(BaseModel):
    status: str
    message: str
    user: Optional[UserSchema] = None
