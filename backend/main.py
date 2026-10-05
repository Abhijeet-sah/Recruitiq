import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine, Base
from app.db.init_db import init_db
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database schema initialization notice: {e}")
    # Automatically seed initial demo data if empty
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization error (non-fatal): {e}")
    
    # Synchronize MongoDB Atlas and local database asynchronously in background
    # Never block the server startup or liveness probe
    def _bg_sync():
        try:
            from app.db.mongo import sync_mongo_and_sqlite
            sync_result = sync_mongo_and_sqlite()
            print(f"MongoDB persistence sync complete: {sync_result}")
        except Exception as e:
            print(f"MongoDB background sync notice: {e}")

    import threading
    threading.Thread(target=_bg_sync, daemon=True).start()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RecruitIQ: Smart AI-Based Recruitment and Candidate Evaluation System with Explainable and Fair Decision Support",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for resume file downloads if needed
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "RecruitIQ Decision-Support Platform",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    """Fast, non-blocking liveness probe for cloud platform health checks."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_pipeline": {
            "embeddings": "operational",
            "resume_parser": "operational",
            "adaptive_engine": "operational",
            "fairness_auditor": "operational"
        }
    }

@app.get("/health/mongo")
def mongo_health_check():
    """Dedicated diagnostic endpoint for MongoDB cloud connectivity."""
    try:
        from app.db.mongo import check_mongo_status
        return check_mongo_status()
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
