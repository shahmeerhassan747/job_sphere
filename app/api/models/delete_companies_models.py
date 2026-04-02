from pydantic import BaseModel
from typing import Optional

class DeleteCompaniesResponse(BaseModel):
    status: str
    message: str
    company_id: Optional[int] = None
