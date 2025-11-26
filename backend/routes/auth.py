"""
OpenLedger Black - Authentication Routes
User registration, login, token management - ironclad security
"""

from fastapi import APIRouter, Depends, HTTPException, status
from database import Database, get_db
from models import UserCreate, UserResponse, LoginRequest, Token
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    log_audit
)
from datetime import datetime


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Database = Depends(get_db)):
    """
    Register a new user
    Default role: staff (ID: 5)
    """
    # Check if user already exists
    existing =await db.fetch_one(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        (user.email, user.username)
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Hash password
    password_hash = hash_password(user.password)
    
    # Insert user (default role: staff = 5)
    cursor = await db.execute(
        """
        INSERT INTO users (email, username, password_hash, full_name, role_id, is_active)
        VALUES (?, ?, ?, ?, 5, 1)
        """,
        (user.email, user.username, password_hash, user.full_name)
    )
    await db.commit()
    
    # Get created user
    user_id = cursor.lastrowid
    created_user = await db.fetch_one(
        """
        SELECT u.*, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
        """,
        (user_id,)
    )
    
    # Log audit
    await log_audit(db, user_id, "CREATE", "users", user_id)
    
    return UserResponse(**created_user)


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: Database = Depends(get_db)):
    """
    Login and receive access + refresh tokens
    """
    # Find user
    user = await db.fetch_one(
        """
        SELECT u.*, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.username = ? AND u.is_active = 1
        """,
        (credentials.username,)
    )
    
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Update last login
    await db.execute(
        "UPDATE users SET last_login = ? WHERE id = ?",
        (datetime.utcnow(), user['id'])
    )
    await db.commit()
    
    # Create tokens
    token_data = {"sub": user['id'], "username": user['username']}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Log audit
    await log_audit(db, user['id'], "LOGIN", "users", user['id'])
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Database = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    from auth import decode_token
    
    payload = decode_token(refresh_token)
    
    # Verify token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id = payload.get("sub")
    username = payload.get("username")
    
    # Verify user still exists and is active
    user = await db.fetch_one(
        "SELECT id FROM users WHERE id = ? AND is_active = 1",
        (user_id,)
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    token_data = {"sub": user_id, "username": username}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )
