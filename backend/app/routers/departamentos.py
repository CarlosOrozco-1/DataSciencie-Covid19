"""
Router para endpoints relacionados con departamentos.
Maneja las rutas /api/departamentos/*
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.data_service import data_service
from app.models import Departamento, DatosDepartamento

# Crear router con prefijo
router = APIRouter(prefix="/api/departamentos", tags=["Departamentos"])


@router.get("", response_model=List[Departamento])
async def obtener_departamentos():
    """
    Obtiene la lista de todos los departamentos de Guatemala.
    
    Returns:
        Lista de departamentos con su código, nombre y población
    """
    departamentos = data_service.obtener_lista_departamentos()
    return departamentos


@router.get("/{codigo}", response_model=DatosDepartamento)
async def obtener_departamento(codigo: int):
    """
    Obtiene los datos completos de un departamento específico.
    
    Args:
        codigo: Código del departamento
        
    Returns:
        Datos del departamento incluyendo estadísticas y municipios
    """
    datos = data_service.obtener_datos_departamento(codigo)
    
    if datos is None:
        raise HTTPException(
            status_code=404,
            detail=f"Departamento con código {codigo} no encontrado"
        )
    
    return datos


@router.get("/{codigo}/municipios")
async def obtener_municipios_departamento(codigo: int):
    """
    Obtiene la lista de municipios de un departamento específico.
    
    Args:
        codigo: Código del departamento
        
    Returns:
        Lista de municipios del departamento
    """
    # Verificar que el departamento existe
    datos_dep = data_service.obtener_datos_departamento(codigo)
    if datos_dep is None:
        raise HTTPException(
            status_code=404,
            detail=f"Departamento con código {codigo} no encontrado"
        )
    
    # Obtener municipios
    municipios = data_service.obtener_lista_municipios(codigo)
    return {
        "departamento": datos_dep["departamento"],
        "codigo_departamento": codigo,
        "municipios": municipios
    }
