import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SemanasService {
  private base = `${environment.apiUrl}/pase/semanas`;

  constructor(private http: HttpClient) {}

  getSemanasAdeudo(idUsuario: number | string, ciclo: string): Observable<any> {
    const params = new HttpParams()
      .set('idUsuario', String(idUsuario))
      .set('ciclo', ciclo);
    return this.http.get<any>(`${this.base}/adeudo`, { params });
  }
}