"""
Servicio principal para el manejo de datos COVID-19.
Este archivo contiene la lógica de negocio para leer y procesar los archivos CSV.
"""

import pandas as pd
from pathlib import Path
from typing import Optional, List, Dict, Tuple
from app.config import DATOS_DIR, ARCHIVOS_CSV


class DataService:
    """
    Clase servicio para manejar datos de COVID-19 desde archivos CSV.
    Proporciona métodos para obtener departamentos, municipios y estadísticas.
    """
    
    def __init__(self):
        """Inicializa el servicio cargando los datos CSV."""
        self._dataframes: Dict[str, pd.DataFrame] = {}
        self._cargar_datos()
    
    def _cargar_datos(self) -> None:
        """
        Carga todos los archivos CSV en DataFrames de pandas.
        Se ejecuta automáticamente al inicializar el servicio.
        """
        for clave, nombre_archivo in ARCHIVOS_CSV.items():
            ruta = DATOS_DIR / nombre_archivo
            if ruta.exists():
                self._dataframes[clave] = pd.read_csv(ruta)
            else:
                print(f"Advertencia: No se encontró el archivo {nombre_archivo}")
    
    def _obtener_dataframe(self, tipo: str) -> Optional[pd.DataFrame]:
        """
        Obtiene un DataFrame específico por tipo de datos.
        
        Args:
            tipo: Clave del tipo de datos (confirmados, fallecidos, tamizados)
            
        Returns:
            DataFrame de pandas o None si no existe
        """
        return self._dataframes.get(tipo)

    def _filtrar_registros_validos(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Filtra registros válidos de departamento/municipio.

        Excluye filas de ruido donde el nombre viene como "0"
        o códigos fuera del rango esperado.
        """
        df_limpio = df.copy()

        if "codigo_departamento" in df_limpio.columns:
            df_limpio = df_limpio[df_limpio["codigo_departamento"].between(1, 22)]

        if "departamento" in df_limpio.columns:
            df_limpio = df_limpio[df_limpio["departamento"].astype(str).str.strip() != "0"]

        if "municipio" in df_limpio.columns:
            df_limpio = df_limpio[df_limpio["municipio"].astype(str).str.strip() != "0"]

        return df_limpio
    
    def obtener_lista_departamentos(self) -> List[Dict]:
        """
        Obtiene la lista de todos los departamentos únicos.
        
        Returns:
            Lista de diccionarios con información de departamentos
        """
        df = self._obtener_dataframe("confirmados_emision")
        if df is None:
            return []

        # Limpiar registros inválidos antes de construir catálogo.
        df = self._filtrar_registros_validos(df)
        
        # Consolidar departamentos por código y nombre.
        # Se suma la población de municipios para obtener población departamental.
        departamentos = (
            df[["codigo_departamento", "departamento", "poblacion"]]
            .groupby(["codigo_departamento", "departamento"], as_index=False)["poblacion"]
            .sum()
            .sort_values("codigo_departamento")
        )
        
        return [
            {
                "codigo": int(row["codigo_departamento"]),
                "nombre": row["departamento"],
                "poblacion": int(row["poblacion"]) if pd.notna(row["poblacion"]) else 0
            }
            for row in departamentos.to_dict("records")
        ]
    
    def obtener_lista_municipios(self, codigo_departamento: Optional[int] = None) -> List[Dict]:
        """
        Obtiene la lista de municipios, opcionalmente filtrados por departamento.
        
        Args:
            codigo_departamento: Código del departamento para filtrar (opcional)
            
        Returns:
            Lista de diccionarios con información de municipios
        """
        df = self._obtener_dataframe("confirmados_emision")
        if df is None:
            return []

        # Limpiar registros inválidos antes de construir catálogo.
        df = self._filtrar_registros_validos(df)
        
        if codigo_departamento:
            df = df[df["codigo_departamento"] == codigo_departamento]
        
        municipios = df[["codigo_municipio", "codigo_departamento", "municipio", "departamento", "poblacion"]].drop_duplicates()
        municipios = municipios.sort_values(["codigo_departamento", "codigo_municipio"])
        
        return [
            {
                "codigo": int(row["codigo_municipio"]),
                "codigo_departamento": int(row["codigo_departamento"]),
                "nombre": row["municipio"],
                "departamento": row["departamento"],
                "poblacion": int(row["poblacion"]) if pd.notna(row["poblacion"]) else 0
            }
            for row in municipios.to_dict("records")
        ]
    
    def obtener_datos_departamento(self, codigo_departamento: int) -> Optional[Dict]:
        """
        Obtiene los datos completos de un departamento específico.
        
        Args:
            codigo_departamento: Código del departamento
            
        Returns:
            Diccionario con datos del departamento o None si no existe
        """
        df_confirmados = self._obtener_dataframe("confirmados_emision")
        df_fallecidos = self._obtener_dataframe("fallecidos")
        df_tamizados = self._obtener_dataframe("tamizados_emision")
        
        if df_confirmados is None:
            return None

        # Limpiar registros inválidos.
        df_confirmados = self._filtrar_registros_validos(df_confirmados)
        
        # Filtrar por departamento
        df_dep = df_confirmados[df_confirmados["codigo_departamento"] == codigo_departamento]
        
        if df_dep.empty:
            return None
        
        # Obtener información del departamento (evitando valores "0").
        nombres_validos = [
            n for n in df_dep["departamento"].astype(str).tolist() if n.strip() and n.strip() != "0"
        ]
        nombre_departamento = nombres_validos[0] if nombres_validos else str(df_dep["departamento"].iloc[0])
        poblacion = df_dep["poblacion"].sum()
        
        # Calcular totales de confirmados (suma de todas las columnas de fecha)
        columnas_fecha = [col for col in df_dep.columns if col.startswith("20") or col.startswith("19")]
        total_confirmados = df_dep[columnas_fecha].sum().sum()
        
        # Calcular totales de fallecidos
        total_fallecidos = 0
        if df_fallecidos is not None:
            df_fall = df_fallecidos[df_fallecidos["codigo_departamento"] == codigo_departamento]
            if not df_fall.empty:
                columnas_fecha_fall = [col for col in df_fall.columns if col.startswith("20") or col.startswith("19")]
                total_fallecidos = df_fall[columnas_fecha_fall].sum().sum()
        
        # Calcular totales de tamizados
        total_tamizados = 0
        if df_tamizados is not None:
            df_tam = df_tamizados[df_tamizados["codigo_departamento"] == codigo_departamento]
            if not df_tam.empty:
                columnas_fecha_tam = [col for col in df_tam.columns if col.startswith("20") or col.startswith("19")]
                total_tamizados = df_tam[columnas_fecha_tam].sum().sum()
        
        # Obtener municipios del departamento
        municipios = self.obtener_lista_municipios(codigo_departamento)
        
        return {
            "departamento": nombre_departamento,
            "codigo_departamento": codigo_departamento,
            "total_confirmados": int(total_confirmados),
            "total_fallecidos": int(total_fallecidos),
            "total_tamizados": int(total_tamizados),
            "poblacion": int(poblacion),
            "municipios": municipios
        }
    
    def obtener_datos_municipio(self, codigo_municipio: int) -> Optional[Dict]:
        """
        Obtiene los datos completos de un municipio específico.
        
        Args:
            codigo_municipio: Código del municipio
            
        Returns:
            Diccionario con datos del municipio o None si no existe
        """
        df_confirmados = self._obtener_dataframe("confirmados_emision")
        df_fallecidos = self._obtener_dataframe("fallecidos")
        df_tamizados = self._obtener_dataframe("tamizados_emision")
        
        if df_confirmados is None:
            return None

        # Limpiar registros inválidos.
        df_confirmados = self._filtrar_registros_validos(df_confirmados)
        
        # Filtrar por municipio
        df_mun = df_confirmados[df_confirmados["codigo_municipio"] == codigo_municipio]
        
        if df_mun.empty:
            return None
        
        # Obtener información del municipio
        nombre_municipio = df_mun["municipio"].iloc[0]
        nombre_departamento = df_mun["departamento"].iloc[0]
        codigo_departamento = int(df_mun["codigo_departamento"].iloc[0])
        poblacion = int(df_mun["poblacion"].iloc[0]) if pd.notna(df_mun["poblacion"].iloc[0]) else 0
        
        # Calcular totales de confirmados
        columnas_fecha = [col for col in df_mun.columns if col.startswith("20") or col.startswith("19")]
        total_confirmados = df_mun[columnas_fecha].sum().sum()
        
        # Calcular totales de fallecidos
        total_fallecidos = 0
        if df_fallecidos is not None:
            df_fall = df_fallecidos[df_fallecidos["codigo_municipio"] == codigo_municipio]
            if not df_fall.empty:
                columnas_fecha_fall = [col for col in df_fall.columns if col.startswith("20") or col.startswith("19")]
                total_fallecidos = df_fall[columnas_fecha_fall].sum().sum()
        
        # Calcular totales de tamizados
        total_tamizados = 0
        if df_tamizados is not None:
            df_tam = df_tamizados[df_tamizados["codigo_municipio"] == codigo_municipio]
            if not df_tam.empty:
                columnas_fecha_tam = [col for col in df_tam.columns if col.startswith("20") or col.startswith("19")]
                total_tamizados = df_tam[columnas_fecha_tam].sum().sum()
        
        return {
            "municipio": nombre_municipio,
            "codigo_municipio": codigo_municipio,
            "departamento": nombre_departamento,
            "codigo_departamento": codigo_departamento,
            "total_confirmados": int(total_confirmados),
            "total_fallecidos": int(total_fallecidos),
            "total_tamizados": int(total_tamizados),
            "poblacion": poblacion
        }
    
    def obtener_resumen_nacional(self) -> Dict:
        """
        Obtiene el resumen nacional de COVID-19.
        
        Returns:
            Diccionario con estadísticas nacionales
        """
        df_confirmados = self._obtener_dataframe("confirmados_emision")
        df_fallecidos = self._obtener_dataframe("fallecidos")
        df_tamizados = self._obtener_dataframe("tamizados_emision")
        
        if df_confirmados is None:
            return {}
        
        # Calcular totales
        columnas_fecha = [col for col in df_confirmados.columns if col.startswith("20") or col.startswith("19")]
        total_confirmados = df_confirmados[columnas_fecha].sum().sum()
        
        total_fallecidos = 0
        if df_fallecidos is not None:
            columnas_fecha_fall = [col for col in df_fallecidos.columns if col.startswith("20") or col.startswith("19")]
            total_fallecidos = df_fallecidos[columnas_fecha_fall].sum().sum()
        
        total_tamizados = 0
        if df_tamizados is not None:
            columnas_fecha_tam = [col for col in df_tamizados.columns if col.startswith("20") or col.startswith("19")]
            total_tamizados = df_tamizados[columnas_fecha_tam].sum().sum()
        
        # Población total
        poblacion_total = df_confirmados["poblacion"].sum()
        
        # Número de departamentos y municipios
        num_departamentos = df_confirmados["codigo_departamento"].nunique()
        num_municipios = df_confirmados["codigo_municipio"].nunique()
        
        # Obtener lista de departamentos
        departamentos = self.obtener_lista_departamentos()
        
        return {
            "total_confirmados": int(total_confirmados),
            "total_fallecidos": int(total_fallecidos),
            "total_tamizados": int(total_tamizados),
            "poblacion_total": int(poblacion_total),
            "num_departamentos": num_departamentos,
            "num_municipios": num_municipios,
            "departamentos": departamentos
        }
    
    def obtener_datos_filtrados(
        self,
        codigo_departamento: Optional[int] = None,
        codigo_municipio: Optional[int] = None,
        fecha_inicio: Optional[str] = None,
        fecha_fin: Optional[str] = None
    ) -> Dict:
        """
        Obtiene datos filtrados según los parámetros especificados.
        
        Args:
            codigo_departamento: Filtrar por código de departamento
            codigo_municipio: Filtrar por código de municipio
            fecha_inicio: Fecha inicial para el filtro (YYYY-MM-DD)
            fecha_fin: Fecha final para el filtro (YYYY-MM-DD)
            
        Returns:
            Diccionario con datos filtrados y metadatos
        """
        df = self._obtener_dataframe("confirmados_emision")
        
        if df is None:
            return {"datos": [], "total_registros": 0}
        
        # Aplicar filtros
        if codigo_departamento:
            df = df[df["codigo_departamento"] == codigo_departamento]
        
        if codigo_municipio:
            df = df[df["codigo_municipio"] == codigo_municipio]
        
        # Filtrar por fechas
        columnas_fecha = [col for col in df.columns if col.startswith("20") or col.startswith("19")]
        
        if fecha_inicio and fecha_fin:
            # Filtrar columnas de fecha en el rango especificado
            columnas_filtradas = [col for col in columnas_fecha if fecha_inicio <= col <= fecha_fin]
        elif fecha_inicio:
            columnas_filtradas = [col for col in columnas_fecha if col >= fecha_inicio]
        elif fecha_fin:
            columnas_filtradas = [col for col in columnas_fecha if col <= fecha_fin]
        else:
            columnas_filtradas = columnas_fecha
        
        # Calcular totales por registro
        resultados = []
        for _, row in df.iterrows():
            total = row[columnas_filtradas].sum() if columnas_filtradas else 0
            resultados.append({
                "departamento": row["departamento"],
                "codigo_departamento": int(row["codigo_departamento"]),
                "municipio": row["municipio"],
                "codigo_municipio": int(row["codigo_municipio"]),
                "poblacion": int(row["poblacion"]) if pd.notna(row["poblacion"]) else 0,
                "total": int(total)
            })
        
        filtros = {}
        if codigo_departamento:
            filtros["codigo_departamento"] = codigo_departamento
        if codigo_municipio:
            filtros["codigo_municipio"] = codigo_municipio
        if fecha_inicio:
            filtros["fecha_inicio"] = fecha_inicio
        if fecha_fin:
            filtros["fecha_fin"] = fecha_fin
        
        return {
            "datos": resultados,
            "total_registros": len(resultados),
            "filtros_aplicados": filtros if filtros else None
        }


# Instancia global del servicio
data_service = DataService()
