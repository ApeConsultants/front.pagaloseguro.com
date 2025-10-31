import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/pase/usuario`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lista_usuarios`);
  }

  getUserById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?idUsuario=${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  updateUser(userData: any): Observable<any> {
    return this.http.patch<any>(this.apiUrl, userData);
  }

  deleteUser(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}?idUsuario=${id}`);
  }
}