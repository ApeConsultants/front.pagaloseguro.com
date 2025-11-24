import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, of, catchError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CicloService } from '../../../core/services/ciclo.service';
import { AhorroService } from '../../../core/services/ahorro.service';
import { AbonosService } from '../../../core/services/abonos.service';

type AbonoStep =
  | 'loading'
  | 'error'
  | 'step1_monto'
  | 'step2_evidencia'
  | 'success';

@Component({
  selector: 'app-abono',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './abono.component.html',
  styleUrls: ['./abono.component.scss'],
})
export class AbonoComponent implements OnInit {
  // Estado del flujo
  currentStep: AbonoStep = 'loading';
  error: string | null = null;
  creating = false;

  // Datos de la Semana/Ahorro
  idSemana: number | null = null;
  ahorro: any = null;
  selectedWeek: any = null;

  // Datos del Abono
  montoAbonar: number | null = null;
  fileEvidencia: File | null = null;
  filePreview: string | null = null;
  idAbonoCreado: number | null = null;
  referencia: string | null = null;
  concepto: string | null = null;

  // Datos fijos del beneficiario (Temporal)
  beneficiario = {
    nombre: 'Jose Luis Medina Ferrusquia',
    tarjeta: 'XXXX-XXXX-XXXX-XXXX',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private ciclos: CicloService,
    private ahorroSrv: AhorroService,
    private abonos: AbonosService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();

    // 1. Obtener idSemana de la URL y cargar datos del Abono/Semana
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idSemanaStr = params.get('idSemana');
          this.idSemana = idSemanaStr ? Number(idSemanaStr) : null;

          if (!userId || !this.idSemana) {
            return of({
              status: 'error',
              msg: 'Parámetros o sesión inválidos.',
            });
          }

          // 2. Obtener Ciclo Actual
          return this.ciclos.getListaCiclos().pipe(
            switchMap((cx) => {
              const cicloActual = cx?.data?.actual?.code;
              if (!cicloActual) {
                return of({ status: 'error', msg: 'No hay ciclo activo.' });
              }

              // 3. Obtener Ahorro (que incluye datos de semanas)
              return this.ahorroSrv
                .getAhorro(Number(userId), cicloActual)
                .pipe(
                  catchError(() =>
                    of({ status: 'error', msg: 'Error cargando ahorro.' })
                  )
                );
            })
          );
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res.status === 'error' || !res.data?.id_ahorro) {
            this.error = res.msg || 'No se pudo cargar el ahorro activo.';
            this.currentStep = 'error';
            return;
          }

          this.ahorro = res.data;

          // 4. Buscar la semana específica
          const semanas = [
            res.data.semanas.actual,
            ...(Array.isArray(res.data.semanas.anteriores)
              ? res.data.semanas.anteriores
              : []),
          ].filter((s) => s);

          this.selectedWeek = semanas.find(
            (s: any) => s.id_semana === this.idSemana
          );

          // AHORA permitimos ABIERTO y CERRADO
          const allowedStatuses = ['ABIERTO', 'CERRADO'];
          if (
            !this.selectedWeek ||
            !allowedStatuses.includes(this.selectedWeek.status)
          ) {
            this.error =
              'Semana no encontrada o no se puede abonar en su estado actual.';
            this.currentStep = 'error';
            return;
          }

