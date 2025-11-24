import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  Observable,
  switchMap,
  of,
  catchError,
  map,
  take,
  forkJoin,
} from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AhorroService } from '../../../core/services/ahorro.service';
import { CicloService } from '../../../core/services/ciclo.service';
import { SemanasService } from '../../../core/services/semanas.service';

type Badge = {
  id: string;
  label: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
};

// Interfaz para manejar el estado de la vista
interface ProgressViewData {
  status: 'success' | 'no_cycle' | 'no_ahorro' | 'error';
  ahorro?: any;
  semanas?: any[];
  streakState?: {
    // Estado calculado de la racha
    count: number;
    isBroken: boolean;
    isZero: boolean;
    isFinished: boolean;
    message: string;
    msgEmoji: string;
  };
  historialCombinado?: any[];
  metaInfo?: {
    // Info para la barra segmentada
    abonos: number;
    meta: number;
    percent: number;
    segments: any[];
  };
}

@Component({
  selector: 'app-pase-progress-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: '../progreso/progreso.component.html',
  styleUrls: ['../progreso/progreso.component.scss'],
})
export class PaseProgressPageComponent implements OnInit {
  viewData$!: Observable<ProgressViewData>;
  ahorroData$!: Observable<any>;
  private userId: string | null = null;
  loading = true;

  // Subpantalla
  showEnroll = false;
  ciclosDisponibles: any[] = [];
  loadingCiclos = false;
  registering = false;
  isMenuOpen = false;
  selectedCycleCode: string | null = null;

  // Ruleta de mensajes
  private motivationalPhrases = [
    '¡Sigue así!',
    '¡Vas por buen camino!',
    'Una moneda más para el chanchito.',
    'Tu esfuerzo de hoy es tu tranquilidad de mañana.',
    '¡Estás construyendo tu futuro!',
    'Paso a paso se llega lejos.',
  ];
  public randomPhrase: string = '';

  constructor(
    private auth: AuthService,
    private ahorros: AhorroService,
    private ciclos: CicloService,
    private semanasService: SemanasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    // Seleccionar frase aleatoria al inicio
    this.randomPhrase =
      this.motivationalPhrases[
        Math.floor(Math.random() * this.motivationalPhrases.length)
      ];

    this.viewData$ = this.ciclos.getListaCiclos().pipe(
      take(1),
      switchMap((resCiclos) => {
        // 1. Validar ciclo y usuario
        if (
          resCiclos.status === 'success' &&
          resCiclos.data?.actual &&
          this.userId
        ) {
          const cicloActual = resCiclos.data.actual.code;
          const uid = Number(this.userId);

          // 2. Consultas en paralelo (forkJoin)
          return forkJoin({
            ahorroRes: this.ahorros
              .getAhorro(uid, cicloActual)
              .pipe(catchError(() => of({ status: 'error' }))),
            semanasRes: this.semanasService
              .getSemanasAdeudo(uid, cicloActual)
              .pipe(catchError(() => of({ status: 'error' }))),
          }).pipe(
            map(({ ahorroRes, semanasRes }) => {
              if (
                ahorroRes.status !== 'success' ||
                !ahorroRes.data?.id_ahorro
              ) {
                return { status: 'no_ahorro' } as ProgressViewData;
              }

              const ahorroData = ahorroRes.data;
              const semanasData = Array.isArray(semanasRes.data)
                ? semanasRes.data
                : [];

              // --- Racha: ahora se basa en ahorroData.racha + semanas de adeudo ---
              const streakCalc = this.calculateStreak(ahorroData, semanasData);

              // --- Barra segmentada ---
              const metaInfo = this.calculateSegments(ahorroData);

              // --- Historial unificado (usa ahorro.semanas + semanasAdeudo) ---
              const historial = this.processHistory(
                ahorroData.semanas,
                semanasData
              );

              return {
                status: 'success',
                ahorro: ahorroData,
                semanas: semanasData,
                streakState: streakCalc,
                historialCombinado: historial,
                metaInfo: metaInfo,
              } as ProgressViewData;
            })
          );
        }
        return of({ status: 'no_cycle' } as ProgressViewData);
      }),
      catchError(() => of({ status: 'error' } as ProgressViewData))
    );
  }

