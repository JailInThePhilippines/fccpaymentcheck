import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Homeowner, LoginCredentials, LoginResponse } from '../interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://hoamsapi-v2ia.onrender.com/api/homeowner';
  private currentUserSubject = new BehaviorSubject<Homeowner | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedFirstname = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('accessToken');
    if (savedFirstname && accessToken) {
      const minimalUser: Partial<Homeowner> = {
        firstname: savedFirstname
      } as Homeowner;
      this.currentUserSubject.next(minimalUser as Homeowner);
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        // Store only firstname in localStorage
        localStorage.setItem('currentUser', response.user.firstname);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh-token`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getCurrentUser(): Homeowner | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  handleLogout(reason?: string): void {
    this.clearAuth();

    if (reason) {
      sessionStorage.setItem('logoutReason', reason);
    }

    window.location.href = '/auth/login';
  }
}
