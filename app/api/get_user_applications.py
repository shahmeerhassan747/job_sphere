from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from models.application import Application
from models.job import Job
from models.company import Company
from app.api.models.get_user_applications_models import GetUserApplicationsResponse, UserApplication, ApplicationJob
from typing import List
import logging

router = APIRouter()

@router.get("/get_user_applications/{user_id}", response_model=GetUserApplicationsResponse)
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    try:
        # Join Application -> Job -> Company
        results = db.query(Application, Job, Company).join(Job, Application.job_id == Job.id).outerjoin(Company, Job.company_id == Company.id).filter(Application.user_id == user_id).order_by(Application.created_at.desc()).all()

        applications_list = []
        for app_obj, job_obj, comp_obj in results:
            job_data = ApplicationJob(
                id=job_obj.id,
                title=job_obj.title,
                location=job_obj.location,
                type=job_obj.type,
                company_id=comp_obj.id if comp_obj else None,
                company_name=comp_obj.name if comp_obj else None,
                company_logo=comp_obj.logo if comp_obj else None
            )
            
            app_data = UserApplication(
                id=app_obj.id,
                job_id=app_obj.job_id,
                user_id=app_obj.user_id,
                cover_letter=app_obj.cover_letter,
                status=app_obj.status,
                created_at=app_obj.created_at,
                job=job_data
            )
            applications_list.append(app_data)

        return GetUserApplicationsResponse(
            status="success",
            message=f"Retrieved {len(applications_list)} applications successfully",
            applications=applications_list
        )
    except Exception as e:
        logging.error(f"Error retrieving user applications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
