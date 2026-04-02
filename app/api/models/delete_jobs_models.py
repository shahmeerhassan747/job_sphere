from pydantic import BaseModel
from typing import Optional

class DeleteJobsResponse(BaseModel):
    status: str
    message: str
    job_id: Optional[int] = None
