from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1")

# Import sub-router
from routers.auth import router as auth_router

# Mount sub-router under /api/v1/*
api_v1.include_router(auth_router, tags=["auth"])