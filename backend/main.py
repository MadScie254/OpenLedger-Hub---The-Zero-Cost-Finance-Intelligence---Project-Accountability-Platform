"""
OpenLedger Hub - Main FastAPI Application
Open-access REST API for transparent finance & project tracking
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
    print("[Starting] OpenLedger Hub...")
    init_db()
    await db.connect()
    print(f"[Database] Connected: {settings.database_path}")
    print(f"[CORS] Enabled for: {settings.cors_origins}")
    print(f"[Access] Open Access - No Authentication Required")
    
    yield
    
    # Shutdown
    await db.disconnect()
    print("[Shutdown] OpenLedger Hub")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Zero-cost, open-access finance & project intelligence platform for SMEs, NGOs, and community organizations",
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
        "access": "open",
        "message": "OpenLedger Hub - Open Access Finance Intelligence Platform"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# Import and register route modules
from routes import finance, projects, assets, impact
from app.routes import analytics, external_data

app.include_router(analytics.router, tags=["Analytics"])
app.include_router(external_data.router, tags=["External Data & APIs"])
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
