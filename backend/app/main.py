"""
Aplicación principal FastAPI - COVID-19 Guatemala
Este archivo es el punto de entrada de la API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import (
    API_TITLE,
    API_VERSION,
    API_DESCRIPTION,
    CORS_ORIGINS
)
from app.routers import departamentos, municipios, resumen

# Crear aplicación FastAPI
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION
)

# Configurar CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(departamentos.router)
app.include_router(municipios.router)
app.include_router(resumen.router)


@app.get("/")
async def root():
    """
    Endpoint raíz de la API.
    
    Returns:
        Mensaje de bienvenida con información de la API
    """
    return {
        "mensaje": "API COVID-19 Guatemala",
        "version": API_VERSION,
        "documentacion": "/docs",
        "endpoints": {
            "departamentos": "/api/departamentos",
            "municipios": "/api/municipios",
            "resumen": "/api/resumen",
            "filtrar": "/api/filtrar"
        }
    }


@app.get("/health")
async def health_check():
    """
    Endpoint para verificación de estado de la API.
    
    Returns:
        Estado de la aplicación
    """
    return {"status": "healthy"}
