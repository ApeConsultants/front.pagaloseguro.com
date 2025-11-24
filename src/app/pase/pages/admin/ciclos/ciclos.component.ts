import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CicloService } from '../../../../core/services/ciclo.service';

type EstadoFiltro = 'todos' | 'ABIERTO' | 'POR_CERRAR' | 'CERRADO';

@Component({
  selector: 'app-ciclos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ciclos.component.html',
  styleUrls: ['./ciclos.component.scss']
})
export class CiclosComponent implements OnInit {
  loading = true;
  error: string | null = null;

  raw = signal<any[]>([]);
  q = signal<string>('');
  estado = signal<EstadoFiltro>('todos');

  totalCount = computed(() => this.raw().length);
  activosCount = computed(() =>
    this.raw().filter(c => (c.status || c.estado) === 'ABIERTO').length
  );
  porCerrarCount = computed(() =>
    this.raw().filter(c => (c.status === 'POR_CERRAR' || c.estado === 'Por cerrar pronto')).length
  );

  list = computed(() => {
    const text = this.q().toLowerCase().trim();
    const est = this.estado();
    return this.raw()
      .filter(c => {
        const s = (c.status || c.estado) as string | undefined;
        const okEstado = est === 'todos' ? true : s === est || (est === 'POR_CERRAR' && s === 'Por cerrar pronto');
        if (!okEstado) return false;
        if (!text) return true;
        const blob = `${c.code || c.nombre || ''} ${c.fe_inicio || c.feInicio || ''} ${c.fe_fin || c.feFin || ''}`.toLowerCase();
        return blob.includes(text);
      });
  });

  constructor(private ciclos: CicloService) {}

  ngOnInit(): void {
    this.ciclos.getListaCiclos().subscribe({
      next: (res) => {
        const actual = res?.data?.actual ? [res.data.actual] : [];
        const anteriores = Array.isArray(res?.data?.anteriores) ? res.data.anteriores : [];
        this.raw.set([...actual, ...anteriores]);
      },
      error: () => this.error = 'No se pudo cargar la lista de ciclos.',
      complete: () => this.loading = false
    });
  }
}