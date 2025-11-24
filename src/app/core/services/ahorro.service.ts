import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AhorroService {
  private apiUrl = `${environment.apiUrl}/pase/ahorro`;

  constructor(private http: HttpClient) {}

  getAhorro(idUsuario: string | number, ciclo: string): Observable<any> {
    const params = new HttpParams()
      .set('idUsuario', String(idUsuario))
      .set('ciclo', ciclo);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((resp) => {
        if (resp?.status !== 'success' || !resp?.data) return resp;

        const d = resp.data || {};
        const s = d.semanas || {};

        const actual = s.actual ?? null;
        const anteriores = Array.isArray(s.anteriores) ? s.anteriores : [];
        const historial = Array.isArray(s.historial) ? s.historial : [];

        return {
          ...resp,
          data: {
            ...d,
            semanas: { actual, anteriores, historial },
          },
        };
      })
    );
  }

  createAhorro(data: {
    monto_base: number;
    idUsuario: number | string;
    ciclo: string;
    aceptacion?: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}