import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { Role } from '../shared/models/Role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private jwtHelper = new JwtHelperService();
  private authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());
  private currentUserRole = new BehaviorSubject<Role | null>(
    this.getUserRole()
  );

  constructor(private http: HttpClient, private router: Router) {}

  login(
    email: string,
    password: string,
    rememberMe: boolean
  ): Observable<boolean> {
    return this.http
      .post<{ token: string, user: any }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          this.setSession(response.token, rememberMe);
          this.authStatus.next(true);
          // this.currentUserRole.next(this.getUserRole());
          this.currentUserRole.next(response.user.role as Role); // роль из
        }),
        map(() => true),
        catchError((error) => {
          console.error('Login error:', error);
          return of(false);
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError((error) => {
        throw new Error(error.error?.message || 'Registration failed');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    this.authStatus.next(false);
    this.currentUserRole.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  get authStatus$(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  get currentUserRole$(): Observable<Role | null> {
    return this.currentUserRole.asObservable();
  }

  hasRole(requiredRole: Role): boolean {
    const userRole = this.getUserRole();
    return userRole === requiredRole || userRole === Role.ADMIN;
  }



  private setSession(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('access_token', token);
    } else {
      sessionStorage.setItem('access_token', token);
    }
  }

  private getToken(): string | null {
    return (
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token')
    );
  }

  public getUserName(): string | null {
  const token = this.getToken();
  if (!token) return null;

  const decodedToken = this.jwtHelper.decodeToken(token);
  const fullName: string = decodedToken?.username || decodedToken?.email || 'Пользователь';

  if (!fullName || fullName.includes('@')) {
    return fullName; // если email — просто возвращаем
  }

  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return fullName;

  const lastName = parts[0];
  const initials = parts
    .slice(1)
    .map(name => name.charAt(0).toUpperCase() + '.')
    .join(' ');

  return `${lastName} ${initials}`;
}

  public getUserRole(): Role | null {
    const token = this.getToken();
    if (!token) return null;

    const decodedToken = this.jwtHelper.decodeToken(token);

    // Предполагаем, что roles — это либо строка, либо массив строк
    const roles = decodedToken?.roles || decodedToken?.role;

    if (Array.isArray(roles)) {
      // Приоритет ролей: ADMIN > MANAGER > TRAINER
      if (roles.includes(Role.ADMIN)) return Role.ADMIN;
      if (roles.includes(Role.MANAGER)) return Role.MANAGER;
      if (roles.includes(Role.TRAINER)) return Role.TRAINER;
      return null;
    }

    // Если roles — это строка
    if (typeof roles === 'string') {
      return roles as Role;
    }

    return null;
  }

}
