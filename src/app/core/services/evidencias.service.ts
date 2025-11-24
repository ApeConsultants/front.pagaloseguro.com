import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EvidenciasService {
  private base = `${environment.apiUrl}/file/abonos`;

  constructor(private http: HttpClient, private auth: AuthService) {}

}
