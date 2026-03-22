import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatosDepartamento } from '../../models/covid.models';

interface SerieMetrica {
  etiqueta: string;
  valor: number;
  clase: string;
  porcentaje: number;
}

@Component({
  selector: 'app-departamento-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departamento-detalle.component.html',
  styleUrls: ['./departamento-detalle.component.css']
})
export class DepartamentoDetalleComponent implements OnChanges {
  @Input() datos: DatosDepartamento | null = null;

  serie: SerieMetrica[] = [];

  ngOnChanges(): void {
    this.actualizarSerie();
  }

  formatearNumero(numero: number | undefined | null): string {
    if (numero === undefined || numero === null) {
      return '0';
    }
    return numero.toLocaleString('es-GT');
  }

  private actualizarSerie(): void {
    if (!this.datos) {
      this.serie = [];
      return;
    }

    const base = [
      { etiqueta: 'Confirmados', valor: this.datos.total_confirmados, clase: 'confirmado' },
      { etiqueta: 'Fallecidos', valor: this.datos.total_fallecidos, clase: 'fallecido' },
      { etiqueta: 'Tamizados', valor: this.datos.total_tamizados, clase: 'tamizado' }
    ];

    const maximo = Math.max(...base.map(item => item.valor), 1);
    this.serie = base.map(item => ({
      ...item,
      porcentaje: Math.max(4, Math.round((item.valor / maximo) * 100))
    }));
  }
}