  // ==============================
  // Lógica de Negocio (Helpers)
  // ==============================

  private calculateStreak(ahorroData: any, semanasAdeudo: any[]): any {
    const rachaRaw = ahorroData?.racha;
    const count = rachaRaw != null ? Number(rachaRaw) || 0 : 0;
    const adeudos = Array.isArray(semanasAdeudo) ? semanasAdeudo : [];

    const hasAdeudosPendientes = adeudos.some((s) => {
      const ab = Number(s?.abonos ?? 0);
      const de = Number(s?.deuda ?? 0);
      return ab < de && de > 0;
    });

    const hasAlgunaSemana = adeudos.length > 0;

    const objetivoSemanas = 50;

    const isFinished = count >= objetivoSemanas;
    const isBroken = hasAdeudosPendientes && count === 0 && hasAlgunaSemana;
    const isZero = count === 0 && !hasAdeudosPendientes;

    let msg = '';
    let emoji = '';

    if (isFinished) {
      msg =
        'Concluiste el ciclo de ahorro, regístrate a uno nuevo para seguir ahorrando 💰';
      emoji = '🏁';
    } else if (isBroken) {
      msg = 'Realiza el depósito de esta semana para empezar nuevamente. 🪙';
      emoji = '💔';
    } else if (isZero) {
      msg = 'Realiza el depósito de tu ahorro para comenzar una racha 🔥';
      emoji = '🌱';
    } else {
      msg = `Has mantenido tu racha de ahorro ${count} semanas de ${objetivoSemanas}. ${this.randomPhrase}`;
      emoji = '🚀';
    }

    return {
      count,
      isBroken,
      isZero,
      isFinished,
      message: msg,
      msgEmoji: emoji,
    };
  }

  private calculateSegments(data: any): any {
    const abonos = Number(data.abonos ?? 0);
    const meta = Number(data.meta ?? 1); // Evitar div por 0
    const penalizaciones = Number(data.penalizaciones ?? 0);
    // Puedes agregar prestamos aqui si se requiere en el futuro

    const percent = Math.min(100, Math.round((abonos / meta) * 100));

    // Cálculos de ancho para la barra (simple rule of three)
    const wAbonos = Math.min(100, (abonos / meta) * 100);
    const wPenal = Math.min(100, (penalizaciones / meta) * 100);

    // Filtrar segmentos con ancho > 0
    const segments = [
      { key: 'abonos', label: 'Abonos', width: wAbonos, class: 'seg-abono' },
      {
        key: 'penal',
        label: 'Penalizaciones',
        width: wPenal,
        class: 'seg-penal',
      },
    ].filter((s) => s.width > 0);

    return {
      abonos,
      meta,
      percent,
      segments,
    };
  }

