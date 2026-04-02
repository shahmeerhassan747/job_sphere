from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.models.login_models import LoginRequest
from app.database.database import get_db

router = APIRouter()

SECRET_KEY = "f28c59337162ce322f3db0de828d0533a92a1c4ee9a803e11db84bab941f57ee"
ALGORITHM = "HS256"


def create_token(user_id: int, email: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    data = {"id": user_id, "email": email, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    query = text(
        "SELECT id, name, email, role, password, avatar FROM users WHERE email = :email"
    )
    result = db.execute(query, {"email": request.email}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    if result[4] != request.password:
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_token(result[0], result[2])

    return {
        "success": True,
        "status_code": 200,
        "message": "Login successful",
        "data": {
            "token": token,
            "id": result[0],
            "name": result[1],
            "email": result[2],
            "role": result[3],
            "avatar": result[5]
        },
        "error": None
    }
