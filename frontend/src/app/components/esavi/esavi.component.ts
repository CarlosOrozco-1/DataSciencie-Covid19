/**
 * Componente para visualizar datos ESAVI de vacunación.
 * Muestra tarjetas de resumen y gráficas interactivas de eventos adversos.
 */

import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CovidService } from '../../services/covid/covid.service';
import { EsaviResumen } from '../../models/covid.models';
import * as d3 from 'd3';

@Component({
  selector: 'app-esavi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './esavi.component.html',
  styleUrls: ['./esavi.component.css']
})
export class EsaviComponent implements OnInit, AfterViewInit {
  // Referencia a contenedores de gráficas
  @ViewChild('grafica_sexo', { static: false }) grafica_sexo!: ElementRef;
  @ViewChild('grafica_etario', { static: false }) grafica_etario!: ElementRef;
  @ViewChild('grafica_area', { static: false }) grafica_area!: ElementRef;
  @ViewChild('grafica_clasificacion', { static: false }) grafica_clasificacion!: ElementRef;

  // Datos del resumen ESAVI
  resumen: EsaviResumen | null = null;

  // Estado de carga
  cargando = true;
  error: string | null = null;

  // Datos para gráficas
  datos_sexo: Array<{nombre: string, valor: number}> = [];
  datos_etario: Array<{nombre: string, valor: number}> = [];
  datos_area: Array<{nombre: string, valor: number}> = [];
  datos_clasificacion: Array<{nombre: string, valor: number}> = [];

  // Dimensiones de las gráficas
  private ancho_grafica = 400;
  private alto_grafica = 300;

  constructor(private covidService: CovidService) {}

  ngOnInit(): void {
    this.cargarResumenEsavi();
  }

  ngAfterViewInit(): void {
    // Dibujar gráficas después de que los datos estén listos
    if (this.resumen) {
      setTimeout(() => {
        this.dibujarGraficas();
      }, 100);
    }
  }

  /**
   * Carga el resumen ESAVI desde el backend.
   */
  cargarResumenEsavi(): void {
    this.covidService.obtenerResumenEsavi().subscribe({
      next: (data) => {
        this.resumen = data;
        this.prepararDatosGraficas();
        this.cargando = false;
        // Redibujar gráficas después de que los datos estén listos
        setTimeout(() => {
          this.dibujarGraficas();
        }, 100);
      },
      error: (err) => {
        console.error('Error al cargar resumen ESAVI:', err);
        this.error = 'No fue posible cargar datos ESAVI. Verifica el backend en :8000.';
        this.cargando = false;
      }
    });
  }

  /**
   * Prepara los datos para las gráficas desde el resumen.
   */
  private prepararDatosGraficas(): void {
    if (!this.resumen) return;

    // Datos por sexo
    this.datos_sexo = Object.entries(this.resumen.por_sexo).map(([nombre, valor]) => ({
      nombre,
      valor: valor as number
    }));

    // Datos por grupo etario
    this.datos_etario = Object.entries(this.resumen.por_grupo_etario).map(([nombre, valor]) => ({
      nombre,
      valor: valor as number
    })).sort((a, b) => b.valor - a.valor);

    // Datos por área de salud
    this.datos_area = Object.entries(this.resumen.por_area_salud).map(([nombre, valor]) => ({
      nombre,
      valor: valor as number
    })).sort((a, b) => b.valor - a.valor);

    // Datos de clasificación (Grave vs No Grave)
    this.datos_clasificacion = [
      { nombre: 'Grave', valor: this.resumen.total_graves },
      { nombre: 'No Grave', valor: this.resumen.total_no_graves }
    ];
  }

  /**
   * Dibuja todas las gráficas usando D3.js.
   */
  private dibujarGraficas(): void {
    if (this.grafica_sexo) this.dibujarGrafica('sexo');
    if (this.grafica_etario) this.dibujarGrafica('etario');
    if (this.grafica_area) this.dibujarGrafica('area');
    if (this.grafica_clasificacion) this.dibujarGraficaPastel();
  }

