from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.company import Company
from app.api.models.get_list_companies_models import GetListCompaniesResponse, CompanySchema
import logging

router = APIRouter()

@router.get("/get_list_companies", response_model=GetListCompaniesResponse)
def get_companies(db: Session = Depends(get_db)):
    try:
        # Fetch all companies
        companies = db.query(Company).all()
        
        # Format the companies into CompanySchema
        company_list = [
            CompanySchema(
                id=company.id,
                name=company.name,
                email=company.email,
                logo=company.logo,
                industry=company.industry,
                location=company.location,
                website=company.website,
                description=company.description,
                created_at=company.created_at
            ) for company in companies
        ]

        return GetListCompaniesResponse(
            status="success",
            message=f"Retrieved {len(company_list)} companies successfully",
            companies=company_list
        )
    except Exception as e:
        logging.error(f"Error fetching all companies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
