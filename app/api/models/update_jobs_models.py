from pydantic import BaseModel
from typing import Optional

class UpdateJobsRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    company_id: Optional[int] = None
    posted_by: Optional[int] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    currency: Optional[str] = None
    image: Optional[str] = None

class UpdateJobsResponse(BaseModel):
    status: str
    message: str
    job_id: Optional[int] = None
