import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CicloService } from '../../../core/services/ciclo.service';
import { AhorroService } from '../../../core/services/ahorro.service';
import { SemanasService } from '../../../core/services/semanas.service';
import { AbonosService } from '../../../core/services/abonos.service';

@Component({
  selector: 'app-depositar-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './depositar.component.html',
  styleUrls: ['./depositar.component.scss'],
})
export class DepositarComponent implements OnInit {
  userId: string | null = null;
  cicloActual: string | null = null;

  ahorro: any = null;
  semanas: any[] = [];
  selectedSemana: number | null = null;

  // UI state
  loading = true;
  error: string | null = null;

  // Crear ahorro
  montoBase: number | null = null;
  creatingAhorro = false;

  // Aceptación de contrato / reglamento
  aceptaReglamento = false;

  // Abrir abono
  creating = false;

  constructor(
    private auth: AuthService,
    private ciclos: CicloService,
    private ahorroSrv: AhorroService,
    private semanasSrv: SemanasService,
    private abonos: AbonosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    if (!this.userId) {
      this.error = 'Sesión no válida';
      this.loading = false;
      return;
    }

    this.ciclos.getListaCiclos().subscribe({
      next: (cx) => {
        this.cicloActual = cx?.data?.actual?.code ?? null;
        if (!this.cicloActual) {
          this.loading = false;
          return;
        }

        this.ahorroSrv
          .getAhorro(Number(this.userId), this.cicloActual)
          .subscribe({
            next: (ah) => {
              const d = ah?.data;
              const tieneAhorro =
                ah?.status === 'success' &&
                d &&
                !Array.isArray(d) &&
                Number(d.id_ahorro) > 0;

              if (tieneAhorro) {
                this.ahorro = d;
                this.loadSemanas();
              } else {
                this.ahorro = null;
                this.loading = false;
              }
            },
            error: () => {
              this.error = 'No se pudo cargar tu ahorro.';
              this.loading = false;
            },
          });
      },
      error: () => {
        this.error = 'No se pudo obtener el ciclo actual.';
        this.loading = false;
      },
    });
  }

  /** Vista CON ahorro? */
  hasAhorro(): boolean {
    return !!(this.ahorro && Number(this.ahorro.id_ahorro) > 0);
  }

  private loadSemanas(): void {
    if (!this.userId || !this.cicloActual) {
      this.loading = false;
      return;
    }

    this.semanasSrv.getSemanasAdeudo(this.userId, this.cicloActual).subscribe({
      next: (sx) => {
        const base = Array.isArray(sx?.data) ? sx.data : [];

        let semanasAhorro: any[] = [];
        if (this.ahorro?.semanas) {
          const actual = this.ahorro.semanas.actual;
          const anteriores = Array.isArray(this.ahorro.semanas.anteriores)
            ? this.ahorro.semanas.anteriores
            : [];
          semanasAhorro = [actual, ...anteriores].filter((s) => !!s);
        }

        this.semanas = base.map((s: any) => {
          const match = semanasAhorro.find((w: any) => w.semana === s.semana);
          return {
            ...s,
            id_semana: match?.id_semana ?? null,
          };
        });

        const abierta = this.semanas.find((s: any) => s.status === 'ABIERTO');
        this.selectedSemana =
          abierta?.semana ?? this.semanas[0]?.semana ?? null;
      },
      error: () => {
        this.error = 'No se pudieron cargar las semanas.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // ====== Crear ahorro y redirigir a /pase
  crearAhorro(): void {
    if (!this.userId || !this.cicloActual) return;

    const monto = Number(this.montoBase ?? 0);
    if (isNaN(monto) || monto < 100) return;

    if (!this.aceptaReglamento) {
      this.error =
        'Debes aceptar los términos y condiciones del reglamento para comenzar tu ahorro.';
      return;
    }

    this.creatingAhorro = true;
    this.error = null;

    this.ahorroSrv
      .createAhorro({
        monto_base: monto,
        idUsuario: Number(this.userId),
        ciclo: this.cicloActual,
        aceptacion: this.aceptaReglamento,
      })
      .subscribe({
        next: (res) => {
          if (res?.status === 'success') {
            this.router.navigate(['/pase']);
          } else {
            this.error = res?.msg || 'No se pudo crear el ahorro.';
            this.creatingAhorro = false;
          }
        },
        error: () => {
          this.error = 'No se pudo crear el ahorro.';
          this.creatingAhorro = false;
        },
      });
  }

  // ====== Reglas de negocio: suspensión por 3 atrasos consecutivos
  isSuspended(): boolean {
    if (!Array.isArray(this.semanas) || !this.semanas.length) return false;
    const sorted = [...this.semanas].sort((a, b) =>
      a.semana > b.semana ? -1 : 1
    );
    let streak = 0;
    for (const s of sorted) {
      const atraso = s.status !== 'ABIERTO' && Number(s.deuda ?? 0) > 0;
      if (atraso) streak++;
      else break;
    }
    return streak >= 3;
  }

  getEstadoSemanaLabel(s: any): string {
    const abonos = Number(s.abonos ?? 0);
    const deuda = Number(s.deuda ?? 0);

    if (s.status === 'ABIERTO') {
      return 'ABIERTO';
    }

    if (s.status === 'CERRADO') {
      if (abonos > 0 && abonos < deuda) {
        return 'ABONO INCOMPLETO';
      }
      if (abonos === 0) {
        return 'SIN ABONO';
      }
      if (abonos >= deuda) {
        return 'ABONO COMPLETO';
      }
    }

    return s.status || '—';
  }

  isSemanaOk(s: any): boolean {
    return s.status === 'ABIERTO';
  }

  /** Para habilitar/deshabilitar botón "Abonar" */
  canAbonarSemana(s: any): boolean {
    if (this.isSuspended()) return false;

    const deuda = Number(s.deuda ?? 0);
    if (isNaN(deuda) || deuda <= 0) return false;

    return s.status === 'ABIERTO' || s.status === 'CERRADO';
  }

  get montoBaseNum(): number {
    const n = Number(this.montoBase ?? 0);
    return isNaN(n) ? 0 : n;
  }

  depositarSemana(s: any): void {
    if (!s || !this.canAbonarSemana(s)) return;
    const idSemana = Number(s.id_semana);
    if (!idSemana) {
      console.error('Semana sin id_semana válido', s);
      return;
    }
    this.router.navigate(['/pase/depositar/abono', idSemana]);
  }
}
