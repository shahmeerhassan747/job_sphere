from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from models.application import Application
from models.job import Job
from models.usr_info import UsrInfo
from app.api.models.add_applications_models import AddApplicationRequest, AddApplicationResponse
import logging

router = APIRouter()

@router.post("/add_applications", response_model=AddApplicationResponse)
def add_application(request: AddApplicationRequest, db: Session = Depends(get_db)):
    try:
        # Verify job exists
        job = db.query(Job).filter(Job.id == request.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Verify user exists
        user = db.query(UsrInfo).filter(UsrInfo.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if already applied (commented out to allow duplicates as requested)
        # existing = db.query(Application).filter(
        #     Application.job_id == request.job_id,
        #     Application.user_id == request.user_id
        # ).first()
        # if existing:
        #     raise HTTPException(status_code=400, detail="You have already applied for this job")

        # Create application
        new_application = Application(
            job_id=request.job_id,
            user_id=request.user_id,
            cover_letter=request.cover_letter
        )
        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return AddApplicationResponse(
            status="success",
            message="Application submitted successfully",
            application_id=new_application.id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error adding application: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
