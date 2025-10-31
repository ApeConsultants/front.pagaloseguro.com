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

  constructor(private http: HttpClient) { }

  /**
   * 
   * @param credentials
   */
login(credentials: { correo: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/public/login`, credentials).pipe(
      tap(response => {
        if (response && response.status === 'success' && response.data) {
          this.saveAuthData(
            response.data.token,
            response.data.id,
            response.data.tipo
          );
        }
      })
    );
  }

private saveAuthData(token: string, id: string | number, tipo: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.ID_KEY, String(id));
    localStorage.setItem(this.TIPO_KEY, tipo);
  }

logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ID_KEY);
    localStorage.removeItem(this.TIPO_KEY);
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

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUserId();
  }
}