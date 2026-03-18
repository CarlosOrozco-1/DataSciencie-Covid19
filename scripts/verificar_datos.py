"""
Script de verificacion de archivos de datos requeridos.

Uso:
    python scripts/verificar_datos.py
"""

from pathlib import Path


ARCHIVOS_REQUERIDOS = [
    "Confirmados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv",
    "Confirmados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv",
    "Confirmados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv",
    "Fallecidos por municipio, fecha de fallecimiento del 2020-02-13 al 2026-03-15.csv",
    "Tamizados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv",
    "Tamizados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv",
    "Tamizados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv",
]


def main() -> int:
    """Valida que los archivos requeridos existan en la carpeta Datos/."""
    project_root = Path(__file__).resolve().parent.parent
    datos_dir = project_root / "Datos"

    print(f"[INFO] Directorio de datos: {datos_dir}")

    if not datos_dir.exists():
        print("[ERROR] No existe la carpeta Datos/ en la raiz del proyecto.")
        return 1

    faltantes = [nombre for nombre in ARCHIVOS_REQUERIDOS if not (datos_dir / nombre).exists()]

    if faltantes:
        print("[ERROR] Faltan archivos requeridos:")
        for nombre in faltantes:
            print(f"  - {nombre}")
        return 1

    print("[OK] Todos los archivos de datos requeridos estan presentes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