  /**
   * Dibuja una gráfica de barras para sexo, grupo etario o área de salud.
   * 
   * @param tipo - Tipo de gráfica: 'sexo', 'etario' o 'area'
   */
  private dibujarGrafica(tipo: string): void {
    let contenedor: ElementRef | undefined;
    let datos: Array<{nombre: string, valor: number}> = [];
    let titulo = '';

    switch(tipo) {
      case 'sexo':
        contenedor = this.grafica_sexo;
        datos = this.datos_sexo;
        titulo = 'Distribución por Sexo';
        break;
      case 'etario':
        contenedor = this.grafica_etario;
        datos = this.datos_etario;
        titulo = 'Distribución por Grupo Etario';
        break;
      case 'area':
        contenedor = this.grafica_area;
        datos = this.datos_area;
        titulo = 'Distribución por Área de Salud (Top 10)';
        break;
    }

    if (!contenedor || datos.length === 0) return;

    // Limpiar contenedor
    const element = contenedor.nativeElement;
    d3.select(element).selectAll('*').remove();

    // Cambio: Ajustar dimensions según la cantidad de datos
    const margenIzq = 150;
    const margenDer = 20;
    const margenSup = 40;
    const margenInf = 50;
    
    const ancho = 500 - margenIzq - margenDer;
    const alto = 300 - margenSup - margenInf;

    // Crear SVG
    const svg = d3.select(element)
      .append('svg')
      .attr('width', 500)
      .attr('height', 300);

    // Crear grupo para la gráfica
    const g = svg.append('g')
      .attr('transform', `translate(${margenIzq},${margenSup})`);

    // Escalas
    const escalaY = d3.scaleLinear()
      .domain([0, d3.max(datos, d => d.valor) || 0])
      .range([alto, 0]);

    const escalaX = d3.scaleBand()
      .domain(datos.map(d => d.nombre))
      .range([0, ancho])
      .padding(0.1);

    // Cambio: Usar colores personalizados para cada tipo de gráfica
    const colores = tipo === 'sexo' ? 
      ['#ff6b9d', '#4dabf7'] : 
      ['#74c0fc', '#4c6ef5', '#b197fc', '#ff8787', '#ff922b'];

    const colorScale = d3.scaleOrdinal<string>()
      .domain(datos.map(d => d.nombre))
      .range(colores);

    // Dibujar barras
    g.selectAll('rect')
      .data(datos)
      .enter()
      .append('rect')
      .attr('x', d => escalaX(d.nombre) || 0)
      .attr('y', d => escalaY(d.valor))
      .attr('width', escalaX.bandwidth())
      .attr('height', d => alto - escalaY(d.valor))
      .attr('fill', d => colorScale(d.nombre))
      .attr('class', 'barra')
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s')
      .on('mouseenter', function() {
        d3.select(this).style('opacity', 0.7);
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 1);
      });

    // Cambio: Agregar valores encima de las barras
    g.selectAll('.label-valor')
      .data(datos)
      .enter()
      .append('text')
      .attr('class', 'label-valor')
      .attr('x', d => (escalaX(d.nombre) || 0) + escalaX.bandwidth() / 2)
      .attr('y', d => escalaY(d.valor) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(d => d.valor);

    // Eje Y
    const ejeY = d3.axisLeft(escalaY);
    g.append('g').call(ejeY);

    // Eje X
    const ejeX = d3.axisBottom(escalaX);
    g.append('g')
      .attr('transform', `translate(0,${alto})`)
      .call(ejeX)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('font-size', '10px');

    // Título
    svg.append('text')
      .attr('x', 250)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text(titulo);
  }

  /**
   * Dibuja una gráfica de pastel para la clasificación (Grave vs No Grave).
   */
  private dibujarGraficaPastel(): void {
    if (this.datos_clasificacion.length === 0) return;

    const element = this.grafica_clasificacion.nativeElement;
    d3.select(element).selectAll('*').remove();

    const ancho = 350;
    const alto = 300;
    const radio = Math.min(ancho, alto) / 2 - 40;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', ancho)
      .attr('height', alto);

    const g = svg.append('g')
      .attr('transform', `translate(${ancho / 2},${alto / 2})`);

    // Cambio: Usar colores significativos: rojo para grave, verde para no grave
    const colores = ['#ff6b6b', '#51cf66'];
    const colorScale = d3.scaleOrdinal<string>()
      .domain(this.datos_clasificacion.map(d => d.nombre))
      .range(colores);

    const pie = d3.pie<any>().value(d => d.valor);
    const arco = d3.arc()
      .innerRadius(0)
      .outerRadius(radio);

    // Dibujar sectores
    g.selectAll('path')
      .data(pie(this.datos_clasificacion))
      .enter()
      .append('path')
      .attr('d', arco as any)
      .attr('fill', d => colorScale(d.data.nombre))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s')
      .on('mouseenter', function() {
        d3.select(this).style('opacity', 0.7);
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 1);
      });

    // Etiquetas
    g.selectAll('.label-pastel')
      .data(pie(this.datos_clasificacion))
      .enter()
      .append('text')
      .attr('class', 'label-pastel')
      .attr('transform', d => `translate(${(arco as any).centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text(d => `${d.data.nombre}: ${d.data.valor}`);

    // Título
    svg.append('text')
      .attr('x', ancho / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text('Clasificación de Eventos');
  }

  /**
   * Formatea números con separador de miles.
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
