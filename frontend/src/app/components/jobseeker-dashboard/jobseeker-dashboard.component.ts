import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-jobseeker-dashboard',
  standalone: true, // Make sure to add this for standalone components
  imports: [CommonModule],
  templateUrl: './jobseeker-dashboard.component.html',
  styleUrl: './jobseeker-dashboard.component.css'
})
export class JobseekerDashboardComponent implements OnInit {
  showProfileDropdown = false;
  basicInfo: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    // Pre-fetch basic info when component loads
    this.fetchBasicInfo();
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    
    // If we don't have the basic info yet, fetch it
    if (this.showProfileDropdown && !this.basicInfo) {
      this.fetchBasicInfo();
    }
  }

  fetchBasicInfo() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<any>('http://localhost:5000/api/v1/profileGET/basic', { 
      withCredentials: true 
    }).subscribe({
      next: (data) => {
        console.log('API Response:', data); // Log the response to see what's coming back
        this.basicInfo = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('API Error:', error); // Log the error for debugging
        this.errorMessage = error?.error?.message || 'Failed to load profile info';
        this.isLoading = false;
      }
    });
  }
}