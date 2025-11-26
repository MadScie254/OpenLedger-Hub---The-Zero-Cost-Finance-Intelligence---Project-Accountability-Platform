"""
OpenLedger Black - Authentication & Security Utilities
JWT generation, password hashing, permission enforcement - ironclad security
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import Database, get_db
from models import TokenData, UserResponse


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer scheme for JWT
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Database = Depends(get_db)
) -> UserResponse:
    """
    Get current authenticated user from JWT token
    Dependency for protected routes
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    # Verify token type
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Fetch user from database
    user = await db.fetch_one(
        """
        SELECT u.*, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.is_active = 1
        """,
        (user_id,)
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return UserResponse(**user)


async def require_permission(
    permission: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Database = Depends(get_db)
) -> UserResponse:
    """
    Check if current user has required permission
    Use as dependency: Depends(require_permission("finance.create"))
    """
    has_permission = await db.fetch_one(
        """
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.name = ?
        """,
        (current_user.role_id, permission)
    )
    
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied: {permission}"
        )
    
    return current_user


def create_permission_dependency(permission: str):
    """
    Factory function to create permission dependencies
    Usage: Depends(create_permission_dependency("finance.create"))
    """
    async def permission_checker(
        current_user: UserResponse = Depends(get_current_user),
        db: Database = Depends(get_db)
    ) -> UserResponse:
        has_permission = await db.fetch_one(
            """
            SELECT 1
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ? AND p.name = ?
            """,
            (current_user.role_id, permission)
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission}"
            )
        
        return current_user
    
    return permission_checker


async def log_audit(
    db: Database,
    user_id: int,
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    old_values: Optional[str] = None,
    new_values: Optional[str] = None,
    ip_address: Optional[str] = None
):
    """
    Log an audit trail entry - immutable accountability
    """
    await db.execute(
        """
        INSERT INTO audit_logs 
        (user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
    )
    await db.commit()
