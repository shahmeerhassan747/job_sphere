from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from main import get_db
from models.usr_info import UsrInfo
from app.api.models.get_all_users_models import GetAllUsersResponse, UserSchema
import logging

router = APIRouter()

@router.get("/get_all_users", response_model=GetAllUsersResponse)
def get_all_users(db: Session = Depends(get_db)):
    try:
        # Fetch all users
        users = db.query(UsrInfo).all()
        
        # Format the users into UserSchema
        user_list = [
            UserSchema(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                avatar=user.avatar,
                created_at=user.created_at
            ) for user in users
        ]

        return GetAllUsersResponse(
            status="success",
            message=f"Retrieved {len(user_list)} users successfully",
            users=user_list
        )
    except Exception as e:
        logging.error(f"Error fetching all users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
