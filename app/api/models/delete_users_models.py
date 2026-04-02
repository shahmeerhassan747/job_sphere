from pydantic import BaseModel
from typing import Optional

class DeleteUsersResponse(BaseModel):
    status: str
    message: str
    user_id: Optional[int] = None
