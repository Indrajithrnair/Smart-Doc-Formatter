from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    username: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None