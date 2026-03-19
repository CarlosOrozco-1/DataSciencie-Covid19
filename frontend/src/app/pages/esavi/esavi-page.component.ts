/**
 * Página dedicada a análisis ESAVI.
 * Separa visualmente indicadores de vacunación del dashboard COVID territorial.
 * Cambio: Agregadas gráficas interactivas con D3.js para mejor visualización.
 */

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { CovidService } from '../../services/covid/covid.service';
import { EsaviResumen, EsaviFiltrado } from '../../models/covid.models';

@Component({
  selector: 'app-esavi-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './esavi-page.component.html',
  styleUrls: ['./esavi-page.component.css']
})
export class EsaviPageComponent implements OnInit, AfterViewInit {
  // Cambio: ViewChild para contenedores de gráficas D3.js
  @ViewChild('grafica_sexo', { static: false }) grafica_sexo!: ElementRef;
  @ViewChild('grafica_etario', { static: false }) grafica_etario!: ElementRef;
  @ViewChild('grafica_clasificacion', { static: false }) grafica_clasificacion!: ElementRef;

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
   * Cambio: Ciclo de vida: dibuja gráficas después de que los datos estén listos.
   */
  ngAfterViewInit(): void {
    if (this.resumenEsavi) {
      setTimeout(() => {
        this.dibujarGraficas();
      }, 500);
    }
  }

  /**
   * Carga resumen base de ESAVI.
   */
  cargarResumenEsavi(): void {
    this.covidService.obtenerResumenEsavi().subscribe({
      next: (data) => {
        this.resumenEsavi = data;
        this.cargando = false;
        // Cambio: Dibujar gráficas cuando los datos estén listos.
        // Las opciones de filtro se extraen automáticamente desde los getters.
        setTimeout(() => {
          this.dibujarGraficas();
        }, 300);
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

  /**
   * Cambio: Dibuja todas las gráficas D3.js cuando los datos estén listos.
   */
  private dibujarGraficas(): void {
    if (!this.resumenEsavi) return;
    if (this.grafica_sexo) this.dibujarGraficaSexo();
    if (this.grafica_etario) this.dibujarGraficaEtario();
    if (this.grafica_clasificacion) this.dibujarGraficaClasificacion();
  }

  /**
   * Cambio: Dibuja gráfica de barras para distribución por sexo.
   */
  private dibujarGraficaSexo(): void {
    if (!this.resumenEsavi || !this.grafica_sexo) return;

    const datos = Object.entries(this.resumenEsavi.por_sexo || {})
      .map(([nombre, valor]) => ({ nombre, valor: valor as number }));

    if (datos.length === 0) return;

    const element = this.grafica_sexo.nativeElement;
    d3.select(element).selectAll('*').remove();

    const margen = { top: 20, right: 20, bottom: 30, left: 60 };
    const ancho = 400 - margen.left - margen.right;
    const alto = 250 - margen.top - margen.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', 400)
      .attr('height', 250);

    const g = svg.append('g')
      .attr('transform', `translate(${margen.left},${margen.top})`);

    const escalaX = d3.scaleBand()
      .domain(datos.map(d => d.nombre))
      .range([0, ancho])
      .padding(0.2);

    const escalaY = d3.scaleLinear()
      .domain([0, d3.max(datos, d => d.valor) || 0])
      .range([alto, 0]);

    const colores = ['#ff6b9d', '#4dabf7'];
    const colorScale = d3.scaleOrdinal<string>()
      .domain(datos.map(d => d.nombre))
      .range(colores);

    g.selectAll('rect')
      .data(datos)
      .enter()
      .append('rect')
      .attr('x', d => escalaX(d.nombre) || 0)
      .attr('y', d => escalaY(d.valor))
      .attr('width', escalaX.bandwidth())
      .attr('height', d => alto - escalaY(d.valor))
      .attr('fill', d => colorScale(d.nombre))
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).style('opacity', 0.7);
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 1);
      });

    g.append('g')
      .attr('transform', `translate(0,${alto})`)
      .call(d3.axisBottom(escalaX));

    g.append('g')
      .call(d3.axisLeft(escalaY));

    svg.append('text')
      .attr('x', 200)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text('Distribución por Sexo');
  }

  /**
   * Cambio: Dibuja gráfica de barras para distribución por grupo etario.
   */
  private dibujarGraficaEtario(): void {
    if (!this.resumenEsavi || !this.grafica_etario) return;

    const datos = Object.entries(this.resumenEsavi.por_grupo_etario || {})
      .map(([nombre, valor]) => ({ nombre, valor: valor as number }))
      .sort((a, b) => b.valor - a.valor);

    if (datos.length === 0) return;

    const element = this.grafica_etario.nativeElement;
    d3.select(element).selectAll('*').remove();

    const margen = { top: 20, right: 20, bottom: 30, left: 60 };
    const ancho = 400 - margen.left - margen.right;
    const alto = 250 - margen.top - margen.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', 400)
      .attr('height', 250);

    const g = svg.append('g')
      .attr('transform', `translate(${margen.left},${margen.top})`);

    const escalaX = d3.scaleBand()
      .domain(datos.map(d => d.nombre))
      .range([0, ancho])
      .padding(0.1);

    const escalaY = d3.scaleLinear()
      .domain([0, d3.max(datos, d => d.valor) || 0])
      .range([alto, 0]);

    g.selectAll('rect')
      .data(datos)
      .enter()
      .append('rect')
      .attr('x', d => escalaX(d.nombre) || 0)
      .attr('y', d => escalaY(d.valor))
      .attr('width', escalaX.bandwidth())
      .attr('height', d => alto - escalaY(d.valor))
      .attr('fill', '#74c0fc')
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).style('opacity', 0.7);
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 1);
      });

    g.append('g')
      .attr('transform', `translate(0,${alto})`)
      .call(d3.axisBottom(escalaX))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(escalaY));

    svg.append('text')
      .attr('x', 200)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text('Distribución por Grupo Etario');
  }

  /**
   * Cambio: Dibuja gráfica de pastel para clasificación (Grave vs No Grave).
   */
  private dibujarGraficaClasificacion(): void {
    if (!this.resumenEsavi || !this.grafica_clasificacion) return;

    const datos = [
      { nombre: 'Grave', valor: this.resumenEsavi.total_graves },
      { nombre: 'No Grave', valor: this.resumenEsavi.total_no_graves }
    ];

    if (datos.every(d => d.valor === 0)) return;

    const element = this.grafica_clasificacion.nativeElement;
    d3.select(element).selectAll('*').remove();

    const ancho = 380;
    const alto = 280;
    const radio = Math.min(ancho, alto) / 2 - 40;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', ancho)
      .attr('height', alto);

    const g = svg.append('g')
      .attr('transform', `translate(${ancho / 2},${alto / 2})`);

    const colores = ['#ff6b6b', '#51cf66'];
    const colorScale = d3.scaleOrdinal<string>()
      .domain(datos.map(d => d.nombre))
      .range(colores);

    const pie = d3.pie<any>().value(d => d.valor);
    const arco = d3.arc()
      .innerRadius(0)
      .outerRadius(radio);

    g.selectAll('path')
      .data(pie(datos))
      .enter()
      .append('path')
      .attr('d', arco as any)
      .attr('fill', d => colorScale(d.data.nombre))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).style('opacity', 0.7);
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 1);
      });

    g.selectAll('.label')
      .data(pie(datos))
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('transform', d => `translate(${(arco as any).centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text(d => `${d.data.nombre}: ${this.formatearNumero(d.data.valor)}`);

    svg.append('text')
      .attr('x', ancho / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text('Clasificación de Eventos');
  }
}
