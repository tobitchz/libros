import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  /** Controla y almacena el estado de autenticación */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  /** Observable público para suscribirse a cambios de autenticación */
  isAuthenticated = this.isAuthenticatedSubject.asObservable();

  /** Clave del JWT */
  private tokenKey = 'jwt_token';

  /** Inicializa verificando si existe un token */
  constructor() {
    this.checkToken();
  }

  /**
   * Verifica credenciales con el servidor.
   * Si son correctas, genera JWT, lo guarda y actualiza autenticación.
   * @param credentials objeto con username y password
   * @returns observable con autenticación o null
   */
  login(credentials: { username: string; password: string }): Observable<AuthResponse | null> {
    if (credentials.username === 'demo' && credentials.password === 'password') {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      this.setToken(token);
      this.isAuthenticatedSubject.next(true);
      return of({ token }).pipe(delay(1000));
    } else {
      return of(null).pipe(delay(1000));
    }
  }

  /** Remueve token del localStorage y actualiza estado de autenticación */
  logout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
  }

  /**
   *  Obtiene token de localStorage
   * @returns token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Agrega token a localStorage */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /** Remueve token de localStorage */
  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Verifica si existe un token y actualiza el estado de autenticación.
   * 'true' si el token existe, 'false' si no.
   */
  private checkToken(): void {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }
}
