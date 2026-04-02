from pydantic import BaseModel

class GetSpecificSalaryResponse(BaseModel):
    id:           int
    min_salary:   int
    max_salary:   int
    currency:     str
    location:     str
    job_title:    str
    company_name: str

    class Config:
        from_attributes = True
