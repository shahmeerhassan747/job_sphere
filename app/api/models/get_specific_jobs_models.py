from pydantic import BaseModel
from typing import Optional
from app.api.models.get_all_jobs_models import JobSchema

class GetSpecificJobResponse(BaseModel):
    status: str
    message: str
    job: Optional[JobSchema] = None
