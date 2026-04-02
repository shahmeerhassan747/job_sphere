from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.api.models.delete_salaries_models import DeleteSalaryResponse

router = APIRouter()

@router.delete("/delete_salary/{id}")
def delete_salary(id: int, db: Session = Depends(get_db)):
    query = text("""
        DELETE FROM salaries
        WHERE id = :id
        RETURNING id
    """)
    result = db.execute(query, {"id": id})
    db.commit()
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Salary not found")
    return {
        "message": "Salary deleted successfully",
        "id":      row[0]
    }
