from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.controllers.email_controller import router as email_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Sortbox - Email Classifier API",
        description="API para classificação automática de emails usando Inteligência Artificial",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(email_router, prefix="/api/v1", tags=["Email Classification"])
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "message": "SortMailBox API is running"}
    return app
