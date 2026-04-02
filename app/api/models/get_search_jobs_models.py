from pydantic import BaseModel
from typing import Optional

# What comes IN (request)
class JobSearchRequest(BaseModel):
    title:    Optional[str] = None
    location: Optional[str] = None
    type:     Optional[str] = None

# What goes OUT (response)
class JobSearchResponse(BaseModel):
    id:           int
    title:        str
    location:     str
    type:         str
    company_name: str
    logo:         Optional[str] = None
    min_salary:   Optional[int] = None
    max_salary:   Optional[int] = None

    class Config:
        from_attributes = True
