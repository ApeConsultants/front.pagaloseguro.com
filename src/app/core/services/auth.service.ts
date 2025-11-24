import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'pase_token';
  private readonly ID_KEY = 'pase_id';
  private readonly TIPO_KEY = 'pase_tipo';
  private readonly NAME_KEY = 'pase_name';

  constructor(private http: HttpClient) { }

login(credentials: { correo: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/public/login`, credentials).pipe(
      tap(response => {
        if (response && response.status === 'success' && response.data) {
          this.saveAuthData(
            response.data.token,
            response.data.id,
            response.data.tipo,
            `${response.data.nombre} ${response.data.apellidos}`
          );
        }
      })
    );
  }

private saveAuthData(token: string, id: string | number, tipo: string, name: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.ID_KEY, String(id));
    localStorage.setItem(this.TIPO_KEY, tipo);
    localStorage.setItem(this.NAME_KEY, name);
  }

logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ID_KEY);
    localStorage.removeItem(this.TIPO_KEY);
    localStorage.removeItem(this.NAME_KEY);
    // this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.ID_KEY);
  }

  getUserType(): string | null {
    return localStorage.getItem(this.TIPO_KEY);
  }

  getUserName(): string | null {
    return localStorage.getItem(this.NAME_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUserId();
  }
}