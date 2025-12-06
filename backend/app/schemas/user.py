from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
import re

class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_num: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        errors = []

        if len(v) < 12:
            errors.append("Password must be at least 12 characters.")
        if not re.search(r'[A-Z]', v):
            errors.append("Must include at least 1 upper case letter.")
        if not re.search(r'[a-z]', v):
            errors.append("Must include at least 1 lower case letter.")
        if not re.search(r'[!@#$%^&*]', v):
            errors.append("Must include at least 1 special character (!@#$%^&*).")
        if len(re.findall(r'\d', v)) < 2:
            errors.append("Must include at least 2 numbers.")
        if re.search(r'\s', v):
            errors.append("Password must not contain whitespace.")

        if errors:
            raise ValueError("\n".join(errors))  # Join with newlines instead of list

        return v
    
class UserCreateResponse(BaseModel):
    id: int
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_num: str
    created_dt: datetime
    updated_dt: datetime

    class Config:
        from_attributes = True
