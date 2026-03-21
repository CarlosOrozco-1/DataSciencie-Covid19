"""
Configuración general de la aplicación FastAPI.
Este archivo contiene las variables de configuración del proyecto.
"""

from pathlib import Path

# Ruta base del backend (carpeta backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Ruta base del proyecto (carpeta raíz)
PROJECT_ROOT = BASE_DIR.parent


def _resolver_directorio_datos() -> Path:
    """
    Resuelve dinámicamente la ruta de datos CSV.

    Soporta dos estructuras válidas del proyecto:
    1) backend/Datos/
    2) Datos/ (en la raíz del repositorio)
    """
    candidatos = [
        BASE_DIR / "Datos",
        PROJECT_ROOT / "Datos",
    ]

    for ruta in candidatos:
        if ruta.exists() and ruta.is_dir():
            return ruta

    # Si no existe ninguna, se devuelve la ruta estándar backend/Datos
    # para mantener un valor consistente y facilitar diagnósticos.
    return BASE_DIR / "Datos"


# Ruta final de los datos CSV
DATOS_DIR = _resolver_directorio_datos()

# Nombre de los archivos CSV disponibles
ARCHIVOS_CSV = {
    "confirmados_emision": "Confirmados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-19.csv",
    "confirmados_sintomas": "Confirmados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-19.csv",
    "confirmados_muestra": "Confirmados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-19.csv",
    "fallecidos": "Fallecidos por municipio, fecha de fallecimiento del 2020-02-13 al 2026-03-19.csv",
    "tamizados_emision": "Tamizados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-19.csv",
    "tamizados_sintomas": "Tamizados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-19.csv",
    "tamizados_muestra": "Tamizados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-19.csv",
}

# Configuración de la API
API_TITLE = "API COVID-19 Guatemala"
API_VERSION = "1.0.0"
API_DESCRIPTION = "API para consultar datos de COVID-19 por departamento y municipio en Guatemala"

# Configuración de CORS
CORS_ORIGINS = ["*"]
