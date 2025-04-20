import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/jobs';


@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  private apiUrl = 'http://localhost:5000/api/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  fetchPostedJobs(): Observable<{ jobs: Job[] }> {
    return this.http.get<{ jobs: Job[] }>(`${this.apiUrl}/employer/jobs`, {
      headers: this.getHeaders()
    });
  }
  
  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/employer/jobs`, job, { headers: this.getHeaders() });
  }
}