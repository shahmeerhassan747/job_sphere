from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db

router = APIRouter()

@router.get("/get_specific_salary/{id}")
def get_specific_salary(id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT s.id, s.min_salary, s.max_salary, s.currency, s.location, s.job_id,
               j.title AS job_title,
               c.name  AS company_name
        FROM salaries s
        JOIN jobs j ON s.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE s.id = :id
    """)
    result = db.execute(query, {"id": id}).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Salary not found")
    salary_data = {
        "id":           result[0],
        "min_salary":   result[1],
        "max_salary":   result[2],
        "currency":     result[3],
        "location":     result[4],
        "job_id":       result[5],
        "job_title":    result[6],
        "company_name": result[7]
    }
    
    return {
        "success": True,
        "status_code": 200,
        "message": "Salary retrieved successfully",
        "data": {
            "status": "success",
            "message": "Salary retrieved successfully",
            "salary": salary_data
        },
        "error": None
    }
