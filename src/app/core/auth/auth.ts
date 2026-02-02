import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, AuthResponse } from '../models/user.model';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  username: string;
  sub: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api/auth';

  // Signals
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.decodeAndSetUser(response.access_token);
        this.router.navigate(['/']);
      })
    );
  }

  register(user: Partial<User>) {
    return this.http.post<User>(`${this.apiUrl}/register`, user).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  private decodeAndSetUser(token: string) {
    try {
      const payload = jwtDecode<TokenPayload>(token);
      this._currentUser.set({
        email: payload.username,
        id: payload.sub
      } as User);
    } catch (error) {
      console.error('Invalid token', error);
      this.logout();
    }
  }
}
