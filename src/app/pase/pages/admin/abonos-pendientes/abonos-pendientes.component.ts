import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AbonosService } from '../../../../core/services/abonos.service';

type StatusFiltro =
  | 'ABIERTO'
  | 'CONCILIADO'
  | 'PENDIENTE'
  | 'RECHAZADO'
  | 'TODOS';

@Component({
  selector: 'app-abonos-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './abonos-pendientes.component.html',
  styleUrls: ['./abonos-pendientes.component.scss'],
})
export class AbonosPendientesComponent implements OnInit {
  loading = true;
  error: string | null = null;

  rows = signal<any[]>([]);
  filtroStatus = signal<StatusFiltro>('TODOS');
  filtroTexto = signal<string>('');

  filtered = computed(() => {
    const status = this.filtroStatus();
    const text = this.filtroTexto().toLowerCase().trim();

    return this.rows()
      .filter((r) => {
        const statusOk = status === 'TODOS' ? true : r.status === status;
        if (!statusOk) return false;

        if (!text) return true;
        const blob = `${r.id_abono} ${r.referencia || ''} ${r.concepto || ''} ${
          r.user_create || ''
        }`.toLowerCase();
        return blob.includes(text);
      })
      .sort((a, b) => (a.id_abono < b.id_abono ? 1 : -1));
  });

  constructor(private abonos: AbonosService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const status = this.filtroStatus();

    const obs =
      status === 'TODOS'
        ? this.abonos.getAbonosLista()
        : this.abonos.getAbonosLista({ status });

    obs.subscribe({
      next: (res: any) =>
        this.rows.set(Array.isArray(res?.data) ? res.data : []),
      error: () => {
        this.error = 'No se pudo cargar la lista de abonos.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  onStatusChange(): void {
    this.load();
  }

  getStatusPillClass(status: string): string {
    switch (status) {
      case 'CONCILIADO':
        return 'pill--conciliado'; // verde
      case 'ABIERTO':
        return 'pill--abierto'; // amarillo
      case 'PENDIENTE':
        return 'pill--pendiente'; // gris
      case 'RECHAZADO':
        return 'pill--rechazado'; // rojo
      default:
        return 'pill--pendiente';
    }
  }
}
