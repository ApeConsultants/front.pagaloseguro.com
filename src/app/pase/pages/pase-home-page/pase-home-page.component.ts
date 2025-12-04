import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, switchMap, of, EMPTY, catchError, finalize, map, combineLatest, } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AhorroService } from '../../../core/services/ahorro.service';
import { CicloService } from '../../../core/services/ciclo.service';

@Component({
  selector: 'app-pase-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pase-home-page.component.html',
  styleUrls: ['./pase-home-page.component.scss'],
})
export class PaseHomePageComponent implements OnInit {
  public ahorroData$!: Observable<any>;
  public userId: string | null = null;
  public isAhorroMenuOpen = false;
  public isLoading = true;

  // Subpantalla
  showEnroll = false;
  loadingCiclos = false;
  ciclosDisponibles: any[] = [];
  registering = false;
  selectedCycleCode: string | null = null;

  // inyección de servicios
  private authService = inject(AuthService);
  private ahorroService = inject(AhorroService);
  private cicloService = inject(CicloService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    this.ahorroData$ = this.cicloService.getListaCiclos().pipe(
      switchMap((ciclosResponse) => {
        if (
          ciclosResponse.status === 'success' &&
          ciclosResponse.data?.actual &&
          this.userId
        ) {
          const cicloActual = ciclosResponse.data.actual.code;

          return this.ahorroService
            .getAhorro(Number(this.userId), cicloActual)
            .pipe(
              map((ahorroRes) => {
                if (
                  ahorroRes?.status !== 'success' ||
                  !ahorroRes.data?.id_ahorro
                ) {
                  return {
                    status: 'no_ahorro',
                    msg: 'Sin ahorro activo en el ciclo',
                  };
                }

                const data = ahorroRes.data;

                // racha que viene del backend
                const backendRachaRaw = (data as any).racha;
                const backendRacha =
                  backendRachaRaw != null ? Number(backendRachaRaw) || 0 : 0;

                // fallback por si en algún momento no viniera "racha"
                const fallbackStreak = this._computeFallbackStreakFromSemanas(
                  data?.semanas
                );

                const finalStreak =
                  backendRacha > 0 ? backendRacha : fallbackStreak;

                return {
                  ...ahorroRes,
                  data: {
                    ...data,
                    // usado por la UI (ring + texto)
                    _streak: finalStreak,
                    // mismo cálculo que antes para el próximo corte
                    _nextCutoff: this._nextMondayAt(0, 0).getTime(),
                  },
                };
              }),
              catchError(() =>
                of({ status: 'error', msg: 'No se pudieron cargar los datos.' })
              )
            );
        } else {
          return of({
            status: 'no_cycle',
            msg: 'No estás inscrito en un ciclo actual.',
          });
        }
      }),
      catchError((err) => {
        console.error('Error cargando datos del dashboard:', err);
        return of({ status: 'error', msg: 'No se pudieron cargar los datos.' });
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    );
  }

  // ====== Menú
  toggleAhorroMenu(): void {
    this.isAhorroMenuOpen = !this.isAhorroMenuOpen;
  }

  // ====== Racha: helpers
  private _computeFallbackStreakFromSemanas(semanasObj: any): number {
    if (!semanasObj) return 0;
    const all: any[] = [];

    if (Array.isArray(semanasObj.historial)) {
      all.push(...semanasObj.historial);
    }
    if (Array.isArray(semanasObj.anteriores)) {
      all.push(...semanasObj.anteriores);
    }

    if (!all.length) return 0;

    all.sort((a, b) => (a.semana ?? 0) - (b.semana ?? 0));

    let count = 0;
    for (let i = all.length - 1; i >= 0; i--) {
      const s = all[i] || {};
      const status = String(s.status || '').toUpperCase();
      const abonos = Number(s.abonos ?? 0);
      const deuda = Number(s.deuda ?? 0);

      const ok = status === 'CERRADO' && abonos >= deuda;
      if (ok) count++;
      else break;
    }

    return count;
  }

  /** Para cuando el backend agregue “racha más larga”. */
  getLongestStreak(data: any): number {
    if (!data) return 0;
    const raw =
      (data as any).racha_larga ??
      (data as any).rachaMax ??
      (data as any).racha_mas_larga ??
      (data as any)._streak;

    return raw != null ? Number(raw) || 0 : 0;
  }

  // ====== Próximo corte: cada LUNES 00:00
  getCorteFecha(data: any): string {
    const d = new Date(data?._nextCutoff ?? this._nextMondayAt(0, 0).getTime());
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }
  getCorteHora(data: any): string {
    const d = new Date(data?._nextCutoff ?? this._nextMondayAt(0, 0).getTime());
    return d.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  /** Próximo lunes a la hora/minuto indicado (00:00 para el cron). */
  private _nextMondayAt(h = 0, m = 0): Date {
    const now = new Date();
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h,
      m,
      0,
      0
    );
    const day = d.getDay(); // 0=dom, 1=lun
    let add = (1 - day + 7) % 7; // días hasta lunes
    if (add === 0 && now >= d) add = 7; // si ya pasó hoy a esa hora, siguiente lunes
    d.setDate(d.getDate() + add);
    return d;
  }

  // ==== Modal ====
  abrirRegistro(): void {
    this.showEnroll = true;
    this.loadingCiclos = true;
    this.selectedCycleCode = null;

    this.cicloService.getListaCiclos().subscribe({
      next: (res) => {
        this.ciclosDisponibles = [];
        if (res?.data?.actual) {
          this.ciclosDisponibles.push(res.data.actual);
          this.selectedCycleCode = res.data.actual.code;
        }
      },
      complete: () => (this.loadingCiclos = false),
    });
  }

  // Método para seleccionar al hacer click en la card
  selectCycle(code: string): void {
    this.selectedCycleCode = code;
  }

  registrarmeAlCiclo(): void {
    if (!this.userId || !this.selectedCycleCode) return;

    this.registering = true;
    const servicio: any = this.cicloService as any;

    if (typeof servicio.registrarUsuarioEnCiclo === 'function') {
      servicio
        .registrarUsuarioEnCiclo(this.userId, this.selectedCycleCode)
        .subscribe({
          next: () => this.finalizarRegistro(),
          error: () => this.finalizarRegistro(),
        });
    } else {
      this.finalizarRegistro();
    }
  }

  private finalizarRegistro(): void {
    this.registering = false;
    this.showEnroll = false;
    this.router.navigate(['/pase/depositar']);
  }
}
