import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.attendance_scheduler import attendance_daily_loop
from app.core.config import setting
from app.routes.auth_router import router as auth_router
from app.routes.employee_router import router as employee_router
from app.routes.attendance_router import router as attendance_router
from app.routes.salary_history_router import router as salary_history
from app.routes.dashboard_router import router as dashboard_router
from app.routes.branch_router import router as branch_router
from app.routes.user_settings_router import router as user_settings_router
from app.routes.product_router import router as product_router
from app.routes.leave_request_router import router as leave_request_router
from app.routes.notification_router import router as notification_router
from app.routes.push_router import router as push_router
from app.routes.ws_router import router as ws_router
from app.routes.task_router import router as task_router
from app.routes.reminder_router import router as reminder_router
from app.core.middleware import setup_middleware

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Davomat avto-to'ldirish fon-vazifasi (har yarim tunda kechagi kunni absent/leave qiladi)
    task = asyncio.create_task(attendance_daily_loop())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title=setting.app_name,
    debug=setting.debug,
    docs_url=setting.docs_url if setting.debug else None,
    redoc_url=setting.redoc_url if setting.debug else None,
    openapi_url="/api/openapi.json" if setting.debug else None,
    lifespan=lifespan,
)


# Global exception handler — kutilmagan xatoda mijozga umumiy 500 qaytadi,
# stack-trace faqat server log'iga yoziladi (credential/ichki ma'lumot sizmaydi).
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Kutilmagan xatolik: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Ichki server xatosi"},
    )


setup_middleware(app=app)
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(employee_router)
api_router.include_router(attendance_router)
api_router.include_router(salary_history)
api_router.include_router(dashboard_router)
api_router.include_router(branch_router)
api_router.include_router(user_settings_router)
api_router.include_router(product_router)
api_router.include_router(leave_request_router)
api_router.include_router(notification_router)
api_router.include_router(push_router)
api_router.include_router(ws_router)
api_router.include_router(task_router)
api_router.include_router(reminder_router)


app.include_router(api_router)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to CRM API",
        "version": "v1",
        "status": "running",
        "docs_url": setting.docs_url if setting.debug else None,
        "redoc_url": setting.redoc_url if setting.debug else None,
    }

@app.get('/health')
def health_check():
    return {'status': 'healthy'}