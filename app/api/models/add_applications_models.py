from pydantic import BaseModel
from typing import Optional

class AddApplicationRequest(BaseModel):
    job_id: int
    user_id: int
    cover_letter: Optional[str] = None

class AddApplicationResponse(BaseModel):
    status: str
    message: str
    application_id: Optional[int] = None
