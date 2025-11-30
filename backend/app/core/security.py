"""
Security Configuration and Middleware
Implements rate limiting, CORS, and security headers for production.
"""

import os
from functools import wraps
from time import time
from collections import defaultdict
from typing import Callable
from fastapi import Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


# Rate limiting storage (in-memory, use Redis in production)
_rate_limit_storage = defaultdict(list)


def setup_cors(app):
    """
    Configure CORS middleware with environment-based origins.
    
    Security features:
    - Restricted to frontend URL from environment
    - Credentials allowed for cookies
    - No wildcard origins in production
    """
    allowed_origins = os.getenv("FRONTEND_URL", "http://localhost:3001").split(",")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
    Limits requests per IP address within a time window.
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        
    Usage:
        @router.post("/api/auth/google")
        @rate_limit(max_requests=10, window_seconds=60)
        async def google_signin(...):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Get client IP
            client_ip = request.client.host if request.client else "unknown"
            
            # Get current time
            current_time = time()
            
            # Clean old entries for this IP
            _rate_limit_storage[client_ip] = [
                req_time for req_time in _rate_limit_storage[client_ip]
                if current_time - req_time < window_seconds
            ]
            
            # Check if limit exceeded
            if len(_rate_limit_storage[client_ip]) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Max {max_requests} requests per {window_seconds} seconds."
                )
            
            # Record this request
            _rate_limit_storage[client_ip].append(current_time)
            
            # Call the actual function
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def add_security_headers(app):
    """
    Add security headers middleware to all responses.
    
    Headers added:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security: HTTPS only
    """
    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # HSTS (only in production with HTTPS)
        is_production = os.getenv("DEBUG", "true").lower() != "true"
        if is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
    
    print("🛡️  Security headers middleware enabled")


class CSRFProtection:
    """
    CSRF protection for state-changing requests.
    
    Validates that requests with cookies also have valid CSRF tokens.
    """
    
    @staticmethod
    def generate_token() -> str:
        """Generate a CSRF token"""
        import secrets
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_token(request: Request, token: str) -> bool:
        """Validate CSRF token from request"""
        # Get token from header
        header_token = request.headers.get("X-CSRF-Token")
        
        if not header_token:
            return False
        
        # Constant-time comparison
        import hmac
        return hmac.compare_digest(header_token, token)
