from pydantic import BaseModel

class DeleteSalaryResponse(BaseModel):
    message: str
    id:      int
