/**
 * Componente principal de la aplicación Angular.
 * Punto de entrada del dashboard de COVID-19 Guatemala.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MapaComponent } from './components/mapa/mapa.component';
import { CovidService } from './services/covid/covid.service';
import { ResumenNacional } from './models/covid.models';

/**
 * Componente raíz de la aplicación.
 * Utiliza Angular Standalone Components (Angular 17+).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,      // Módulo común de Angular
    HttpClientModule,  // Módulo para HTTP
    MapaComponent      // Componente del mapa
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /**
   * Título de la aplicación.
   */
  title = 'Dashboard COVID-19 Guatemala';

  /**
   * Datos del resumen nacional.
   */
  resumen: ResumenNacional | null = null;

  /**
   * Indicador de carga de datos.
   */
  cargando = true;

  /**
   * Mensaje de error si falla la carga.
   */
  error: string | null = null;

  /**
   * Constructor del componente principal.
   * Inyecta el servicio de datos COVID.
   * 
   * @param covidService - Servicio para consumir la API de COVID
   */
  constructor(private covidService: CovidService) {}

  /**
   * Método del ciclo de vida de Angular.
   * Se ejecuta al inicializar el componente.
   * Carga el resumen nacional de COVID-19.
   */
  ngOnInit(): void {
    this.cargarResumen();
  }

  /**
   * Carga el resumen nacional desde la API.
   */
  cargarResumen(): void {
    this.covidService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.error = 'Error al conectar con el servidor. Asegúrate de que la API esté corriendo.';
        this.cargando = false;
      }
    });
  }

  /**
   * Formatea un número con separadores de miles.
   * 
   * @param numero - Número a formatear
   * @returns Número formateado como string
   */
  formatearNumero(numero: number | undefined | null): string {
    if (numero === undefined || numero === null) {
      return '0';
    }
    return numero.toLocaleString('es-GT');
  }
}
