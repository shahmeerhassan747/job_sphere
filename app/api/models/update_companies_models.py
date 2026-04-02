from pydantic import BaseModel, EmailStr
from typing import Optional

class UpdateCompaniesRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    logo: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class UpdateCompaniesResponse(BaseModel):
    status: str
    message: str
    company_id: Optional[int] = None
