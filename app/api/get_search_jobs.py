from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database.database import get_db

router = APIRouter()

@router.get("/jobs/search")
def search_jobs(
    title:    Optional[str] = None,
    location: Optional[str] = None,
    type:     Optional[str] = None,
    db:       Session = Depends(get_db)
):
    # ─── Base Query ──────────────────────────────────────────
    query = """
        SELECT j.id, j.title, j.location, j.type,
               c.name AS company_name, c.logo AS company_logo,
               s.min_salary, s.max_salary, s.currency
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN salaries s ON s.job_id = j.id
        WHERE 1=1
    """

    # ─── Filters (only add if provided) ─────────────────────
    params = {}

    if title:
        query += " AND j.title ILIKE :title"
        params["title"] = f"%{title}%"

    if location:
        query += " AND j.location ILIKE :location"
        params["location"] = f"%{location}%"

    if type:
        query += " AND j.type = :type"
        params["type"] = type

    # ─── Execute Query ───────────────────────────────────────
    result = db.execute(text(query), params).fetchall()

    # ─── Return Results ──────────────────────────────────────
    jobs_list = [dict(row._mapping) for row in result]
    
    return {
        "success": True,
        "status_code": 200,
        "message": f"Found {len(jobs_list)} jobs",
        "data": {
            "status": "success",
            "message": f"Found {len(jobs_list)} jobs",
            "jobs": jobs_list
        },
        "error": None
    }