  private processHistory(semanasObj: any, semanasAdeudo: any[]): any[] {
    if (!semanasObj) return [];

    const rows: any[] = [];
    const adeudos = Array.isArray(semanasAdeudo) ? semanasAdeudo : [];
    const hasAdeudo = adeudos.length > 0;

    const pushSemana = (
      s: any,
      origen: 'actual' | 'anteriores' | 'historial'
    ) => {
      if (!s) return;
      const abonos = Number(s.abonos ?? 0);
      const deuda = Number(s.deuda ?? 0);
      let estadoLabel = '';
      let estadoClass = '';

      if (origen === 'historial') {
        estadoLabel = 'Conciliado';
        estadoClass = 'chip-green';
      } else if (s.status === 'ABIERTO') {
        estadoLabel = 'Pendiente';
        estadoClass = 'chip-gray';
      } else if (s.status === 'CERRADO') {
        if (abonos > 0 && abonos < deuda) {
          estadoLabel = 'Abono incompleto';
          estadoClass = 'chip-red';
        } else if (abonos === 0 && deuda > 0) {
          estadoLabel = 'Sin abono';
          estadoClass = 'chip-red';
        } else if (abonos >= deuda) {
          estadoLabel = 'Conciliado';
          estadoClass = 'chip-green';
        } else {
          estadoLabel = 'Cerrado';
          estadoClass = 'chip-gray';
        }
      } else {
        estadoLabel = s.status || '—';
        estadoClass = 'chip-gray';
      }

      rows.push({
        id_semana: s.id_semana,
        semana: s.semana,
        monto: deuda,
        estadoLabel,
        estadoClass,
        tieneComentario: s.comentarios && s.comentarios.length > 0,
      });
    };

    // === Semana actual ===
    const rawActual = semanasObj.actual;
    const actual =
      rawActual &&
      !Array.isArray(rawActual) &&
      Object.keys(rawActual).length > 0
        ? rawActual
        : null;

    if (
      actual &&
      hasAdeudo &&
      String(actual.status || '').toUpperCase() === 'ABIERTO'
    ) {
      pushSemana(actual, 'actual');
    }

    // === Anteriores e historial ===
    if (Array.isArray(semanasObj.anteriores)) {
      semanasObj.anteriores.forEach((s: any) => pushSemana(s, 'anteriores'));
    }

    if (Array.isArray(semanasObj.historial)) {
      semanasObj.historial.forEach((s: any) => pushSemana(s, 'historial'));
    }

    const filtradas = rows.sort((a, b) => b.semana - a.semana);

    return filtradas;
  }

  // ===== Lógica de Insignias (ACTUALIZADA con lógica Duolingo) =====
  badges(r: ProgressViewData): Badge[] {
    if (r.status !== 'success' || !r.streakState) return [];

    // La racha actual CONTINUA que ha mantenido el usuario
    const w = r.streakState.count;
    const hasFirstDeposit = (r.metaInfo?.abonos ?? 0) > 0;

    // NUEVOS UMBRALES: Basado en niveles de 4 semanas (12 niveles * 4 semanas = 48 semanas)
    const MAX_LEVEL = 12;
    const WEEKS_PER_LEVEL = 4;

    // Nivel alcanzado (ej. 7 si logró 7 * 4 = 28 semanas)
    const currentStreakLevel = Math.floor(w / WEEKS_PER_LEVEL);

    const levels = [
      { id: 'streak', label: 'Racha', max: MAX_LEVEL },
      { id: 'first', label: 'Primer depósito', max: 1 },
    ];

    const calcLevel = (id: string): number => {
      if (id === 'first') return hasFirstDeposit ? 1 : 0;

      if (id === 'streak') {
        // El nivel alcanzado es el mínimo entre el nivel calculado por semanas y el máximo permitido
        return Math.min(currentStreakLevel, MAX_LEVEL);
      }
      return 0;
    };

    return levels.map((l) => {
      const lvl = calcLevel(l.id);

      return {
        id: l.id,
        // REQUERIMIENTO: La etiqueta de la racha siempre es "Racha de 4" (el hito base)
        label: l.id === 'streak' ? `${l.label} de ${WEEKS_PER_LEVEL}` : l.label,
        level: lvl, // Nivel alcanzado (0 a 12)
        maxLevel: MAX_LEVEL,
        unlocked: lvl > 0,
      };
    });
  }

  // ===== Métodos del Modal y Menú =====
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  selectCycle(code: string): void {
    this.selectedCycleCode = code;
  }

  abrirRegistro(): void {
    this.showEnroll = true;
    this.loadingCiclos = true;
    this.selectedCycleCode = null;
    this.ciclos.getListaCiclos().subscribe({
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

  // Se reutiliza la lógica de "Consultar" para que abra el mismo modal o navegue
  abrirConsultaCiclos(): void {
    // Req 2: Botón "Consultar" al finalizar ciclo
    this.abrirRegistro();
  }

  registrarmeAlCiclo(): void {
    if (!this.userId || !this.selectedCycleCode) return;
    this.registering = true;
    const servicio: any = this.ciclos as any;
    // Ajusta si tu servicio tiene el método tipado correctamente
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
