/**
 * Componente del mapa de Guatemala con D3.js.
 * Muestra un mapa coroplético de los 22 departamentos de Guatemala.
 * Permite interacción al posicionar el cursor para mostrar datos de COVID-19.
 */

import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { CovidService } from '../../services/covid/covid.service';
import { DatosDepartamento, TooltipData } from '../../models/covid.models';

/**
 * Interface para las propiedades del GeoJSON de Guatemala (GADM).
 * Define la estructura de las características (departamentos).
 */
interface GeoFeature {
  type: string;
  properties: {
    /** Nombre del departamento (NAME_1 en GADM) */
    NAME_1: string;
    /** Código ISO del departamento */
    ISO_1: string;
  };
  geometry: any;
}

/**
 * Mapeo de nombres de departamentos del GeoJSON a códigos de la API.
 * GeoJSON usa nombres como "AltaVerapaz", la API usa códigos numéricos.
 */
const MAPEO_DEPARTAMENTOS: { [key: string]: number } = {
  'AltaVerapaz': 16,
  'BajaVerapaz': 15,
  'Chimaltenango': 4,
  'Chiquimula': 20,
  'ElProgreso': 2,
  'Escuintla': 5,
  'Guatemala': 1,
  'Huehuetenango': 13,
  'Izabal': 18,
  'Jalapa': 21,
  'Jutiapa': 22,
  'Petén': 17,
  'Quezaltenango': 9,
  'Quiché': 14,
  'Retalhuleu': 11,
  'Sacatepéquez': 3,
  'SanMarcos': 12,
  'SantaRosa': 6,
  'Sololá': 7,
  'Suchitepéquez': 10,
  'Totonicapán': 8,
  'Zacapa': 19
};

/**
 * Component standalone para el mapa de Guatemala.
 * Utiliza D3.js para renderizar el mapa y manejar interacciones.
 */
