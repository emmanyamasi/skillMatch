import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/v1/auth'; // Base API URL

  constructor(private http: HttpClient) {}

  register(user: { name: string; email: string; password: string; role_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { withCredentials: true });
  }

  login(user: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, user, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Full login response:', response); // Debugging step
  
        
  if (response.access_token && response.access_token.accessToken) {
    localStorage.setItem('token', response.access_token.accessToken); // Store only the access token
    localStorage.setItem('refreshToken', response.access_token.refreshToken); // Store refresh token separately
    localStorage.setItem('user_id', response.user.id.toString()); // Store user_id
    localStorage.setItem('role_id', response.user.role_id.toString()); // Store role_id
  } else {
          console.error('No valid access_token found in the response. Check backend.');
        }
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role_id');

    // Optionally, call backend logout to clear cookies (if applicable)
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => console.log('User logged out successfully'),
      error: (error) => console.error('Logout error:', error),
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number {
    return parseInt(localStorage.getItem('user_id') || '0', 10);
  }

  getRoleId(): number {
    return parseInt(localStorage.getItem('role_id') || '0', 10);
  }
}
