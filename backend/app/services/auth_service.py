from sqlalchemy.orm import Session
from sqlalchemy import or_
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from typing import Dict, Tuple, Any
from datetime import datetime, timedelta, timezone
from models import User
from schemas.auth import LoginRequest
from core.config import settings
from core.db_utils import DatabaseUtils
from core.security import verify_password, hash_token, verify_token_hash

class AuthService:
    @staticmethod
    def generate_token(data: dict, expires_delta: timedelta | None = None) -> str:
        """
        Generate a JWT token
        """
        to_encode = data.copy()
        # Get current time in UTC
        now = datetime.now(timezone.utc)
        # Calculate expiration time
        expire = now + (expires_delta if expires_delta else timedelta(minutes=settings.JWT_EXPIRY_MINUTES))
        # Add expiration and issue time to payload
        to_encode.update({"exp": expire, "iat": now})
        # Encode the payload with the secret key and algorithm
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def validate_token(token: str) -> Dict[str, Any]:
        """
        Validate a JWT token

        Args:
            token: str - The token to validate

        Returns:
            Dict[str, Any] - The decoded token data
        """
        # Validate token
        try:
            decoded_token = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
                leeway=settings.JWT_LEEWAY
            )
            return {
                "success": True,
                "data": decoded_token
            }
        # Check if token has expired
        except ExpiredSignatureError:
            return {
                "success": False,
                "error": "Token has expired"
            }
        # Check if token is invalid
        except InvalidTokenError:
            return {
                "success": False,
                "error": "Invalid Token"
            }
        
    @staticmethod
    def get_refresh_expiry() -> timedelta:
        """
        Get the refresh token expiry time

        Returns:
            timedelta - The refresh token expiry time
        """
        # Get refresh expiry from settings
        return timedelta(days=settings.JWT_REFRESH_EXPIRY)
    
    @staticmethod
    def refresh_token(refresh_token: str, db: Session) -> Tuple[dict, int]:
        """
        Refresh a JWT token

        Args:
            refresh_token: str - The refresh token to refresh
            db: Session - The database session

        Returns:
            Tuple[Dict[str, Any], int] - The new token data and status code
        """
        db_utils = DatabaseUtils(db)

        # Validate refresh token
        token_data = AuthService.validate_token(refresh_token)
        if not token_data["success"]:
            return {
                "success": False,
                "error": token_data["error"]
            }, 401

        # Check if token is a refresh token
        if token_data["data"].get("type") != "refresh":
            return {
                "success": False,
                "error": "Invalid token type"
            }, 401
        
        # Get user ID from token
        try:
            user_id = int(token_data["data"].get("sub"))
        except (ValueError, TypeError):
            return {
                "success": False,
                "error": "Invalid token"
            }, 401

        # Get user from database
        res, status = db_utils.db_get(User, user_id, model_name="User")
        if not res["success"]:
            return res, status

        user = res["data"]

        # Check if refresh token is valid
        if not getattr(user, "refresh_hash", None) or not verify_token_hash(refresh_token, user.refresh_hash):
            return {
                "success": False,
                "error": "Invalid refresh token"
            }, 401

        # Generate new token data
        new_token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
        }

        # Generate new access token
        access_token = AuthService.generate_token({**new_token_data, "type": "access"})

        # Generate new refresh token
        refresh_claims = new_token_data.copy()
        new_refresh_token = AuthService.generate_token(
            {**refresh_claims, "type": "refresh"},
            expires_delta=AuthService.get_refresh_expiry()
        )

        # Update refresh hash
        user.refresh_hash = hash_token(new_refresh_token)

        # Commit changes to database
        commit_res, commit_status = db_utils.db_commit()
        if not commit_res["success"]:
            return commit_res, commit_status
        
        return {
            "success": True,
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRY_MINUTES * 60
        }, 200

    @staticmethod
    def login(
            db: Session, 
            credentials: LoginRequest,
    )-> Tuple[Dict[str, Any], int]:
        # Login by email or username
        user = db.query(User).filter(
            or_(User.email == credentials.identifier, User.username == credentials.identifier)
        ).first()

        if not user or not verify_password(credentials.password, user.hashed_pw):
            return {
                "success": False,
                "error": "Invalid username/email or password"
            }, 401
        
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username
        }

        access_token = AuthService.generate_token({**token_data, "type": "access"})
        refresh_token = AuthService.generate_token(
            {**token_data, "type": "refresh"},
            expires_delta=AuthService.get_refresh_expiry()
        )

        # Store hashed refresh tokens server-side
        db_utils = DatabaseUtils(db)
        hashed_refresh = hash_token(refresh_token)
        user.refresh_hash = hashed_refresh
        commit_res, status_code = db_utils.db_commit()

        if not commit_res["success"]:
            return commit_res, status_code

        return {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRY_MINUTES * 60,
            "data": {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }, 200
    
    @staticmethod
    def logout(db: Session, user_id: int) -> Tuple[Dict[str, Any], int]:
        db_utils = DatabaseUtils(db)
        
        res, status = db_utils.db_get(User, user_id, model_name="User")
        if not res["success"]:
            return res, status
        
        user = res["data"]
        user.refresh_hash = None
        
        commit_res, commit_status = db_utils.db_commit()
        if not commit_res["success"]:
            return commit_res, commit_status
        
        return {"success": True, "message": "Logged out successfully"}, 200