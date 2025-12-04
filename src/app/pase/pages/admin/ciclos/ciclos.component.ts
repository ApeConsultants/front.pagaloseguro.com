import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CicloService } from '../../../../core/services/ciclo.service';

type EstadoFiltro = 'todos' | 'ABIERTO' | 'POR_CERRAR' | 'CERRADO';

interface FeInicioOption {
  feInicio: string;
  feFin: string;
}

@Component({
  selector: 'app-ciclos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ciclos.component.html',
  styleUrls: ['./ciclos.component.scss'],
})
export class CiclosComponent implements OnInit {
  // Estado general
  loading = true;
  error: string | null = null;

  // Lista de ciclos
  raw = signal<any[]>([]);
  q = signal<string>('');
  estado = signal<EstadoFiltro>('todos');

  totalCount = computed(() => this.raw().length);
  activosCount = computed(
    () => this.raw().filter((c) => (c.status || c.estado) === 'ABIERTO').length
  );
  porCerrarCount = computed(
    () =>
      this.raw().filter(
        (c) => c.status === 'POR_CERRAR' || c.estado === 'Por cerrar pronto'
      ).length
  );

  list = computed(() => {
    const text = this.q().toLowerCase().trim();
    const est = this.estado();

    return this.raw().filter((c) => {
      const s = (c.status || c.estado) as string | undefined;
      const okEstado =
        est === 'todos'
          ? true
          : s === est || (est === 'POR_CERRAR' && s === 'Por cerrar pronto');
      if (!okEstado) return false;

      if (!text) return true;

      const blob = `${c.code || c.nombre || ''} ${
        c.fe_inicio || c.feInicio || ''
      } ${c.fe_fin || c.feFin || ''}`.toLowerCase();
      return blob.includes(text);
    });
  });

  // ==== Crear ciclo ====
  createMode = signal(false);
  createLoading = signal(false);
  creating = signal(false);
  createError = signal<string | null>(null);

  opcionesFeInicio = signal<FeInicioOption[]>([]);
  nuevoCode = signal<string>('');
  nuevoFeInicio = signal<string>('');

  constructor(private ciclos: CicloService) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  private cargarLista(): void {
    this.loading = true;
    this.error = null;

    this.ciclos.getListaCiclos().subscribe({
      next: (res) => {
        const actual = res?.data?.actual ? [res.data.actual] : [];
        const anteriores = Array.isArray(res?.data?.anteriores)
          ? res.data.anteriores
          : [];
        this.raw.set([...actual, ...anteriores]);
      },
      error: () => (this.error = 'No se pudo cargar la lista de ciclos.'),
      complete: () => (this.loading = false),
    });
  }

  // Abrir panel de creación
  onCrearClick(): void {
    this.createMode.set(true);
    this.createError.set(null);

    if (!this.opcionesFeInicio().length) {
      this.cargarDataToCreate();
    }
  }

  private cargarDataToCreate(): void {
    this.createLoading.set(true);
    this.createError.set(null);

    this.ciclos.getDataToCreate().subscribe({
      next: (res) => {
        const arr: FeInicioOption[] = Array.isArray(res?.data?.feInicio)
          ? res.data.feInicio
          : [];
        this.opcionesFeInicio.set(arr);

        if (!this.nuevoFeInicio() && arr.length) {
          this.nuevoFeInicio.set(arr[0].feInicio);
        }
      },
      error: () => {
        this.createError.set(
          'No se pudieron cargar las fechas disponibles para crear el ciclo.'
        );
      },
      complete: () => this.createLoading.set(false),
    });
  }

  // Cancelar creación
  onCancelarCrear(): void {
    this.createMode.set(false);
    this.createError.set(null);
    this.createLoading.set(false);
    this.creating.set(false);
  }

  // Guardar nuevo ciclo
  onSubmitCrear(): void {
    const code = this.nuevoCode().trim();
    const feInicio = this.nuevoFeInicio();

    if (!code || !feInicio) {
      this.createError.set(
        'Debes capturar el código y seleccionar una fecha de inicio.'
      );
      return;
    }

    this.creating.set(true);
    this.createError.set(null);

    this.ciclos.createCiclo({ code, feInicio }).subscribe({
      next: (res) => {
        const rawStatus = (res?.status ?? '').toString().toLowerCase();
        const ok = rawStatus === 'success' || rawStatus === 'ok';

        if (!ok) {
          const msg = res?.desc || res?.msg || 'No se pudo crear el ciclo.';
          this.createError.set(msg);
          return;
        }

        // Recarga lista de ciclos
        this.cargarLista();
        this.createMode.set(false);
        this.nuevoCode.set('');
        this.nuevoFeInicio.set('');
      },
      error: () => {
        this.createError.set('Ocurrió un error al crear el ciclo.');
      },
      complete: () => this.creating.set(false),
    });
  }
}
