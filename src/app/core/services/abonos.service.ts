import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type Status = 'ABIERTO' | 'CONCILIADO' | 'PENDIENTE' | 'RECHAZADO';

@Injectable({ providedIn: 'root' })
export class AbonosService {
  private base = `${environment.apiUrl}/pase/abonos`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /* ==========================================
                 ABONO + EVIDENCIA
  ========================================== */
  /** POST /pase/abonos */
  createAbonoWithEvidencia(formData: FormData): Observable<any> {
    const token = this.auth.getToken();
    const id = this.auth.getUserId();

    let headers = new HttpHeaders();

    if (token && id) {
      headers = headers.set('Authorization', `Bearer ${id} ${token}`);
    }

    return this.http.post<any>(this.base, formData, { headers });
  }

  /* ==========================================
                 CONCILIAR / RECHAZAR
  ========================================== */
  /** POST /pase/abonos/conciliar */
  conciliarAbono(idAbono: number, aceptado: boolean = true): Observable<any> {
    const token = this.auth.getToken();
    const id = this.auth.getUserId();
    let headers = new HttpHeaders();
    if (token && id) {
      headers = headers.set('Authorization', `Bearer ${id} ${token}`);
    }

    return this.http.post<any>(
      `${this.base}/conciliar`,
      { idAbono, aceptado },
      { headers }
    );
  }

  rechazarAbono(idAbono: number): Observable<any> {
    return this.conciliarAbono(idAbono, false);
  }

  /* ==========================================
                 DETALLE DE ABONO
  ========================================== */
  /** GET /pase/abonos?idAbono= */
  getAbono(idAbono: number): Observable<any> {
    const params = new HttpParams().set('idAbono', String(idAbono));
    return this.http.get<any>(this.base, {
      params,
    });
  }

  /* ==========================================
                       LISTA DE ABONOS
  ========================================== */
  getAbonosLista(filters?: {
    idUsuario?: number;
    status?: Status;
  }): Observable<any>;

  getAbonosLista(idUsuario?: number, status?: Status): Observable<any>;

  getAbonosLista(
    a?: number | { idUsuario?: number; status?: Status },
    b?: Status
  ): Observable<any> {
    let idUsuario: number | undefined;
    let status: Status | undefined;

    if (typeof a === 'number') {
      idUsuario = a;
      status = b;
    } else if (typeof a === 'object' && a !== null) {
      idUsuario = a.idUsuario;
      status = a.status;
    }

    let params = new HttpParams();
    if (idUsuario != null) params = params.set('idUsuario', String(idUsuario));
    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.base}/lista_abonos`, {
      params,
    });
  }

  /* ==========================================
                 COMENTARIOS DE ABONO
  ========================================== */
  /** GET /pase/abonos/comentarios?idAbono= */
  getComentariosAbono(idAbono: number): Observable<any> {
    const token = this.auth.getToken();
    const id = this.auth.getUserId();

    let headers = new HttpHeaders();
    if (token && id) {
      headers = headers.set('Authorization', `Bearer ${id} ${token}`);
    }

    const params = new HttpParams().set('idAbono', String(idAbono));

    return this.http.get<any>(`${this.base}/comentarios`, {
      params,
      headers,
    });
  }

  /** POST /pase/abonos/comentarios */
  crearComentarioAbono(payload: {
    idAbono: number;
    msg: string;
  }): Observable<any> {
    const token = this.auth.getToken();
    const id = this.auth.getUserId();

    let headers = new HttpHeaders();
    if (token && id) {
      headers = headers.set('Authorization', `Bearer ${id} ${token}`);
    }

    return this.http.post<any>(`${this.base}/comentarios`, payload, {
      headers,
    });
  }
}
