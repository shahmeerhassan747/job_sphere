from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AddSalaryRequest(BaseModel):
    min_salary: int
    max_salary: int
    currency:   str
    location:   str
    job_id:     int

class AddSalaryResponse(BaseModel):
    id:         int
    min_salary: int
    max_salary: int
    currency:   str
    location:   str
    job_id:     int
    created_at: datetime

    class Config:
        from_attributes = True
