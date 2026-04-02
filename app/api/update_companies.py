from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.company import Company
from app.api.models.update_companies_models import UpdateCompaniesRequest, UpdateCompaniesResponse
import logging

router = APIRouter()

@router.put("/update_companies/{company_id}", response_model=UpdateCompaniesResponse)
def update_company(company_id: int, request: UpdateCompaniesRequest, db: Session = Depends(get_db)):
    try:
        # Check if company exists
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Update provided fields
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(company, key, value)
        
        db.commit()
        db.refresh(company)

        return UpdateCompaniesResponse(
            status="success",
            message="Company updated successfully",
            company_id=company.id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating company {company_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
