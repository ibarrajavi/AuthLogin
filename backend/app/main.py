# --- Third-party
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# --- Local application imports
from core.database import init_db
from core.config import settings
from routers.api_v1 import api_v1

# Initialize database (SQLAlchemy engine & tables)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (safe if they already exist)
    # Alembic handles actual schema migrations
    init_db()
    yield

app = FastAPI(
    lifespan= lifespan,
    title= "AuthLogin API",
    version= "1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Versioned API
app.include_router(api_v1)