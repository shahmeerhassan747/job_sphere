from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.company import Company
from app.api.models.delete_companies_models import DeleteCompaniesResponse
import logging

router = APIRouter()

@router.delete("/delete_companies/{company_id}", response_model=DeleteCompaniesResponse)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    try:
        # Fetch the company
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Delete the company (cascading delete will handle jobs and salaries)
        db.delete(company)
        db.commit()

        return DeleteCompaniesResponse(
            status="success",
            message="Company and all associated jobs and salaries deleted successfully",
            company_id=company_id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting company {company_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
