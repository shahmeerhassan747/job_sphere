from pydantic import BaseModel, EmailStr
from typing import Optional

class AddCompaniesRequest(BaseModel):
    name: str
    email: EmailStr
    logo: Optional[str] = None
    industry: str
    location: str
    website: Optional[str] = None
    description: Optional[str] = None

class AddCompaniesResponse(BaseModel):
    status: str
    message: str
    company_id: Optional[int] = None
