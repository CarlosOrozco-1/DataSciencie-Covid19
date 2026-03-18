"""
Router para endpoints de resumen y filtrado.
Maneja las rutas /api/resumen y /api/filtrar
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.services.data_service import data_service
from app.models import ResumenNacional, DatosFiltrados

# Crear router con prefijo /api
router = APIRouter(prefix="/api", tags=["General"])


@router.get("/resumen", response_model=ResumenNacional)
async def obtener_resumen():
    """
    Obtiene el resumen nacional de COVID-19.
    
    Returns:
        Estadísticas totales de confirmados, fallecidos y tamizados
    """
    resumen = data_service.obtener_resumen_nacional()
    return resumen


@router.get("/filtrar", response_model=DatosFiltrados)
async def filtrar_datos(
    departamento: Optional[int] = Query(None, description="Código del departamento"),
    municipio: Optional[int] = Query(None, description="Código del municipio"),
    fecha_inicio: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    """
    Obtiene datos filtrados según los parámetros especificados.
    
    Args:
        departamento: Filtrar por código de departamento
        municipio: Filtrar por código de municipio
        fecha_inicio: Fecha inicial del rango
        fecha_fin: Fecha final del rango
        
    Returns:
        Datos filtrados con información de departamentos/municipios
    """
    datos = data_service.obtener_datos_filtrados(
        codigo_departamento=departamento,
        codigo_municipio=municipio,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin
    )
    return datos
