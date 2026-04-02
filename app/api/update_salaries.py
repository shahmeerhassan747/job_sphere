from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.api.models.update_salaries_models import UpdateSalaryRequest, UpdateSalaryResponse

router = APIRouter()

@router.put("/update_salary/{id}")
def update_salary(id: int, request: UpdateSalaryRequest, db: Session = Depends(get_db)):
    query = text("""
        UPDATE salaries
        SET min_salary = :min_salary,
            max_salary = :max_salary,
            currency   = :currency,
            location   = :location,
            job_id     = :job_id
        WHERE id = :id
        RETURNING id, min_salary, max_salary, currency, location, job_id, created_at
    """)
    result = db.execute(query, {
        "min_salary": request.min_salary,
        "max_salary": request.max_salary,
        "currency":   request.currency,
        "location":   request.location,
        "job_id":     request.job_id,
        "id":         id
    })
    db.commit()
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Salary not found")
    return {
        "id":         row[0],
        "min_salary": row[1],
        "max_salary": row[2],
        "currency":   row[3],
        "location":   row[4],
        "job_id":     row[5],
        "created_at": row[6]
    }
