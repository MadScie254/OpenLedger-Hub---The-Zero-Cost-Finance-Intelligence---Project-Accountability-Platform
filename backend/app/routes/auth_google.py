"""
Google OAuth 2.0 Authentication Route

Verifies Google ID tokens and creates/updates user sessions.
Uses google-auth library for secure server-side verification.

Security features:
- Validates audience (aud) matches our client_id
- Verifies issuer (iss) is Google
- Sets HTTPOnly Secure cookies
- Rate limited to prevent abuse
- Logs authentication attempts (without storing tokens)
"""

from fastapi import APIRouter, HTTPException, Response, Request, status
from pydantic import BaseModel, validator
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import logging

from ..core.jwt import create_access_token, set_auth_cookie
from ..crud.users import (
    get_user_by_google_sub,
    get_user_by_email,
    create_user_from_google,
    update_user_google_info,
    update_last_login
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Google Client ID from environment
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "201157854759-kda437apl4amk0vq9c4kkgffq00mqmqo.apps.googleusercontent.com"
)


class GoogleTokenRequest(BaseModel):
    """Request body for Google OAuth"""
    id_token: str
    
    @validator('id_token')
    def validate_token_format(cls, v):
        """Basic validation of token format"""
        if not v or len(v) < 100:
            raise ValueError('Invalid token format')
        if v.count('.') != 2:
            raise ValueError('Invalid JWT structure')
        return v


class UserResponse(BaseModel):
    """Response with user data (no sensitive info)"""
    id: int
    email: str
    name: str
    picture: str | None = None


@router.post("/google", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def google_oauth_signin(
    body: GoogleTokenRequest,
    response: Response,
    request: Request
) -> UserResponse:
    """
    Verify Google ID token and create/update user session.
    
    Process:
    1. Verify ID token with Google's public keys
    2. Validate audience and issuer
    3. Find or create user in database
    4. Generate JWT and set secure cookie
    5. Return user data
    
    Security:
    - Token verified server-side (not tokeninfo endpoint)
    - Audience must match our client_id
    - Issuer must be accounts.google.com
    - HTTPOnly Secure cookie set
    - Rate limited (configured in main.py)
    
    Returns:
        UserResponse with user ID, email, name, and picture
        
    Raises:
        HTTPException 401: Invalid token, wrong audience, or verification failed
        HTTPException 500: Database or server error
    """
    
    # Log authentication attempt (IP address only, no token)
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"Google OAuth attempt from IP: {client_ip}")
    
    # Step 1: Verify the ID token with Google
    try:
        # Use google-auth library for secure verification
        # This validates signature, expiration, and issuer automatically
        payload = id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        # Token verification failed
        logger.warning(f"Google token verification failed from {client_ip}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )
    
    # Step 2: Validate audience (must match our client_id)
    token_audience = payload.get("aud")
    if token_audience != GOOGLE_CLIENT_ID:
        logger.warning(f"Token audience mismatch from {client_ip}. Expected {GOOGLE_CLIENT_ID}, got {token_audience}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not intended for this application"
        )
    
    # Step 3: Validate issuer (must be Google)
    token_issuer = payload.get("iss")
    valid_issuers = ["accounts.google.com", "https://accounts.google.com"]
    if token_issuer not in valid_issuers:
        logger.warning(f"Invalid token issuer from {client_ip}: {token_issuer}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer"
        )
    
    # Step 4: Extract user information from payload
    google_sub = payload.get("sub")  # Google's unique user ID
    email = payload.get("email")
    name = payload.get("name", email.split("@")[0])  # Fallback to email username
    picture = payload.get("picture")  # Profile picture URL
    email_verified = payload.get("email_verified", False)
    
    # Validate required fields
    if not google_sub or not email:
        logger.error(f"Missing required fields in Google token from {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required user information"
        )
    
    # Optional: Require verified email
    if not email_verified:
        logger.warning(f"Unverified email attempted sign-in: {email}")
        # Uncomment to enforce:
        # raise HTTPException(
        #     status_code=status.HTTP_401_UNAUTHORIZED,
        #     detail="Email not verified with Google"
        # )
    
    # Step 5: Find or create user in database
    try:
        # First, try to find user by Google sub (most reliable)
        user = get_user_by_google_sub(google_sub)
        
        if user:
            # Existing Google user - update their info if picture changed
            if user.google_picture != picture:
                update_user_google_info(user.id, google_sub, picture)
                user.google_picture = picture
            logger.info(f"Existing Google user logged in: {email}")
        else:
            # Check if user exists with this email (might be traditional auth user)
            user = get_user_by_email(email)
            
            if user:
                # Existing traditional user - link Google account
                update_user_google_info(user.id, google_sub, picture)
                user.google_sub = google_sub
                user.google_picture = picture
                logger.info(f"Linked Google account to existing user: {email}")
            else:
                # New user - create from Google data
                user = create_user_from_google(google_sub, email, name, picture)
                logger.info(f"New Google user created: {email}")
        
        # Update last login timestamp
        update_last_login(user.id)
        
    except Exception as e:
        logger.error(f"Database error during user upsert: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create or update user"
        )
    
    # Step 6: Generate JWT access token
    try:
        token = create_access_token(
            user_id=user.id,
            email=user.email,
            additional_claims={"name": user.full_name}
        )
    except Exception as e:
        logger.error(f"Error creating JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )
    
    # Step 7: Set secure HTTPOnly cookie
    set_auth_cookie(response, token)
    
    logger.info(f"✅ Google OAuth successful for user {user.id}: {email}")
    
    # Step 8: Return user data (no sensitive information)
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.full_name,
        picture=user.google_picture
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Log out user by clearing session cookie.
    
    Returns:
        Success message
    """
    from ..core.jwt import clear_auth_cookie
    clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/ping")
async def auth_ping():
    """
    Health check endpoint for authentication service.
    
    Returns:
        Status message
    """
    return {"status": "ok", "service": "authentication"}
