from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CompanySchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    logo: Optional[str] = None
    industry: str
    location: str
    website: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

class GetListCompaniesResponse(BaseModel):
    status: str
    message: str
    companies: List[CompanySchema]
