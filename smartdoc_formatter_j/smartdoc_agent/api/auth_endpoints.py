from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from datetime import timedelta
import re

from .auth_models import UserSignup, UserLogin, UserResponse, Token
from .auth import (
    authenticate_user, create_user, create_access_token, 
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES,
    get_user_by_email, get_user_by_username
)

router = APIRouter(prefix="/auth", tags=["authentication"])

def validate_password(password: str) -> bool:
    """Validate password - simplified validation"""
    if len(password) < 3:  # Minimum 3 characters
        return False
    return True

def validate_username(username: str) -> bool:
    """Validate username format"""
    if len(username) < 3 or len(username) > 20:
        return False
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False
    return True

@router.post("/signup", response_model=dict)
async def signup(user_data: UserSignup):
    """Register a new user"""
    
    # Validate input
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    if not validate_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 3 characters long"
        )
    
    if not validate_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-20 characters long and contain only letters, numbers, and underscores"
        )
    
    # Check if user already exists
    if get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    try:
        user = create_user(user_data.email, user_data.username, user_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user - email or username may already exist"
            )
    except Exception as e:
        print(f"Error in signup endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "message": "User created successfully",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"]
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=dict)
async def login(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    
    user = authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"]
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        username=current_user["username"],
        is_active=current_user["is_active"]
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should remove token)"""
    return {"message": "Logout successful"}

@router.get("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if token is valid"""
    return {
        "valid": True,
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "username": current_user["username"]
        }
    }

@router.get("/test")
async def test_auth_endpoint():
    """Test endpoint to verify auth system is working"""
    return {"message": "Auth system is working!", "timestamp": "2024-01-01"}