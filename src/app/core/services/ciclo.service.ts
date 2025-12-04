import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CicloService {
  private base = `${environment.apiUrl}/pase/ciclos`;

  constructor(private http: HttpClient) {}

  /* GET /pase/ciclos/lista_ciclos */
  getListaCiclos(): Observable<any> {
    return this.http.get<any>(`${this.base}/lista_ciclos`);
  }

  /* GET /pase/ciclos/dataToCreate */
  getDataToCreate(): Observable<any> {
    return this.http.get<any>(`${this.base}/dataToCreate`);
  }

  /* POST /pase/ciclos  */
  createCiclo(payload: { code: string; feInicio: string }): Observable<any> {
    return this.http.post<any>(this.base, payload);
  }
}
