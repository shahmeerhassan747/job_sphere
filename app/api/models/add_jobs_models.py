from pydantic import BaseModel
from typing import Optional

class AddJobsRequest(BaseModel):
    title: str
    description: str
    location: str
    type: str
    company_id: int
    posted_by: int
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    currency: Optional[str] = "USD"
    image: Optional[str] = None

class AddJobsResponse(BaseModel):
    status: str
    message: str
    job_id: Optional[int] = None
