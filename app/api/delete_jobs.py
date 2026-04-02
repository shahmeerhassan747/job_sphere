from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.job import Job
from app.api.models.delete_jobs_models import DeleteJobsResponse
import logging

router = APIRouter()

@router.delete("/delete_jobs/{job_id}", response_model=DeleteJobsResponse)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    try:
        # Fetch the job
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Delete the job (cascading delete will handle salaries)
        db.delete(job)
        db.commit()

        return DeleteJobsResponse(
            status="success",
            message="Job and all associated salaries deleted successfully",
            job_id=job_id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
