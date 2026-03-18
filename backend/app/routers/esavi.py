"""
Router para endpoints de análisis ESAVI.
Maneja rutas bajo /api/esavi.
"""

from typing import Optional
from fastapi import APIRouter, Query

from app.models import EsaviResumen, EsaviFiltrado
from app.services.data_service import data_service


router = APIRouter(prefix="/api/esavi", tags=["ESAVI"])


@router.get("/resumen", response_model=EsaviResumen)
async def obtener_resumen_esavi():
    """
    Retorna resumen agregado de la base ESAVI.

    Returns:
        Totales y distribuciones por sexo/edad/área.
    """
    return data_service.obtener_resumen_esavi()


@router.get("/filtrar", response_model=EsaviFiltrado)
async def obtener_esavi_filtrado(
    sexo: Optional[str] = Query(None, description="Sexo: Masculino o Femenino"),
    grupo_etario: Optional[str] = Query(None, description="Grupo etario, ejemplo: 30-39"),
    clasificacion: Optional[str] = Query(None, description="Clasificación: GRAVE o NO GRAVE"),
    area_salud: Optional[str] = Query(None, description="Área de salud"),
):
    """
    Retorna resumen ESAVI aplicando filtros opcionales.

    Returns:
        Conteos agregados filtrados.
    """
    return data_service.obtener_esavi_filtrado(
        sexo=sexo,
        grupo_etario=grupo_etario,
        clasificacion=clasificacion,
        area_salud=area_salud,
    )
