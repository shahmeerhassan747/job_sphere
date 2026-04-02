from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.job import Job
from models.company import Company
from models.usr_info import UsrInfo
from models.salary import Salary
from app.api.models.add_jobs_models import AddJobsRequest, AddJobsResponse
import logging

router = APIRouter()

@router.post("/add_jobs", response_model=AddJobsResponse)
def add_job(request: AddJobsRequest, db: Session = Depends(get_db)):
    try:
        # Verify company exists
        company = db.query(Company).filter(Company.id == request.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Verify posted_by user exists
        user = db.query(UsrInfo).filter(UsrInfo.id == request.posted_by).first()
        if not user:
            raise HTTPException(status_code=404, detail="User (posted_by) not found")

        # Create new job
        new_job = Job(
            title=request.title,
            description=request.description,
            location=request.location,
            type=request.type,
            company_id=request.company_id,
            posted_by=request.posted_by,
            image=request.image
        )
        
        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        # Create salary record if provided
        if request.min_salary is not None or request.max_salary is not None:
            new_salary = Salary(
                min_salary=request.min_salary,
                max_salary=request.max_salary,
                currency=request.currency or "USD",
                location=request.location,
                job_id=new_job.id
            )
            db.add(new_salary)
            db.commit()

        return AddJobsResponse(
            status="success",
            message="Job posted successfully",
            job_id=new_job.id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error adding job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
