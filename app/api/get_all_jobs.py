from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from main import get_db
from models.job import Job
from app.api.models.get_all_jobs_models import GetAllJobsResponse, JobSchema
import logging

router = APIRouter()

@router.get("/get_all_jobs")
def get_all_jobs(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT DISTINCT ON (jobs.id)
            jobs.*, 
            salaries.id AS salary_id,
            salaries.min_salary, 
            salaries.max_salary, 
            salaries.currency,
            companies.name AS company_name,
            companies.logo AS company_logo
        FROM jobs
        LEFT JOIN salaries ON salaries.job_id = jobs.id
        LEFT JOIN companies ON companies.id = jobs.company_id
        ORDER BY jobs.id, salaries.id DESC
    """)).fetchall()
    
    jobs_list = [dict(row._mapping) for row in result]
    
    return {
        "success": True,
        "status_code": 200,
        "message": f"Retrieved {len(jobs_list)} jobs successfully",
        "data": {
            "status": "success",
            "message": f"Retrieved {len(jobs_list)} jobs successfully",
            "jobs": jobs_list
        },
        "error": None
    }
