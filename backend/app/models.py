"""
Modelos Pydantic para la API de COVID-19 Guatemala.
Define las estructuras de datos utilizadas en la aplicación.
"""

from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import date


class DepartamentoBase(BaseModel):
    """Modelo base para departamento."""
    nombre: str = Field(..., description="Nombre del departamento")
    codigo: int = Field(..., description="Código del departamento")


class Departamento(DepartamentoBase):
    """Modelo completo de departamento con datos adicionales."""
    poblacion: Optional[int] = Field(None, description="Población total del departamento")
    
    class Config:
        from_attributes = True


class MunicipioBase(BaseModel):
    """Modelo base para municipio."""
    nombre: str = Field(..., description="Nombre del municipio")
    codigo: int = Field(..., description="Código del municipio")
    codigo_departamento: int = Field(..., description="Código del departamento al que pertenece")


class Municipio(MunicipioBase):
    """Modelo completo de municipio con datos adicionales."""
    departamento: Optional[str] = Field(None, description="Nombre del departamento")
    poblacion: Optional[int] = Field(None, description="Población del municipio")
    
    class Config:
        from_attributes = True


class DatosDepartamento(BaseModel):
    """Modelo para datos estadísticos de un departamento."""
    departamento: str
    codigo_departamento: int
    total_confirmados: int = Field(0, description="Total de casos confirmados")
    total_fallecidos: int = Field(0, description="Total de fallecidos")
    total_tamizados: int = Field(0, description="Total de tamizados")
    poblacion: Optional[int] = Field(None, description="Población del departamento")
    municipios: Optional[List[Municipio]] = Field(default_factory=list, description="Lista de municipios")


class DatosMunicipio(BaseModel):
    """Modelo para datos estadísticos de un municipio."""
    municipio: str
    codigo_municipio: int
    departamento: str
    codigo_departamento: int
    total_confirmados: int = Field(0, description="Total de casos confirmados")
    total_fallecidos: int = Field(0, description="Total de fallecidos")
    total_tamizados: int = Field(0, description="Total de tamizados")
    poblacion: Optional[int] = Field(None, description="Población del municipio")


class ResumenNacional(BaseModel):
    """Modelo para el resumen nacional de COVID-19."""
    total_confirmados: int = Field(0, description="Total de casos confirmados a nivel nacional")
    total_fallecidos: int = Field(0, description="Total de fallecidos a nivel nacional")
    total_tamizados: int = Field(0, description="Total de tamizados a nivel nacional")
    poblacion_total: Optional[int] = Field(None, description="Población total de Guatemala")
    num_departamentos: int = Field(0, description="Número de departamentos")
    num_municipios: int = Field(0, description="Número de municipios")
    departamentos: Optional[List[Departamento]] = Field(default_factory=list, description="Lista de departamentos")


class FiltroRequest(BaseModel):
    """Modelo para solicitar filtrado de datos."""
    codigo_departamento: Optional[int] = Field(None, description="Filtrar por código de departamento")
    codigo_municipio: Optional[int] = Field(None, description="Filtrar por código de municipio")
    fecha_inicio: Optional[str] = Field(None, description="Fecha de inicio (YYYY-MM-DD)")
    fecha_fin: Optional[str] = Field(None, description="Fecha de fin (YYYY-MM-DD)")


class DatosFiltrados(BaseModel):
    """Modelo para datos filtrados."""
    datos: List[Dict] = Field(default_factory=list, description="Lista de datos filtrados")
    total_registros: int = Field(0, description="Total de registros encontrados")
    filtros_aplicados: Optional[Dict] = Field(None, description="Filtros que se aplicaron")
