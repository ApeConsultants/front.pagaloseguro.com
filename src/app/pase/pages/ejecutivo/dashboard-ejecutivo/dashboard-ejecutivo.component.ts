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

  constructor(
    private abonosService: AbonosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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

  private formatDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private processAbonos(abonos: any[]): void {
    const todayStr = this.formatDateKey(new Date());
    const dayTotals: Record<string, number> = {};
    const ahorradores = new Set<string>();

    let depositosHoy = 0;
    let montoHoy = 0;
    let concPendientes = 0;

    abonos.forEach((a: any) => {
      const status = (a.status || '').toUpperCase();
      const concDia =
        typeof a.fe_conciliacion === 'string'
          ? a.fe_conciliacion.slice(0, 10)
          : null;
      const monto = Number(a.monto_abono || 0);

      if (status === 'CONCILIADO' && concDia === todayStr) {
        depositosHoy++;
        montoHoy += monto;
      }

      if (status === 'CONCILIADO' && concDia) {
        dayTotals[concDia] = (dayTotals[concDia] || 0) + monto;
      }

      if (status === 'PENDIENTE' || status === 'ABIERTO') {
        concPendientes++;
      }

      if (a.user_create) {
        ahorradores.add(a.user_create);
      }
    });

    this.kpis.depositosHoy = depositosHoy;
    this.kpis.montoCobrado = montoHoy;
    this.kpis.concPendientes = concPendientes;
    this.kpis.ahorradoresActivos = ahorradores.size;

    // Gráfica últimos 7 días
    const now = new Date();
    const dias: DiaMonto[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = this.formatDateKey(d);
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

    this.conciliacionesRecientes = abonos
      .filter((a) => !!a.fe_conciliacion)
      .slice()
      .sort((a, b) => (a.fe_conciliacion < b.fe_conciliacion ? 1 : -1))
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

  // ==== Formato de fecha de conciliación ====
  formatFeConciliacion(raw: string | null | undefined): string {
    if (!raw) {
      return 'Sin conciliación';
    }

    const [datePart, timePart] = raw.split(' ');
    if (!datePart) return raw;

    const [yearStr, monthStr, dayStr] = datePart.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const dateFormatted =
      `${day.toString().padStart(2, '0')}/` +
      `${month.toString().padStart(2, '0')}/` +
      `${year.toString().padStart(4, '0')}`;

    if (!timePart) {
      return dateFormatted;
    }

    const [hhStr, mmStr] = timePart.split(':');
    const hh = Number(hhStr);
    const mm = Number(mmStr);

    if (Number.isNaN(hh) || Number.isNaN(mm)) {
      return dateFormatted;
    }

    let hour12 = hh % 12;
    if (hour12 === 0) hour12 = 12;
    const ampm = hh < 12 ? 'AM' : 'PM';

    const timeFormatted =
      `${hour12.toString().padStart(2, '0')}:` +
      `${mm.toString().padStart(2, '0')} ${ampm}`;

    return `${dateFormatted} - ${timeFormatted}`;
  }
}
