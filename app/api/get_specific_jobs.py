from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
import logging

router = APIRouter()

@router.get("/get_specific_jobs/{job_id}")
def get_specific_job(job_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("""
            SELECT
                jobs.id,
                jobs.title,
                jobs.description,
                jobs.location,
                jobs.type,
                jobs.company_id,
                jobs.posted_by,
                jobs.image,
                jobs.created_at,
                salaries.id AS salary_id,
                salaries.min_salary,
                salaries.max_salary,
                salaries.currency,
                companies.name AS company_name,
                companies.logo AS company_logo,
                companies.industry AS company_industry,
                companies.description AS company_description
            FROM jobs
            LEFT JOIN salaries ON salaries.job_id = jobs.id
            LEFT JOIN companies ON companies.id = jobs.company_id
            WHERE jobs.id = :job_id
            LIMIT 1
        """), {"job_id": job_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Job not found")

        return {
            "success": True,
            "status_code": 200,
            "message": "Job retrieved successfully",
            "data": {
                "status": "success",
                "message": "Job retrieved successfully",
                "job": dict(result._mapping)
            },
            "error": None
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
