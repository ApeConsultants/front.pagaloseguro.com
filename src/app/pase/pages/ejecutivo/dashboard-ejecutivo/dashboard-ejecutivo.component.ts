import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AbonosService } from '../../../../core/services/abonos.service';
import { AuthService } from '../../../../core/services/auth.service';

interface ExecKpis {
  depositosHoy: number;
  montoCobrado: number;
  concPendientes: number;
  ahorradoresActivos: number;
}

interface DiaMonto {
  label: string;
  total: number;
}

@Component({
  selector: 'app-dashboard-ejecutivo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-ejecutivo.component.html',
  styleUrls: ['./dashboard-ejecutivo.component.scss'],
})
export class DashboardEjecutivoComponent implements OnInit {
  loading = true;
  error: string | null = null;

  kpis: ExecKpis = {
    depositosHoy: 0,
    montoCobrado: 0,
    concPendientes: 0,
    ahorradoresActivos: 0,
  };

  semanaChart: DiaMonto[] = [];
  semanaMax = 0;
  conciliacionesRecientes: any[] = [];
  notas: string[] = [];

  private userName: string | null = null;

  constructor(
    private abonosService: AbonosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    this.abonosService
      .getAbonosLista()
      .pipe(catchError(() => of({ data: [] })))
      .subscribe({
        next: (res) => {
          const abonosArr = Array.isArray(res?.data) ? res.data : [];

          this.processAbonos(abonosArr);
          this.buildNotas();
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar la información del dashboard.';
          this.loading = false;
        },
      });
  }

  private processAbonos(abonos: any[]): void {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dayTotals: Record<string, number> = {};
    const ahorradores = new Set<string>();

    let depositosHoy = 0;
    let montoCobrado = 0;
    let concPendientes = 0;

    abonos.forEach((a: any) => {
      const status = (a.status || '').toUpperCase();
      const fechaBase = a.fe_conciliacion || a.fe_create;
      const dia = typeof fechaBase === 'string' ? fechaBase.slice(0, 10) : null;
      const monto = Number(a.monto_abono || 0);

      const esDelEjecutivo =
        !this.userName || a.usuario_conciliacion === this.userName;

      const esConciliadoDelExec = status === 'CONCILIADO' && esDelEjecutivo;

      if (dia === todayStr && esConciliadoDelExec) {
        depositosHoy++;
      }

      if (esConciliadoDelExec) {
        montoCobrado += monto;
        if (dia) {
          dayTotals[dia] = (dayTotals[dia] || 0) + monto;
        }
      }

      if (status === 'PENDIENTE' || status === 'ABIERTO') {
        concPendientes++;
      }

      if (a.user_create) {
        ahorradores.add(a.user_create);
      }
    });

    this.kpis.depositosHoy = depositosHoy;
    this.kpis.montoCobrado = montoCobrado;
    this.kpis.concPendientes = concPendientes;
    this.kpis.ahorradoresActivos = ahorradores.size;

    // Gráfica últimos 7 días
    const now = new Date();
    const dias: DiaMonto[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: '2-digit',
      });

      dias.push({
        label,
        total: dayTotals[key] || 0,
      });
    }

    this.semanaChart = dias;
    this.semanaMax = dias.reduce(
      (max, d) => (d.total > max ? d.total : max),
      0
    );

    // Conciliaciones recientes
    this.conciliacionesRecientes = abonos
      .slice()
      .sort((a, b) => (a.fe_create < b.fe_create ? 1 : -1))
      .slice(0, 5);
  }

  getBarHeight(total: number): number {
    if (!this.semanaMax) {
      return 0;
    }
    const pct = (total / this.semanaMax) * 100;
    return Math.max(5, Math.round(pct));
  }

  private buildNotas(): void {
    const notes: string[] = [];

    if (this.kpis.concPendientes > 0) {
      notes.push(
        `Tienes ${this.kpis.concPendientes} conciliaciones pendientes de revisar.`
      );
    }

    if (this.kpis.depositosHoy === 0) {
      notes.push('Aún no se han conciliado depósitos el día de hoy.');
    }

    if (!notes.length) {
      notes.push('Buen trabajo, no hay pendientes críticos por ahora.');
    }

    this.notas = notes;
  }

  // ==== Chip de estado para "Conciliaciones recientes" ====
  getStatusChipClass(status: string | null | undefined): string {
    const s = (status || '').toUpperCase();
    if (s === 'CONCILIADO') return 'chip-green';
    if (s === 'PENDIENTE' || s === 'ABIERTO') return 'chip-amber';
    if (s === 'RECHAZADO') return 'chip-red';
    return 'chip-gray';
  }
}
