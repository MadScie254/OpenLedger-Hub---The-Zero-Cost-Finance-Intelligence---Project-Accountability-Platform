"""
OpenLedger Black - Main FastAPI Application
Enterprise-grade REST API - surgical precision, zero bullshit
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from config import settings
from database import db, init_db
from app.core.security import setup_cors, add_security_headers


# Initialize database on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting OpenLedger Black...")
    init_db()
    await db.connect()
    print(f"✅ Database connected: {settings.database_path}")
    print(f"🌍 CORS enabled for: {settings.cors_origins}")
    print(f"🔐 JWT expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
    
    yield
    
    # Shutdown
    await db.disconnect()
    print("👋 Shutting down OpenLedger Black")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Zero-cost, SQLite-powered, enterprise-grade finance & project intelligence platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# Security Middleware
setup_cors(app)
add_security_headers(app)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - system status"""
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "message": "OpenLedger Black - Enterprise Finance Intelligence Platform"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2024-03-26T10:25:00Z"
    }


# Import and register route modules
from routes import auth, finance, projects, assets, impact
from app.routes import auth_google, analytics

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(auth_google.router, tags=["Google OAuth"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(impact.router, prefix="/api/impact", tags=["Impact"])



# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle unexpected errors gracefully"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
