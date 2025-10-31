import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = `${environment.apiUrl}/pase/catalogos`;

  constructor(private http: HttpClient) { }

  getTipoUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tipo_usuarios`);
  }

  getTipoAccesos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tipo_accesos`);
  }

  getColoniasByCP(cp: string): Observable<any> {
    const params = new HttpParams().set('cp', cp);
    return this.http.get<any>(`${this.apiUrl}/cp_colonias`, { params });
  }
}