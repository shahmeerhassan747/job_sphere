from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.usr_info import UsrInfo
from app.api.models.get_all_users_models import UserSchema
from app.api.models.get_specific_users_models import GetSpecificUserResponse
import logging

router = APIRouter()

@router.get("/get_specific_users/{user_id}", response_model=GetSpecificUserResponse)
def get_specific_user(user_id: int, db: Session = Depends(get_db)):
    try:
        # Fetch the user
        user = db.query(UsrInfo).filter(UsrInfo.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Format the user into UserSchema
        user_data = UserSchema(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar,
            created_at=user.created_at
        )

        return GetSpecificUserResponse(
            status="success",
            message="User retrieved successfully",
            user=user_data
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
