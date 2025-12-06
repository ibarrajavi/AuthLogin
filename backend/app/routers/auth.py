from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependencies import get_current_user_id
from schemas.auth import LoginRequest
from schemas.user import UserCreate
from services.auth_service import AuthService
from services.user_service import UserService


oauth2_refresh = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    result, status = UserService.create_user(db, user_data)
    return JSONResponse(content=result, status_code=status)

@router.post("/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    result, status = AuthService.login(db, credentials)
    return JSONResponse(content=result, status_code=status)

@router.post("/refresh")
def refresh(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_refresh)
):
    if not token:
        return JSONResponse(
            content={"success": False, "error": "Refresh token required"},
            status_code=401
        )
    result, status = AuthService.refresh_token(token, db)
    return JSONResponse(content=result, status_code=status)

@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    result, status = AuthService.logout(db, user_id)
    return JSONResponse(content=result, status_code=status)