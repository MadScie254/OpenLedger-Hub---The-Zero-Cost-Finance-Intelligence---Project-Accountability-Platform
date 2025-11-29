"""
User CRUD operations for database.

Handles user creation, retrieval, and updates.
Supports both traditional and Google OAuth users.
"""

import sqlite3
from typing import Optional, Dict, Any
from datetime import datetime


class User:
    """User model"""
    def __init__(self, id: int, email: str, username: str, full_name: str, 
                 google_sub: Optional[str] = None, google_picture: Optional[str] = None,
                 role_id: int = 1, created_at: Optional[str] = None):
        self.id = id
        self.email = email
        self.username = username
        self.full_name = full_name
        self.google_sub = google_sub
        self.google_picture = google_picture
        self.role_id = role_id
        self.created_at = created_at


def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('backend/openledger.db')
    conn.row_factory = sqlite3.Row
    return conn


def get_user_by_google_sub(google_sub: str) -> Optional[User]:
    """
    Get user by Google subject ID.
    
    Args:
        google_sub: Google's unique user identifier
        
    Returns:
        User object if found, None otherwise
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT * FROM users WHERE google_sub = ?",
            (google_sub,)
        )
        row = cursor.fetchone()
        
        if row:
            return User(
                id=row['id'],
                email=row['email'],
                username=row['username'],
                full_name=row['full_name'],
                google_sub=row.get('google_sub'),
                google_picture=row.get('google_picture'),
                role_id=row.get('role_id', 1),
                created_at=row.get('created_at')
            )
        return None
    finally:
        conn.close()


def get_user_by_email(email: str) -> Optional[User]:
    """
    Get user by email address.
    
    Args:
        email: User's email address
        
    Returns:
        User object if found, None otherwise
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        )
        row = cursor.fetchone()
        
        if row:
            return User(
                id=row['id'],
                email=row['email'],
                username=row['username'],
                full_name=row['full_name'],
                google_sub=row.get('google_sub'),
                google_picture=row.get('google_picture'),
                role_id=row.get('role_id', 1),
                created_at=row.get('created_at')
            )
        return None
    finally:
        conn.close()


def create_user_from_google(google_sub: str, email: str, name: str, picture: Optional[str] = None) -> User:
    """
    Create a new user from Google OAuth data.
    
    Args:
        google_sub: Google's unique user identifier
        email: User's email from Google
        name: User's full name from Google
        picture: URL to user's Google profile picture
        
    Returns:
        Newly created User object
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Generate username from email (before @)
        username = email.split('@')[0]
        
        # Check if username exists, make unique if needed
        base_username = username
        counter = 1
        while True:
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            if not cursor.fetchone():
                break
            username = f"{base_username}{counter}"
            counter += 1
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (email, username, full_name, google_sub, google_picture, role_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            email,
            username,
            name,
            google_sub,
            picture,
            1,  # Default role (can be mapped to 'user' role)
            datetime.utcnow().isoformat()
        ))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        return User(
            id=user_id,
            email=email,
            username=username,
            full_name=name,
            google_sub=google_sub,
            google_picture=picture,
            role_id=1,
            created_at=datetime.utcnow().isoformat()
        )
    finally:
        conn.close()


def update_user_google_info(user_id: int, google_sub: str, google_picture: Optional[str] = None) -> None:
    """
    Update existing user with Google OAuth information.
    
    Args:
        user_id: User's database ID
        google_sub: Google's unique user identifier
        google_picture: URL to user's Google profile picture
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE users
            SET google_sub = ?, google_picture = ?, updated_at = ?
            WHERE id = ?
        """, (
            google_sub,
            google_picture,
            datetime.utcnow().isoformat(),
            user_id
        ))
        conn.commit()
    finally:
        conn.close()


def update_last_login(user_id: int) -> None:
    """
    Update user's last login timestamp.
    
    Args:
        user_id: User's database ID
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE users
            SET last_login = ?
            WHERE id = ?
        """, (
            datetime.utcnow().isoformat(),
            user_id
        ))
        conn.commit()
    finally:
        conn.close()
