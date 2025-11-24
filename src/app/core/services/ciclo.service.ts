import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CicloService {
  private base = `${environment.apiUrl}/pase/ciclos`;

  constructor(private http: HttpClient) {}

  getListaCiclos(): Observable<any> {
    return this.http.get<any>(`${this.base}/lista_ciclos`);
  }

  getDataToCreate(): Observable<any> {
    return this.http.get<any>(`${this.base}/dataToCreate`);
  }
}