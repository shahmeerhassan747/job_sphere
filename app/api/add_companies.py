from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.company import Company
from app.api.models.add_companies_models import AddCompaniesRequest, AddCompaniesResponse
import logging

router = APIRouter()

@router.post("/add_companies", response_model=AddCompaniesResponse)
def add_company(request: AddCompaniesRequest, db: Session = Depends(get_db)):
    try:
        # Check if company with same email already exists (if email is unique)
        # Assuming email might be unique for companies too
        existing_company = db.query(Company).filter(Company.email == request.email).first()
        if existing_company:
            raise HTTPException(status_code=400, detail="Company with this email already exists")

        # Create new company
        new_company = Company(
            name=request.name,
            email=request.email,
            logo=request.logo,
            industry=request.industry,
            location=request.location,
            website=request.website,
            description=request.description
        )
        
        db.add(new_company)
        db.commit()
        db.refresh(new_company)

        return AddCompaniesResponse(
            status="success",
            message="Company created successfully",
            company_id=new_company.id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error adding company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
