// src/app/services/jobseeker-profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobseekerProfile } from '../models/jobseeker';
import { SkillCategory } from '../models/skillCategory';
import { Skill } from '../models/skills';

@Injectable({
  providedIn: 'root',
})
export class JobseekerProfileService {
  private apiUrl = 'http://localhost:5000/api/v1';

  constructor(private http: HttpClient) {}

  saveJobSeekerBasicInfo(basicInfo: any): Observable<JobseekerProfile> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<JobseekerProfile>(`${this.apiUrl}/profile/basic`, basicInfo, { headers });
  }

  saveJobSeekerSkills(skillsPayload: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.apiUrl}/profile/skills`, skillsPayload, { headers });
  }

  // Add getSkillCategories method
  getSkillCategories(): Observable<SkillCategory[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<SkillCategory[]>(`${this.apiUrl}/profile/skill-categories`, { headers });
  }

  // Add getAllSkills method
  getAllSkills(): Observable<Skill[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Skill[]>(`${this.apiUrl}/profile/skills`, { headers });
  }
}