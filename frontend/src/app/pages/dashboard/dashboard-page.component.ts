/**
 * Página principal del dashboard COVID-19.
 * Muestra resumen nacional y el mapa interactivo de departamentos.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaComponent } from '../../components/mapa/mapa.component';
import { CovidService } from '../../services/covid/covid.service';
import { ResumenNacional } from '../../models/covid.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MapaComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  /**
   * Datos del resumen nacional COVID.
   */
  resumen: ResumenNacional | null = null;

  /**
   * Estado de carga de la vista.
   */
  cargando = true;

  /**
   * Mensaje de error en caso de fallo de conexión.
   */
  error: string | null = null;

  /**
   * Constructor con inyección del servicio de API.
   *
   * @param covidService - Servicio para consumo de endpoints COVID
   */
  constructor(private covidService: CovidService) {}

  /**
   * Ciclo de vida: inicializa carga de resumen al entrar a la página.
   */
  ngOnInit(): void {
    this.cargarResumen();
  }

  /**
   * Obtiene resumen nacional desde backend.
   */
  cargarResumen(): void {
    this.covidService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar resumen COVID:', err);
        this.error = 'No fue posible cargar datos COVID. Verifica el backend en :8000.';
        this.cargando = false;
      }
    });
  }

  /**
   * Formatea números con separador de miles para Guatemala.
   *
   * @param numero - Valor numérico a formatear
   * @returns String formateado
   */
  formatearNumero(numero: number | undefined | null): string {
    if (numero === undefined || numero === null) {
      return '0';
    }
    return numero.toLocaleString('es-GT');
  }
}
