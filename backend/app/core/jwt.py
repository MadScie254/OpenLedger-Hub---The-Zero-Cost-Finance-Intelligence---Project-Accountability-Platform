"""
Core JWT utilities for authentication.

Provides functions to:
- Create JWT access tokens
- Verify and decode tokens
- Set secure HTTPOnly cookies
- Extract user from token
"""

import os
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from fastapi import Response, HTTPException, status
from pydantic import BaseModel


class JWTSettings(BaseModel):
    """JWT configuration from environment"""
    secret: str = os.getenv("JWT_SECRET", "CHANGE-THIS-IN-PRODUCTION-MIN-32-CHARS")
    algorithm: str = os.getenv("JWT_ALGO", "HS256")
    expires_seconds: int = int(os.getenv("JWT_EXPIRES_SECONDS", "3600"))  # 1 hour default
    cookie_name: str = "openledger_session"
    cookie_domain: Optional[str] = os.getenv("COOKIE_DOMAIN")  # None for localhost
    is_production: bool = os.getenv("DEBUG", "true").lower() != "true"


# Singleton settings
jwt_settings = JWTSettings()


def create_access_token(user_id: int, email: str, additional_claims: Optional[Dict[str, Any]] = None) -> str:
    """
    Create a JWT access token for authenticated user.
    
    Args:
        user_id: User's database ID
        email: User's email address
        additional_claims: Optional extra claims to include in token
        
    Returns:
        Encoded JWT token string
        
    Example:
        token = create_access_token(user_id=123, email="user@example.com")
    """
    now = int(time.time())
    
    # Standard claims
    payload = {
        "sub": str(user_id),  # Subject (user ID)
        "email": email,
        "iat": now,  # Issued at
        "exp": now + jwt_settings.expires_seconds,  # Expiration
        "iss": "openledger-black",  # Issuer
    }
    
    # Add any additional claims
    if additional_claims:
        payload.update(additional_claims)
    
    # Encode token
    token = jwt.encode(
        payload,
        jwt_settings.secret,
        algorithm=jwt_settings.algorithm
    )
    
    return token


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload dictionary
        
    Raises:
        HTTPException: If token is invalid, expired, or malformed
        
    Example:
        payload = verify_token(token)
        user_id = int(payload['sub'])
    """
    try:
        payload = jwt.decode(
            token,
            jwt_settings.secret,
            algorithms=[jwt_settings.algorithm],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
            }
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


def set_auth_cookie(response: Response, token: str) -> None:
    """
    Set a secure HTTPOnly authentication cookie.
    
    Security features:
    - HTTPOnly: Prevents JavaScript access (XSS protection)
    - Secure: HTTPS only in production
    - SameSite=Lax: CSRF protection
    - Path=/: Available to all routes
    
    Args:
        response: FastAPI Response object
        token: JWT token to store in cookie
        
    Example:
        set_auth_cookie(response, token)
    """
    response.set_cookie(
        key=jwt_settings.cookie_name,
        value=token,
        httponly=True,  # Prevent JavaScript access
        secure=jwt_settings.is_production,  # HTTPS only in production
        samesite="lax",  # CSRF protection
        max_age=jwt_settings.expires_seconds,
        path="/",
        domain=jwt_settings.cookie_domain,  # None for localhost
    )


def clear_auth_cookie(response: Response) -> None:
    """
    Clear the authentication cookie (for logout).
    
    Args:
        response: FastAPI Response object
        
    Example:
        clear_auth_cookie(response)
    """
    response.delete_cookie(
        key=jwt_settings.cookie_name,
        path="/",
        domain=jwt_settings.cookie_domain,
    )


def get_user_id_from_token(token: str) -> int:
    """
    Extract user ID from verified token.
    
    Args:
        token: JWT token string
        
    Returns:
        User ID as integer
        
    Raises:
        HTTPException: If token invalid or missing 'sub' claim
        
    Example:
        user_id = get_user_id_from_token(token)
    """
    payload = verify_token(token)
    user_id_str = payload.get("sub")
    
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID"
        )
    
    try:
        return int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
