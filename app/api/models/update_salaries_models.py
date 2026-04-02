from pydantic import BaseModel
from datetime import datetime

class UpdateSalaryRequest(BaseModel):
    min_salary: int
    max_salary: int
    currency:   str
    location:   str
    job_id:     int

class UpdateSalaryResponse(BaseModel):
    id:         int
    min_salary: int
    max_salary: int
    currency:   str
    location:   str
    job_id:     int
    created_at: datetime

    class Config:
        from_attributes = True
