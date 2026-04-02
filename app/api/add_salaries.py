from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.api.models.add_salaries_models import AddSalaryRequest, AddSalaryResponse

router = APIRouter()

@router.post("/add_salary")
def add_salary(request: AddSalaryRequest, db: Session = Depends(get_db)):
    query = text("""
        INSERT INTO salaries (min_salary, max_salary, currency, location, job_id)
        VALUES (:min_salary, :max_salary, :currency, :location, :job_id)
        RETURNING id, min_salary, max_salary, currency, location, job_id, created_at
    """)
    result = db.execute(query, {
        "min_salary": request.min_salary,
        "max_salary": request.max_salary,
        "currency":   request.currency,
        "location":   request.location,
        "job_id":     request.job_id
    })
    db.commit()
    row = result.fetchone()
    return {
        "id":         row[0],
        "min_salary": row[1],
        "max_salary": row[2],
        "currency":   row[3],
        "location":   row[4],
        "job_id":     row[5],
        "created_at": row[6]
    }
