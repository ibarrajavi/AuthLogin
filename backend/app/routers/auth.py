from fastapi import APIRouter, Depends, Response, Request
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

# Cookie settings for HTTP-only cookies
COOKIE_SETTINGS = {
    "httponly": True,
    "secure": False,  # In Prod set to True
    "samesite": "lax",
    "path": "/"
}

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    result, status = UserService.create_user(db, user_data)
    return JSONResponse(content=result, status_code=status)

@router.post("/login")
def login(response: Response, credentials: LoginRequest, db: Session = Depends(get_db)):
    result, status = AuthService.login(db, credentials)

    # If login successful, set HTTP-only cookies
    if result.get("success") and "access_token" in result:
        # Set access token cookie
        response.set_cookie(
            key="access_token",
            value=result["access_token"],
            max_age=result["expires_in"],
            **COOKIE_SETTINGS
        )

        # Set refresh token cookie with longer expiry
        response.set_cookie(
            key="refresh_token",
            value=result["refresh_token"],
            max_age=7 * 24 * 60 * 60,  # 7 days
            **COOKIE_SETTINGS
        )

        # Remove tokens from response body for security
        response_data = result.copy()
        response_data.pop("access_token", None)
        response_data.pop("refresh_token", None)

        # Set status code and return data
        response.status_code = status
        return response_data

    response.status_code = status
    return result

@router.post("/refresh")
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    # Get refresh token from HTTP-only cookie
    token = request.cookies.get("refresh_token")

    if not token:
        response.status_code = 401
        return {"success": False, "error": "Refresh token required"}

    result, status = AuthService.refresh_token(token, db)

    # If refresh successful, set new HTTP-only cookies
    if result.get("success") and "access_token" in result:
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=result["access_token"],
            max_age=result["expires_in"],
            **COOKIE_SETTINGS
        )

        # Set new refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=result["refresh_token"],
            max_age=7 * 24 * 60 * 60,  # 7 days
            **COOKIE_SETTINGS
        )

        # Remove tokens from response body for security
        response_data = result.copy()
        response_data.pop("access_token", None)
        response_data.pop("refresh_token", None)

        # Set status code and return data
        response.status_code = status
        return response_data

    response.status_code = status
    return result

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    # Try to get user_id from token, but don't fail if token is expired
    user_id = None
    token = request.cookies.get("access_token")
    if token:
        token_data = AuthService.validate_token(token)
        if token_data.get("success") and token_data.get("data", {}).get("type") == "access":
            user_id = int(token_data["data"]["sub"])

    # Call logout service if we have a valid user_id
    if user_id:
        result, status = AuthService.logout(db, user_id)
    else:
        # Even if token is invalid, still clear cookies
        result = {"success": True, "message": "Logged out successfully"}
        status = 200

    # Clear HTTP-only cookies with all the same settings they were set with
    response.delete_cookie(
        key="access_token",
        **COOKIE_SETTINGS
    )
    response.delete_cookie(
        key="refresh_token",
        **COOKIE_SETTINGS
    )

    response.status_code = status
    return result