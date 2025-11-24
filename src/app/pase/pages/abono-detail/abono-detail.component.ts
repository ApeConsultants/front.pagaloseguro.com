import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AbonosService } from '../../../core/services/abonos.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abono-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './abono-detail.component.html',
  styleUrls: ['./abono-detail.component.scss'],
})
export class AbonoDetailComponent implements OnInit {
  id!: number;
  loading = true;
  error: string | null = null;
  abono: any = null;

  acceptCheck = false;
  canConciliar = false;

  conciliando = false;
  rechazando = false;

  comentarios: any[] = [];
  loadingComentarios = false;
  nuevoComentario = '';
  postingComentario = false;
  comentarioError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private abonos: AbonosService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = Number(param);

    if (!this.id) {
      this.error = 'Abono no válido';
      this.loading = false;
      return;
    }

    const t = this.auth.getUserType();
    this.canConciliar = t === 'admin' || t === 'ejecutivo';

    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    this.abonos.getAbono(this.id).subscribe({
      next: (res: any) => {
        this.abono = res?.data || null;

        if (this.abono) {
          this.loadComentarios();
        }
      },
      error: () => {
        this.error = 'No se pudo cargar el abono.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  fileUrl(path: string): string {
    if (!path) return '#';
    return path.startsWith('http') ? path : `${environment.apiUrl}${path}`;
  }

  getStatusPillClass(status: string): string {
    switch (status) {
      case 'CONCILIADO':
        return 'pill--conciliado';
      case 'ABIERTO':
        return 'pill--abierto';
      case 'PENDIENTE':
        return 'pill--pendiente';
      case 'RECHAZADO':
        return 'pill--rechazado';
      default:
        return 'pill--pendiente';
    }
  }

  conciliar(): void {
    if (!this.id || !this.abono) return;
    if (!this.acceptCheck) return;
    if (this.abono.status !== 'ABIERTO' && this.abono.status !== 'PENDIENTE') {
      return;
    }

    this.conciliando = true;
    this.error = null;

    this.abonos.conciliarAbono(this.id).subscribe({
      next: () => {
        this.acceptCheck = false;
        this.load();
      },
      error: () => {
        this.error = 'No se pudo conciliar el abono.';
        this.conciliando = false;
      },
      complete: () => (this.conciliando = false),
    });
  }

  rechazar(): void {
    if (!this.id || !this.abono) return;
    if (this.abono.status !== 'ABIERTO' && this.abono.status !== 'PENDIENTE') {
      return;
    }

    this.rechazando = true;
    this.error = null;

    this.abonos.rechazarAbono(this.id).subscribe({
      next: () => {
        this.acceptCheck = false;
        this.load();
      },
      error: () => {
        this.error = 'No se pudo rechazar el abono.';
        this.rechazando = false;
      },
      complete: () => (this.rechazando = false),
    });
  }

  private loadComentarios(): void {
    if (!this.id) return;

    this.loadingComentarios = true;
    this.comentarioError = null;

    this.abonos.getComentariosAbono(this.id).subscribe({
      next: (res: any) => {
        this.comentarios = Array.isArray(res?.data) ? res.data : [];
      },
      error: () => {
        this.comentarioError = 'No se pudieron cargar los comentarios.';
      },
      complete: () => {
        this.loadingComentarios = false;
      },
    });
  }

  crearComentario(): void {
    const msg = (this.nuevoComentario || '').trim();
    if (!msg || !this.id) return;

    this.postingComentario = true;
    this.comentarioError = null;

    this.abonos.crearComentarioAbono({ idAbono: this.id, msg }).subscribe({
      next: (res: any) => {
        if (res?.status === 'success') {
          this.nuevoComentario = '';
          this.loadComentarios();
        } else {
          this.comentarioError =
            res?.msg || 'No se pudo guardar el comentario.';
        }
      },
      error: () => {
        this.comentarioError = 'No se pudo guardar el comentario.';
      },
      complete: () => {
        this.postingComentario = false;
      },
    });
  }

  getStatusTextClass(status: string): string {
    switch (status) {
      case 'CONCILIADO':
        return 'status-text--conciliado';
      case 'ABIERTO':
        return 'status-text--abierto';
      case 'PENDIENTE':
        return 'status-text--pendiente';
      case 'RECHAZADO':
        return 'status-text--rechazado';
      default:
        return 'status-text--pendiente';
    }
  }

  goBack(): void {
    this.router.navigate(['/pase/abonos-pendientes']);
  }
}
