from models import User
from schemas.user import UserCreate, UserCreateResponse
from core.db_utils import DatabaseUtils
from core.security import hash_password
from sqlalchemy.orm import Session


class UserService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate):
        db_utils = DatabaseUtils(db)
        
        # Creating an instance for the new user
        new_user = User(
            username=user_data.username,
            hashed_pw=hash_password(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            phone_num=user_data.phone_num,
        )

        res, status = db_utils.db_create(new_user)
        if res.get("success"):
            return {
                "success": True,
                "data": UserCreateResponse.model_validate(new_user).model_dump(mode="json"),
            }, status
        
        return res, status