@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit, AfterViewInit {
  // Referencia al elemento DOM del contenedor del mapa
  @ViewChild('mapaContainer', { static: true }) mapaContainer!: ElementRef;

  /**
   * Datos de los departamentos cargados desde la API.
   * Se usa para mostrar información en el tooltip.
   */
  datosDepartamentos: Map<number, DatosDepartamento> = new Map();

  /**
   * Conjunto de códigos en proceso de carga.
   * Evita lanzar múltiples peticiones repetidas al mismo departamento.
   */
  private departamentosEnCarga: Set<number> = new Set();

  /**
   * Datos actuales para mostrar en el tooltip.
   */
  tooltipData: TooltipData = {
    codigo: 0,
    nombre: '',
    confirmados: 0,
    Fallecidos: 0,
    tamizados: 0,
    x: 0,
    y: 0,
    visible: false,
    loading: false
  };

  /**
   * Dimensiones aproximadas del tooltip para evitar que salga del viewport.
   */
  private readonly tooltipWidth: number = 220;
  private readonly tooltipHeight: number = 130;

  /**
   * Ancho del SVG del mapa.
   */
  private width: number = 1800;

  /**
   * Alto del SVG del mapa.
   */
  private height: number = 1600;

  /**
   * Proyección geográfica para Guatemala.
   * Utiliza coordenadas adaptadas para el país.
   */
  private projection: any;

  /**
   * Generador de paths de D3 para crear las formas de los departamentos.
   */
  private pathGenerator: any;

  /**
   * Constructor del componente.
   * Inyecta el servicio de datos COVID.
   * 
   * @param covidService - Servicio para consumir la API de COVID
   */
  constructor(private covidService: CovidService) { }

  /**
   * Método del ciclo de vida de Angular.
   * Se ejecuta al inicializar el componente.
   */
  ngOnInit(): void {
    // Cargar datos de departamentos al iniciar
    this.cargarDatosDepartamentos();
  }

  /**
   * Método del ciclo de vida de Angular.
   * Se ejecuta después de que la vista ha sido inicializada.
   * Aquí se renderiza el mapa con D3.js.
   */
  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el DOM está listo
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  /**
   * Carga los datos de todos los departamentos desde la API.
   * Guarda los datos en un Map para acceso rápido por código.
   */
  cargarDatosDepartamentos(): void {
    this.covidService.obtenerDepartamentos().subscribe({
      next: (departamentos) => {
        // Cargar datos de cada departamento
        departamentos.forEach(dep => {
          this.cargarDepartamentoPorCodigo(dep.codigo);
        });
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
      }
    });
  }

  /**
   * Carga los datos de un departamento por código y los guarda en caché.
   * 
   * @param codigo - Código numérico del departamento
   */
  private cargarDepartamentoPorCodigo(codigo: number): void {
    // Si ya está en caché o en proceso de carga, no repetir petición.
    if (this.datosDepartamentos.has(codigo) || this.departamentosEnCarga.has(codigo)) {
      return;
    }

    this.departamentosEnCarga.add(codigo);

    this.covidService.obtenerDepartamento(codigo).subscribe({
      next: (datos) => {
        this.datosDepartamentos.set(codigo, datos);

        // Si el tooltip visible corresponde a este departamento, actualizar en caliente.
        if (this.tooltipData.visible && this.tooltipData.codigo === codigo) {
          this.tooltipData.nombre = datos.departamento;
          this.tooltipData.confirmados = datos.total_confirmados;
          this.tooltipData.Fallecidos = datos.total_fallecidos;
          this.tooltipData.tamizados = datos.total_tamizados;
          this.tooltipData.loading = false;
        }

        this.departamentosEnCarga.delete(codigo);
      },
      error: (err) => {
        console.error(`Error al cargar datos del departamento ${codigo}:`, err);
        this.departamentosEnCarga.delete(codigo);
      }
    });
  }

  /**
   * Inicializa el mapa SVG con D3.js.
   * Carga el GeoJSON de Guatemala y renderiza los departamentos.
   */
  inicializarMapa(): void {
    // Limpiar contenedor primero
    const container = this.mapaContainer.nativeElement;
    d3.select(container).selectAll('*').remove();

    // Crear elemento SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Inicializar proyección y generador de paths.
    // La proyección se ajusta dinámicamente cuando se carga el GeoJSON.
    this.projection = d3.geoMercator();
    this.pathGenerator = d3.geoPath().projection(this.projection);

    // Cargar GeoJSON de Guatemala
    d3.json('assets/geo/guatemala.json')
      .then((data: any) => {
        // Ajustar automáticamente la proyección al tamaño del SVG.
        // Esto asegura que el mapa siempre sea visible en pantalla.
        this.projection.fitSize([this.width, this.height], data);
        this.pathGenerator = d3.geoPath().projection(this.projection);

        this.renderizarDepartamentos(svg, data.features);
      })
      .catch((error) => {
        console.error('Error al cargar GeoJSON:', error);
        // Mostrar mensaje de error en el contenedor
        svg.append('text')
          .attr('x', this.width / 2)
          .attr('y', this.height / 2)
          .attr('text-anchor', 'middle')
          .text('Error al cargar el mapa. Verifique el archivo GeoJSON.');
      });
  }

  /**
   * Renderiza los departamentos del mapa.
   * Añade eventos de mouse para mostrar tooltips.
   * 
   * @param svg - Elemento SVG del mapa
   * @param features - Array de características GeoJSON (departamentos)
   */
  private renderizarDepartamentos(svg: any, features: GeoFeature[]): void {
    // Crear grupo para los departamentos
    const g = svg.append('g');

      // Definir una escala de colores para los departamentos
      const departamentos = [
        'AltaVerapaz', 'BajaVerapaz', 'Chimaltenango', 'Chiquimula', 'ElProgreso', 'Escuintla',
        'Guatemala', 'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quezaltenango',
        'Quiché', 'Retalhuleu', 'Sacatepéquez', 'SanMarcos', 'SantaRosa', 'Sololá',
        'Suchitepéquez', 'Totonicapán', 'Zacapa'
      ];
        // Usar d3.schemeSet3 para colores variados y agradables
        // Cambio: Asignar color verde a Petén
        const customColors = [
          '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462',
          '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#4daf4a', // Petén verde
          '#ffed6f', '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
          '#a65628', '#f781bf', '#999999', '#e41a1c'
        ];
        const colorScale = d3.scaleOrdinal<string, string>()
          .domain(departamentos)
          .range(customColors);

      // Dibujar cada departamento
      g.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', this.pathGenerator)
        .attr('fill', (d: GeoFeature) => colorScale(d.properties.NAME_1))
        .attr('stroke', '#ffffff') // Borde blanco
        .attr('stroke-width', 1)
        .attr('class', 'departamento')
        .style('cursor', 'pointer')
        .style('transition', 'fill 0.3s, transform 0.2s')
        // Evento: al posicionar el cursor sobre un departamento
        .on('mouseenter', (event: MouseEvent, d: GeoFeature) => {
          this.mostrarTooltip(event, d);
          // Cambiar color en hover
          d3.select(event.target as SVGPathElement)
            .attr('fill', '#2980b9');
        })
        // Evento: al mover el cursor dentro del departamento
        .on('mousemove', (event: MouseEvent, d: GeoFeature) => {
          this.actualizarPosicionTooltip(event);
        })
        // Evento: al salir el cursor del departamento
        .on('mouseleave', (event: MouseEvent, d: GeoFeature) => {
          this.ocultarTooltip();
          // Restaurar color original según el departamento
          d3.select(event.target as SVGPathElement)
            .attr('fill', colorScale(d.properties.NAME_1));
        });

    // Añadir etiquetas de nombres de departamentos
    g.selectAll('text')
      .data(features)
      .enter()
      .append('text')
      .attr('x', (d: GeoFeature) => {
        const coords = this.pathGenerator.centroid(d);
        return coords[0];
      })
      .attr('y', (d: GeoFeature) => {
        const coords = this.pathGenerator.centroid(d);
        return coords[1];
      })
      .attr('text-anchor', 'middle')
      .attr('fill', 'black') // Cambio: letras de departamentos en negro
      // Ajustar tamaño de fuente según tamano del departamento y escala del mapa
      .attr('font-size', (d: GeoFeature) => `${this.calcularTamanoEtiqueta(d)}px`)
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none') // Permitir clicks a través del texto
      .text((d: GeoFeature) => d.properties.NAME_1) // Cambio: mostrar nombre completo
      // Fin de cambio
  }

  /**
   * Calcula un tamaño de fuente proporcional al tamaño del departamento.
   * Escala la tipografía cuando cambia el viewBox del mapa.
   *
   * @param feature - Feature GeoJSON del departamento
   * @returns Tamaño de fuente en px para el label
   */
  private calcularTamanoEtiqueta(feature: GeoFeature): number {
    const [inicio, fin] = this.pathGenerator.bounds(feature);
    const anchoDepartamento = Math.max(1, fin[0] - inicio[0]);
    const altoDepartamento = Math.max(1, fin[1] - inicio[1]);
    const nombre = feature.properties.NAME_1 || '';

    // Relación de escala frente al tamaño base original del mapa (800x600)
    const factorEscala = Math.min(this.width / 800, this.height / 600);

    // Aproximación del ancho ocupado por texto para evitar desborde.
    const ajustePorAncho = anchoDepartamento / Math.max(nombre.length * 0.66, 1);
    const ajustePorAlto = altoDepartamento * 0.33;
    const sugerido = Math.min(ajustePorAncho, ajustePorAlto);

    const minimo = 7 * factorEscala;
    const maximo = 13 * factorEscala;

    return Math.round(Math.max(minimo, Math.min(maximo, sugerido)));
  }

  /**
   * Muestra el tooltip con datos del departamento.
   * Se ejecuta cuando el cursor entra en un departamento.
   * 
   * @param event - Evento del mouse
   * @param d - Característica GeoJSON del departamento
   */
  mostrarTooltip(event: MouseEvent, d: GeoFeature): void {
    // Obtener el nombre del departamento del GeoJSON
    const nombreDepto = d.properties.NAME_1;
    // Buscar el código del departamento en el mapeo.
    const codigo = MAPEO_DEPARTAMENTOS[nombreDepto] || 0;
    const datos = this.datosDepartamentos.get(codigo);
    const posicion = this.calcularPosicionTooltip(event.clientX, event.clientY);

    // Si no hay datos todavía y el código es válido, disparar carga puntual.
    if (!datos && codigo > 0) {
      this.cargarDepartamentoPorCodigo(codigo);
    }

    if (datos) {
      // Actualizar datos del tooltip
      this.tooltipData = {
        codigo: codigo,
        nombre: datos.departamento,
        confirmados: datos.total_confirmados,
        Fallecidos: datos.total_fallecidos,
        tamizados: datos.total_tamizados,
        x: posicion.x,
        y: posicion.y,
        visible: true,
        loading: false
      };
    } else {
      // Si aún no hay datos, mostrar solo el nombre (o cero temporalmente).
      this.tooltipData = {
        codigo: codigo,
        nombre: nombreDepto,
        confirmados: 0,
        Fallecidos: 0,
        tamizados: 0,
        x: posicion.x,
        y: posicion.y,
        visible: true,
        loading: true
      };
    }
  }

  /**
   * Actualiza la posición del tooltip siguiendo al cursor.
   * 
   * @param event - Evento del mouse
   */
  actualizarPosicionTooltip(event: MouseEvent): void {
    const posicion = this.calcularPosicionTooltip(event.clientX, event.clientY);
    this.tooltipData.x = posicion.x;
    this.tooltipData.y = posicion.y;
  }

  /**
   * Calcula una posicion del tooltip estable con cualquier zoom del navegador.
   * Usa coordenadas del viewport y limita el tooltip al area visible.
   *
   * @param clientX - Posicion X del puntero en viewport
   * @param clientY - Posicion Y del puntero en viewport
   * @returns Coordenadas corregidas para pintar el tooltip
   */
  private calcularPosicionTooltip(clientX: number, clientY: number): { x: number; y: number } {
    const margen = 12;
    const anchoPantalla = window.innerWidth;
    const altoPantalla = window.innerHeight;

    // Posicion base (a la derecha y un poco arriba del cursor)
    let x = clientX + 14;
    let y = clientY - 12;

    // Si no cabe a la derecha, mover a la izquierda del cursor.
    if (x + this.tooltipWidth + margen > anchoPantalla) {
      x = clientX - this.tooltipWidth - 14;
    }

    // Si no cabe abajo, subir para que permanezca visible.
    if (y + this.tooltipHeight + margen > altoPantalla) {
      y = altoPantalla - this.tooltipHeight - margen;
    }

    // Limites minimos para no salir por arriba o izquierda.
    x = Math.max(margen, x);
    y = Math.max(margen, y);

    return { x, y };
  }

  /**
   * Oculta el tooltip cuando el cursor sale del departamento.
   */
  ocultarTooltip(): void {
    this.tooltipData.visible = false;
    this.tooltipData.loading = false;
  }
}
