/**
 * Modelos de TypeScript para los datos de COVID-19 Guatemala.
 * Define las estructuras de datos utilizadas en el frontend.
 */

/**
 * Interface que representa un departamento de Guatemala.
 */
export interface Departamento {
  /** Código único del departamento */
  codigo: number;
  /** Nombre oficial del departamento */
  nombre: string;
  /** Población total del departamento */
  poblacion: number;
}

/**
 * Interface que representa un municipio de Guatemala.
 */
export interface Municipio {
  /** Código único del municipio */
  codigo: number;
  /** Código del departamento al que pertenece */
  codigo_departamento: number;
  /** Nombre del municipio */
  nombre: string;
  /** Nombre del departamento padre */
  departamento: string;
  /** Población del municipio */
  poblacion: number;
}

/**
 * Interface para datos completos de un departamento.
 * Incluye estadísticas y lista de municipios.
 */
export interface DatosDepartamento {
  /** Nombre del departamento */
  departamento: string;
  /** Código del departamento */
  codigo_departamento: number;
  /** Total de casos confirmados */
  total_confirmados: number;
  /** Total de personas fallecidas */
  total_fallecidos: number;
  /** Total de personas tamizadas */
  total_tamizados: number;
  /** Población del departamento */
  poblacion: number;
  /** Lista de municipios del departamento */
  municipios: Municipio[];
}

/**
 * Interface para datos completos de un municipio.
 */
export interface DatosMunicipio {
  /** Nombre del municipio */
  municipio: string;
  /** Código único del municipio */
  codigo_municipio: number;
  /** Nombre del departamento */
  departamento: string;
  /** Código del departamento */
  codigo_departamento: number;
  /** Total de casos confirmados */
  total_confirmados: number;
  /** Total de personas fallecidas */
  total_fallecidos: number;
  /** Total de personas tamizadas */
  total_tamizados: number;
  /** Población del municipio */
  poblacion: number;
}

/**
 * Interface para el resumen nacional de COVID-19.
 */
export interface ResumenNacional {
  /** Total de casos confirmados a nivel nacional */
  total_confirmados: number;
  /** Total de personas fallecidas a nivel nacional */
  total_fallecidos: number;
  /** Total de personas tamizadas a nivel nacional */
  total_tamizados: number;
  /** Población total de Guatemala */
  poblacion_total: number;
  /** Número de departamentos */
  num_departamentos: number;
  /** Número de municipios */
  num_municipios: number;
  /** Lista de departamentos */
  departamentos: Departamento[];
}

/**
 * Interface para datos filtrados.
 */
export interface DatosFiltrados {
  /** Lista de registros encontrados */
  datos: any[];
  /** Total de registros */
  total_registros: number;
  /** Filtros aplicados */
  filtros_aplicados: any;
}

/**
 * Interface para datos del tooltip del mapa.
 * Se muestra cuando el cursor está sobre un departamento.
 */
export interface TooltipData {
  /** Código del departamento */
  codigo: number;
  /** Nombre del departamento */
  nombre: string;
  /** Total de confirmados */
  confirmados: number;
  /** Total de fallecidos */
  Fallecidos: number;
  /** Total de tamizados */
  tamizados: number;
  /** Posición X del tooltip */
  x: number;
  /** Posición Y del tooltip */
  y: number;
  /** Indica si el tooltip debe mostrarse */
  visible: boolean;
  /** Indica si los datos del tooltip se estan cargando */
  loading: boolean;
}
