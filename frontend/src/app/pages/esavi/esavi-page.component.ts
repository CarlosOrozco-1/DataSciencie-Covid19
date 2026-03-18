/**
 * Página dedicada a análisis ESAVI.
 * Separa visualmente indicadores de vacunación del dashboard COVID territorial.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CovidService } from '../../services/covid/covid.service';
import { EsaviResumen, EsaviFiltrado } from '../../models/covid.models';

@Component({
  selector: 'app-esavi-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './esavi-page.component.html',
  styleUrls: ['./esavi-page.component.css']
})
export class EsaviPageComponent implements OnInit {
  /**
   * Resumen global ESAVI.
   */
  resumenEsavi: EsaviResumen | null = null;

  /**
   * Resultado de filtros ESAVI.
   */
  esaviFiltrado: EsaviFiltrado | null = null;

  /**
   * Estado de carga para resumen y filtros.
   */
  cargando = true;
  cargandoEsaviFiltrado = false;

  /**
   * Error de carga de datos ESAVI.
   */
  error: string | null = null;

  /**
   * Modelo de filtros para formulario.
   */
  filtrosEsavi = {
    sexo: '',
    grupo_etario: '',
    clasificacion: '',
    area_salud: ''
  };

  /**
   * Constructor con servicio HTTP de datos.
   *
   * @param covidService - Servicio para endpoints de API
   */
  constructor(private covidService: CovidService) {}

  /**
   * Inicializa la carga de datos ESAVI.
   */
  ngOnInit(): void {
    this.cargarResumenEsavi();
    this.aplicarFiltrosEsavi();
  }

  /**
   * Carga resumen base de ESAVI.
   */
  cargarResumenEsavi(): void {
    this.covidService.obtenerResumenEsavi().subscribe({
      next: (data) => {
        this.resumenEsavi = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ESAVI:', err);
        this.error = 'No fue posible cargar la base ESAVI. Verifica backend y archivo Excel.';
        this.cargando = false;
      }
    });
  }

  /**
   * Aplica filtros y obtiene agregados filtrados.
   */
  aplicarFiltrosEsavi(): void {
    this.cargandoEsaviFiltrado = true;

    this.covidService.obtenerEsaviFiltrado(
      this.filtrosEsavi.sexo || undefined,
      this.filtrosEsavi.grupo_etario || undefined,
      this.filtrosEsavi.clasificacion || undefined,
      this.filtrosEsavi.area_salud || undefined
    ).subscribe({
      next: (data) => {
        this.esaviFiltrado = data;
        this.cargandoEsaviFiltrado = false;
      },
      error: (err) => {
        console.error('Error al filtrar ESAVI:', err);
        this.cargandoEsaviFiltrado = false;
      }
    });
  }

  /**
   * Limpia todos los filtros del formulario y recarga resultado.
   */
  limpiarFiltrosEsavi(): void {
    this.filtrosEsavi = {
      sexo: '',
      grupo_etario: '',
      clasificacion: '',
      area_salud: ''
    };
    this.aplicarFiltrosEsavi();
  }

  /**
   * Lista ordenada descendente de pares clave/valor para template.
   */
  convertirALista(datos: Record<string, number> | undefined | null): Array<{ clave: string; valor: number }> {
    if (!datos) {
      return [];
    }

    return Object.entries(datos)
      .map(([clave, valor]) => ({ clave, valor }))
      .sort((a, b) => b.valor - a.valor);
  }

  /**
   * Calcula porcentaje de un valor respecto de un total.
   */
  calcularPorcentaje(valor: number, total: number | undefined | null): number {
    if (!total || total <= 0) {
      return 0;
    }
    return (valor / total) * 100;
  }

  /**
   * Formatea números con separador local.
   */
  formatearNumero(numero: number | undefined | null): string {
    if (numero === undefined || numero === null) {
      return '0';
    }
    return numero.toLocaleString('es-GT');
  }

  /** Opciones de sexo */
  get sexosDisponibles(): string[] {
    return this.resumenEsavi ? Object.keys(this.resumenEsavi.por_sexo) : [];
  }

  /** Opciones de grupo etario */
  get gruposEtariosDisponibles(): string[] {
    return this.resumenEsavi ? Object.keys(this.resumenEsavi.por_grupo_etario) : [];
  }

  /** Opciones de área de salud */
  get areasSaludDisponibles(): string[] {
    return this.resumenEsavi ? Object.keys(this.resumenEsavi.por_area_salud) : [];
  }
}
