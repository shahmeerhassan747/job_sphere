from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
import logging

router = APIRouter()

@router.get("/get_specific_companies/{company_id}")
def get_specific_company(company_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("""
            SELECT
                companies.*,
                COUNT(DISTINCT jobs.id) AS total_jobs
            FROM companies
            LEFT JOIN jobs ON jobs.company_id = companies.id
            WHERE companies.id = :company_id
            GROUP BY companies.id
            LIMIT 1
        """), {"company_id": company_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Company not found")

        return {
            "success": True,
            "status_code": 200,
            "message": "Company retrieved successfully",
            "data": {
                "status": "success",
                "message": "Company retrieved successfully",
                "company": dict(result._mapping)
            },
            "error": None
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching company {company_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
