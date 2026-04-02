from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db

router = APIRouter()

@router.get("/get_all_salaries")
def get_all_salaries(db: Session = Depends(get_db)):
    query = text("""
        SELECT s.id, s.min_salary, s.max_salary, s.currency, s.location,
               j.title AS job_title,
               c.name  AS company_name
        FROM salaries s
        JOIN jobs j ON s.job_id = j.id
        JOIN companies c ON j.company_id = c.id
    """)
    result = db.execute(query).fetchall()
    salaries_list = [
        {
            "id":           row[0],
            "min_salary":   row[1],
            "max_salary":   row[2],
            "currency":     row[3],
            "location":     row[4],
            "job_title":    row[5],
            "company_name": row[6]
        }
        for row in result
    ]
    
    return {
        "success": True,
        "status_code": 200,
        "message": f"Retrieved {len(salaries_list)} salaries successfully",
        "data": {
            "status": "success",
            "message": f"Retrieved {len(salaries_list)} salaries successfully",
            "salaries": salaries_list
        },
        "error": None
    }