          // Inicializar monto con la deuda (o monto base)
          this.montoAbonar = Number(
            this.selectedWeek.deuda ?? this.ahorro.monto_base
          );
          this.currentStep = 'step1_monto'; // Iniciar flujo
        },
        error: (e) => {
          console.error(e);
          this.error = 'Error de conexión durante la carga de datos.';
          this.currentStep = 'error';
        },
      });
  }

  // Helpers
  get montoMaximoPermitido(): number {
    const deudaSemana = this.selectedWeek?.deuda;
    if (deudaSemana !== undefined && deudaSemana !== null) {
      return Number(deudaSemana);
    }
    return Number(this.ahorro?.monto_base ?? 0);
  }

  // Validez del monto a abonar ( > 0 y no exceder la deuda )
  get montoAbonarValido(): boolean {
    if (this.montoAbonar === null) return false;

    const monto = Number(this.montoAbonar);
    const max = this.montoMaximoPermitido;

    if (monto <= 0) return false;
    if (max > 0 && monto > max) return false;

    return true;
  }

  get datosPaso2Validos(): boolean {
    const refValida = !!this.referencia && this.referencia.trim().length > 0;
    const concValido = !!this.concepto && this.concepto.trim().length > 0;

    return !!this.fileEvidencia && refValida && concValido;
  }

  // ======================================
  // NAVEGACIÓN Y FLUJO
  // ======================================

  goToStep(step: AbonoStep): void {
    this.currentStep = step;
    this.error = null;
  }

  // Botón "Continuar" (Paso 1 -> Paso 2)
  continuarAbono(): void {
    if (this.montoAbonarValido) {
      this.goToStep('step2_evidencia');
    }
  }

  // Botón "Regresar"
  goBack(): void {
    if (this.currentStep === 'step2_evidencia') {
      this.goToStep('step1_monto');
      this.fileEvidencia = null;
      this.filePreview = null;
      // referencia / concepto se conservan
    } else {
      // Para step1_monto, loading, error, etc.
      this.router.navigate(['/pase/depositar']);
    }
  }

  // Redirección final
  confirmSuccess(): void {
    this.router.navigate(['/pase/depositar']);
  }

  // ======================================
  // MANEJO DE ARCHIVOS Y POST
  // ======================================

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.match(/image\//)) {
      this.fileEvidencia = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.filePreview = reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.fileEvidencia = null;
      this.filePreview = null;
      this.error = 'Por favor, selecciona una imagen (JPG/PNG).';
    }
  }

  // Botón "Abonar" (Ejecuta POST Abrir Abono y POST Subir Evidencia)
  async finalizarAbono(): Promise<void> {
    if (!this.montoAbonarValido || !this.datosPaso2Validos) {
      this.error =
        'Faltan datos obligatorios, el monto es inválido o la referencia/concepto están vacíos.';
      return;
    }

    this.creating = true;
    this.error = null;

    try {
      // 1. Armar FormData
      const formData = new FormData();
      formData.append('idSemana', this.idSemana!.toString());
      formData.append('monto', (this.montoAbonar as number).toString());
      formData.append('idAhorro', this.ahorro.id_ahorro.toString());
      formData.append('referencia', this.referencia!);
      formData.append('concepto', this.concepto!);
      formData.append(
        'evidencia',
        this.fileEvidencia!,
        this.fileEvidencia!.name
      );

      // 2. Llamar al servicio
      const abonoRes: any = await this.abonos
        .createAbonoWithEvidencia(formData)
        .toPromise();

      console.log('Respuesta crear abono:', abonoRes);

      // Normalizamos el status (success / OK / ok)
      const rawStatus = (abonoRes?.status ?? '').toString().toLowerCase();
      const isOk = rawStatus === 'success' || rawStatus === 'ok';

      if (!isOk) {
        const backendMsg = abonoRes?.desc || abonoRes?.msg;
        throw new Error(backendMsg || 'Error al crear la solicitud de abono.');
      }

      // Si el backend mandó id, lo usamos; si no, no pasa nada
      this.idAbonoCreado =
        abonoRes?.data?.id_abono ?? abonoRes?.id_abono ?? null;

      // 3. Mostrar modal de éxito
      this.goToStep('success');

      // Si en lugar de modal quisieras redirigir directo, podrías hacer:
      // this.router.navigate(['/pase']);
    } catch (e: any) {
      console.error('Error durante el proceso de abono:', e);
      this.error =
        e?.message || 'Error en el proceso de abono. Intenta de nuevo.';
    } finally {
      this.creating = false;
    }
  }
}
