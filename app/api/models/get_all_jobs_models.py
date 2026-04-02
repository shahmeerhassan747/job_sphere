from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobSchema(BaseModel):
    id: int
    title: str
    description: str
    location: str
    type: str
    company_id: int
    posted_by: int
    created_at: datetime
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    currency: Optional[str] = None
    company_name: Optional[str] = None
    company_logo: Optional[str] = None

class GetAllJobsResponse(BaseModel):
    status: str
    message: str
    jobs: List[JobSchema]
