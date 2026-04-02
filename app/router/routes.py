from fastapi import APIRouter

# Import individual routers
from app.api.add_users import router as add_users_router
from app.api.update_users import router as update_users_router
from app.api.delete_users import router as delete_users_router
from app.api.get_all_users import router as get_all_users_router
from app.api.get_specific_users import router as get_specific_users_router
from app.api.add_companies import router as add_companies_router
from app.api.update_companies import router as update_companies_router
from app.api.delete_companies import router as delete_companies_router
from app.api.get_list_companies import router as get_list_companies_router
from app.api.get_specific_companies import router as get_specific_companies_router
from app.api.add_jobs import router as add_jobs_router
from app.api.update_jobs import router as update_jobs_router
from app.api.delete_jobs import router as delete_jobs_router
from app.api.get_all_jobs import router as get_all_jobs_router
from app.api.get_specific_jobs import router as get_specific_jobs_router
from app.api.get_search_jobs import router as get_search_jobs_router
from app.api.add_salaries import router as add_salaries_router
from app.api.update_salaries import router as update_salaries_router
from app.api.delete_salaries import router as delete_salaries_router
from app.api.get_all_salaries import router as get_all_salaries_router
from app.api.get_specific_salaries import router as get_specific_salaries_router
from app.api.login import router as login_router
from app.api.add_applications import router as add_applications_router
from app.api.get_user_applications import router as get_user_applications_router













class APIRouterRegistry:
    """
    Central registry for all API routers.
    """

    def __init__(self):
        self.router = APIRouter()
        self.include_all()

    def include_all(self):
        # Include the add_users router
        self.router.include_router(add_users_router, tags=["Users"])
        # Include the update_users router
        self.router.include_router(update_users_router, tags=["Users"])
        # Include the delete_users router
        self.router.include_router(delete_users_router, tags=["Users"])
        # Include the get_all_users router
        self.router.include_router(get_all_users_router, tags=["Users"])
        # Include the get_specific_users router
        self.router.include_router(get_specific_users_router, tags=["Users"])
        # Include the add_companies router
        self.router.include_router(add_companies_router, tags=["Companies"])
        # Include the update_companies router
        self.router.include_router(update_companies_router, tags=["Companies"])
        # Include the delete_companies router
        self.router.include_router(delete_companies_router, tags=["Companies"])
        # Include the get_list_companies router
        self.router.include_router(get_list_companies_router, tags=["Companies"])
        # Include the get_specific_companies router
        self.router.include_router(get_specific_companies_router, tags=["Companies"])
        # Include the add_jobs router
        self.router.include_router(add_jobs_router, tags=["Jobs"])
        # Include the update_jobs router
        self.router.include_router(update_jobs_router, tags=["Jobs"])
        # Include the delete_jobs router
        self.router.include_router(delete_jobs_router, tags=["Jobs"])
        # Include the get_all_jobs router
        self.router.include_router(get_all_jobs_router, tags=["Jobs"])
        # Include the get_specific_jobs router
        self.router.include_router(get_specific_jobs_router, tags=["Jobs"])
        # Include the get_search_jobs router
        self.router.include_router(get_search_jobs_router, tags=["Jobs"])
        # include line (inside include_all)
        self.router.include_router(add_salaries_router, tags=["Salaries"])
        # include line (inside include_all)
        self.router.include_router(update_salaries_router, tags=["Salaries"])
        # include line (inside include_all)
        self.router.include_router(delete_salaries_router, tags=["Salaries"])
        # include line (inside include_all)
        self.router.include_router(get_all_salaries_router, tags=["Salaries"])  
        # include line (inside include_all)
        self.router.include_router(get_specific_salaries_router, tags=["Salaries"])
        # include line (inside include_all)
        self.router.include_router(login_router, tags=["Users"])
        self.router.include_router(add_applications_router, tags=["Applications"])
        self.router.include_router(get_user_applications_router, tags=["Applications"])















api_router_registry = APIRouterRegistry()
