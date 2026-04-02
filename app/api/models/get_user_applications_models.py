from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ApplicationJob(BaseModel):
    id: int
    title: str
    location: str
    type: str
    company_id: Optional[int]
    company_name: Optional[str]
    company_logo: Optional[str]

class UserApplication(BaseModel):
    id: int
    job_id: int
    user_id: int
    cover_letter: Optional[str]
    status: str
    created_at: datetime
    job: ApplicationJob

class GetUserApplicationsResponse(BaseModel):
    status: str
    message: str
    applications: List[UserApplication]
