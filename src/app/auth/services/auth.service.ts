import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.urlServidor;
  private http = inject(HttpClient);

  loginConNest(credenciales: any) {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, credenciales);
  }

  registerConNest(datos: any) {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, datos);
  }

  solicitarCodigoRecuperacion(email: string) {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  restablecerPassword(datos: { email: string; codigo: string; nuevaPassword: string }) {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, datos);
  }
}