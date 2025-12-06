from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core.database import get_db
from services.auth_service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    token_data = AuthService.validate_token(token)
    
    if not token_data["success"]:
        raise HTTPException(status_code=401, detail=token_data["error"])
    
    if token_data["data"].get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    return int(token_data["data"]["sub"])