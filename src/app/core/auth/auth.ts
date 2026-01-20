import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, AuthResponse } from '../models/user.model';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api/auth'; // Proxy should be set up or full URL

  // Signals
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    // Load user/token from local storage on init if needed or rely on token presence
    const token = localStorage.getItem('access_token');
    if (token) {
      // Ideally decode token to get user info or fetch 'me'
      // For now, let's just assume logged in state if we had a proper 'me' endpoint.
      // Or simply:
      this._currentUser.set({ email: 'loadedFromToken', id: 'unknown' } as User);
    }
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        // We need to decode token or backend should return user
        // Assuming backend relies on token, we can mock user or decode.
        // Let's decode for basic info if we want, or simple state:
        this._currentUser.set({ email: credentials.email, id: 'token-user' } as User);
        this.router.navigate(['/']);
      })
    );
  }

  register(user: Partial<User>) {
    return this.http.post<User>(`${this.apiUrl}/register`, user).pipe(
      tap(() => {
        // Auto login or redirect to login?
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
}
