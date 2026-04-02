from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.job import Job
from models.company import Company
from models.usr_info import UsrInfo
from models.salary import Salary
from app.api.models.update_jobs_models import UpdateJobsRequest, UpdateJobsResponse
import logging

router = APIRouter()

@router.put("/update_jobs/{job_id}", response_model=UpdateJobsResponse)
def update_job(job_id: int, request: UpdateJobsRequest, db: Session = Depends(get_db)):
    try:
        # Fetch the job
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Update or Create salary record if provided
        if any(v is not None for v in [request.min_salary, request.max_salary, request.currency, request.location]):
            salary = db.query(Salary).filter(Salary.job_id == job_id).first()
            if salary:
                if request.min_salary is not None: salary.min_salary = request.min_salary
                if request.max_salary is not None: salary.max_salary = request.max_salary
                if request.currency is not None: salary.currency = request.currency
                if request.location is not None: salary.location = request.location
            else:
                new_salary = Salary(
                    min_salary=request.min_salary,
                    max_salary=request.max_salary,
                    currency=request.currency or "USD",
                    location=request.location or request.location, # Fallback to job location
                    job_id=job_id
                )
                db.add(new_salary)
            db.commit()


        # Get the update data, excluding fields that weren't set
        update_data = request.model_dump(exclude_unset=True)
        if not update_data:
            return UpdateJobsResponse(
                status="success",
                message="No fields provided for update",
                job_id=job_id
            )

        # Verify company_id if provided
        if "company_id" in update_data:
            company = db.query(Company).filter(Company.id == update_data["company_id"]).first()
            if not company:
                raise HTTPException(status_code=404, detail="Company not found")

        # Verify posted_by if provided
        if "posted_by" in update_data:
            user = db.query(UsrInfo).filter(UsrInfo.id == update_data["posted_by"]).first()
            if not user:
                raise HTTPException(status_code=404, detail="User (posted_by) not found")

        # Apply updates
        for key, value in update_data.items():
            setattr(job, key, value)

        db.commit()
        db.refresh(job)

        return UpdateJobsResponse(
            status="success",
            message="Job updated successfully",
            job_id=job_id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
