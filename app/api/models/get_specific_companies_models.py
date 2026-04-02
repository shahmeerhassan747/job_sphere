from pydantic import BaseModel
from typing import Optional
from app.api.models.get_list_companies_models import CompanySchema

class GetSpecificCompanyResponse(BaseModel):
    status: str
    message: str
    company: Optional[CompanySchema] = None
