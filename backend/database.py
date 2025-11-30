"""
OpenLedger Black - Database Connection Manager
SQLite with async support - lightning-fast, zero-cost, surgical precision
"""

import aiosqlite
import sqlite3
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from config import settings
import os


class Database:
    """
    SQLite database manager with async support
    Built for speed, reliability, and zero external dependencies
    """
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.database_path
        self._connection: Optional[aiosqlite.Connection] = None
    
    async def connect(self):
        """Establish database connection"""
        self._connection = await aiosqlite.connect(self.db_path)
        self._connection.row_factory = aiosqlite.Row
        # Enable foreign keys
        await self._connection.execute("PRAGMA foreign_keys = ON")
        await self._connection.commit()
    
    async def disconnect(self):
        """Close database connection"""
        if self._connection:
            await self._connection.close()
            self._connection = None
    
    async def execute(self, query: str, params: tuple = None) -> aiosqlite.Cursor:
        """Execute a single query"""
        if not self._connection:
            await self.connect()
        return await self._connection.execute(query, params or ())
    
    async def execute_many(self, query: str, params_list: List[tuple]):
        """Execute multiple queries with different parameters"""
        if not self._connection:
            await self.connect()
        await self._connection.executemany(query, params_list)
        await self._connection.commit()
    
    async def fetch_one(self, query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
        """Fetch a single row as dictionary"""
        cursor = await self.execute(query, params)
        row = await cursor.fetchone()
        return dict(row) if row else None
    
    async def fetch_all(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Fetch all rows as list of dictionaries"""
        cursor = await self.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    async def commit(self):
        """Commit current transaction"""
        if self._connection:
            await self._connection.commit()
    
    async def rollback(self):
        """Rollback current transaction"""
        if self._connection:
            await self._connection.rollback()
    
    async def initialize_schema(self, schema_path: str = None):
        """Initialize database schema from SQL file"""
        schema_path = schema_path or os.path.join(
            os.path.dirname(__file__), 
            "database", 
            "schema.sql"
        )
        
        if not os.path.exists(schema_path):
            raise FileNotFoundError(f"Schema file not found: {schema_path}")
        
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        await self._connection.executescript(schema_sql)
        await self.commit()
    
    async def seed_data(self, seed_path: str = None):
        """Load seed data from SQL file"""
        seed_path = seed_path or os.path.join(
            os.path.dirname(__file__), 
            "database", 
            "seed.sql"
        )
        
        if not os.path.exists(seed_path):
            raise FileNotFoundError(f"Seed file not found: {seed_path}")
        
        with open(seed_path, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        
        await self._connection.executescript(seed_sql)
        await self.commit()
    
    @asynccontextmanager
    async def transaction(self):
        """Context manager for transactions"""
        try:
            yield self
            await self.commit()
        except Exception:
            await self.rollback()
            raise


# Global database instance
db = Database()


async def get_db() -> Database:
    """Dependency for FastAPI routes"""
    if not db._connection:
        await db.connect()
    return db


def init_db():
    """
    Synchronous database initialization for startup
    Creates schema and loads seed data if database doesn't exist
    """
    db_exists = os.path.exists(settings.database_path)
    
    if not db_exists:
        print("🔧 Initializing database...")
        conn = sqlite3.connect(settings.database_path)
        
        # Load schema
        schema_path = os.path.join(os.path.dirname(__file__), "database", "schema.sql")
        with open(schema_path, 'r', encoding='utf-8') as f:
            conn.executescript(f.read())
        
        # Load seed data
        seed_path = os.path.join(os.path.dirname(__file__), "database", "seed.sql")
        with open(seed_path, 'r', encoding='utf-8') as f:
            conn.executescript(f.read())
        
        conn.commit()
        conn.close()
        print("[Database] Initialized successfully")
    else:
        print("[Database] Already exists")
