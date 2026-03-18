"""
Router para endpoints relacionados con municipios.
Maneja las rutas /api/municipios/*
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.services.data_service import data_service
from app.models import Municipio, DatosMunicipio

# Crear router con prefijo
router = APIRouter(prefix="/api/municipios", tags=["Municipios"])


@router.get("", response_model=List[Municipio])
async def obtener_municipios():
    """
    Obtiene la lista de todos los municipios de Guatemala.
    
    Returns:
        Lista de municipios con su información completa
    """
    municipios = data_service.obtener_lista_municipios()
    return municipios


@router.get("/{codigo}", response_model=DatosMunicipio)
async def obtener_municipio(codigo: int):
    """
    Obtiene los datos completos de un municipio específico.
    
    Args:
        codigo: Código del municipio
        
    Returns:
        Datos del municipio incluyendo estadísticas
    """
    datos = data_service.obtener_datos_municipio(codigo)
    
    if datos is None:
        raise HTTPException(
            status_code=404,
            detail=f"Municipio con código {codigo} no encontrado"
        )
    
    return datos
