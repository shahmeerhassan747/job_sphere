from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.usr_info import UsrInfo
from app.api.models.update_users_models import UpdateUsersRequest, UpdateUsersResponse
import logging

router = APIRouter()

@router.put("/update_users/{user_id}", response_model=UpdateUsersResponse)
def update_user(user_id: int, request: UpdateUsersRequest, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        user = db.query(UsrInfo).filter(UsrInfo.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update provided fields
        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)

        return UpdateUsersResponse(
            status="success",
            message="User updated successfully",
            user_id=user.id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
