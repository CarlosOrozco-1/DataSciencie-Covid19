/**
 * Servicio para consumir la API de COVID-19 Guatemala.
 * Maneja todas las comunicaciones HTTP con el backend.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Departamento,
  Municipio,
  DatosDepartamento,
  DatosMunicipio,
  ResumenNacional,
  DatosFiltrados
} from '../../models/covid.models';

/**
 * URL base del backend API.
 * Se conecta al servidor FastAPI corriendo en el puerto 8000.
 */
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Decorador que marca esta clase como un servicio inyectable.
 * Permite que el servicio sea injectado en otros componentes.
 */
@Injectable({
  providedIn: 'root'
})
export class CovidService {
  /**
   * Constructor del servicio.
   * Inyecta el HttpClient para realizar peticiones HTTP.
   * 
   * @param http - Cliente HTTP de Angular para hacer peticiones al backend
   */
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los departamentos de Guatemala.
   * 
   * @returns Observable con array de departamentos
   */
  obtenerDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${API_BASE_URL}/departamentos`);
  }

  /**
   * Obtiene los datos completos de un departamento específico.
   * Incluye estadísticas y lista de municipios.
   * 
   * @param codigo - Código del departamento a consultar
   * @returns Observable con los datos del departamento
   */
  obtenerDepartamento(codigo: number): Observable<DatosDepartamento> {
    return this.http.get<DatosDepartamento>(
      `${API_BASE_URL}/departamentos/${codigo}`
    );
  }

  /**
   * Obtiene la lista de municipios de un departamento específico.
   * 
   * @param codigo - Código del departamento
   * @returns Observable con lista de municipios
   */
  obtenerMunicipiosDepartamento(codigo: number): Observable<any> {
    return this.http.get(
      `${API_BASE_URL}/departamentos/${codigo}/municipios`
    );
  }

  /**
   * Obtiene la lista de todos los municipios de Guatemala.
   * 
   * @returns Observable con array de municipios
   */
  obtenerMunicipios(): Observable<Municipio[]> {
    return this.http.get<Municipio[]>(`${API_BASE_URL}/municipios`);
  }

  /**
   * Obtiene los datos completos de un municipio específico.
   * 
   * @param codigo - Código del municipio a consultar
   * @returns Observable con los datos del municipio
   */
  obtenerMunicipio(codigo: number): Observable<DatosMunicipio> {
    return this.http.get<DatosMunicipio>(
      `${API_BASE_URL}/municipios/${codigo}`
    );
  }

  /**
   * Obtiene el resumen nacional de COVID-19.
   * Incluye totales de confirmados, Fallecidos y tamizados.
   * 
   * @returns Observable con el resumen nacional
   */
  obtenerResumen(): Observable<ResumenNacional> {
    return this.http.get<ResumenNacional>(`${API_BASE_URL}/resumen`);
  }

  /**
   * Obtiene datos filtrados según parámetros especificados.
   * 
   * @param departamento - Código del departamento (opcional)
   * @param municipio - Código del municipio (opcional)
   * @param fechaInicio - Fecha inicial del rango (opcional)
   * @param fechaFin - Fecha final del rango (opcional)
   * @returns Observable con datos filtrados
   */
  obtenerDatosFiltrados(
    departamento?: number,
    municipio?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<DatosFiltrados> {
    // Construir parámetros de query string
    let params: string[] = [];
    
    if (departamento) {
      params.push(`departamento=${departamento}`);
    }
    if (municipio) {
      params.push(`municipio=${municipio}`);
    }
    if (fechaInicio) {
      params.push(`fecha_inicio=${fechaInicio}`);
    }
    if (fechaFin) {
      params.push(`fecha_fin=${fechaFin}`);
    }
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    
    return this.http.get<DatosFiltrados>(
      `${API_BASE_URL}/filtrar${queryString}`
    );
  }
}
