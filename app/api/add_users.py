from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from models.usr_info import UsrInfo
from app.api.models.add_users_models import AddUsersRequest, AddUsersResponse
import logging

router = APIRouter()

@router.post("/add_users", response_model=AddUsersResponse)
def add_users(request: AddUsersRequest, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(UsrInfo).filter(UsrInfo.email == request.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        # Create new user
        new_user = UsrInfo(
            name=request.name,
            email=request.email,
            password=request.password,  # In a real app, hash this!
            role=request.role,
            avatar=request.avatar
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "success": True,
            "status_code": 201,
            "message": "User created successfully",
            "data": {
                "status": "success",
                "message": "User created successfully",
                "user_id": new_user.id,
                "avatar": new_user.avatar
            },
            "error": None
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error adding user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
