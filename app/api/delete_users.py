from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import get_db
from models.usr_info import UsrInfo
from app.api.models.delete_users_models import DeleteUsersResponse
import logging

router = APIRouter()

@router.delete("/delete_users/{user_id}", response_model=DeleteUsersResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        user = db.query(UsrInfo).filter(UsrInfo.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete user
        db.delete(user)
        db.commit()

        return DeleteUsersResponse(
            status="success",
            message="User deleted successfully",
            user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
