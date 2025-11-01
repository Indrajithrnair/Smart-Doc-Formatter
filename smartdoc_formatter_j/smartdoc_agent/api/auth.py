from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional
import sqlite3
import hashlib

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database setup - use absolute path to avoid issues
import os
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "users.db")

def init_user_database():
    """Initialize the user database with required tables"""
    try:
        print(f"Initializing database at: {DB_PATH}")
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                token_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    """Get user by email from database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, username, hashed_password, is_active FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            "id": user[0],
            "email": user[1],
            "username": user[2],
            "hashed_password": user[3],
            "is_active": user[4]
        }
    return None

def get_user_by_username(username: str):
    """Get user by username from database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, username, hashed_password, is_active FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            "id": user[0],
            "email": user[1],
            "username": user[2],
            "hashed_password": user[3],
            "is_active": user[4]
        }
    return None

def create_user(email: str, username: str, password: str):
    """Create a new user in the database"""
    try:
        print(f"Creating user: {email}, {username}")
        hashed_password = get_password_hash(password)
        print("Password hashed successfully")
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO users (email, username, hashed_password) VALUES (?, ?, ?)",
            (email, username, hashed_password)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"User created successfully with ID: {user_id}")
        return {
            "id": user_id,
            "email": email,
            "username": username,
            "is_active": True
        }
    except sqlite3.IntegrityError as e:
        print(f"Integrity error creating user: {e}")
        conn.close()
        return None
    except Exception as e:
        print(f"Error creating user: {e}")
        conn.close()
        raise

def authenticate_user(email: str, password: str):
    """Authenticate a user with email and password"""
    user = get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(email)
    if user is None:
        raise credentials_exception
    
    return user

# Initialize database on import
init_user_database()