import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { JobseekerProfileService } from '../../services/jobseeker-profile.service';
import { Skill } from '../../models/skills';
import { JobseekerProfile } from '../../models/jobseeker';
// 🆕 Import the service

@Component({
  selector: 'app-jobseeker-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobseeker-dashboard.component.html',
  styleUrl: './jobseeker-dashboard.component.css',
})
export class JobseekerDashboardComponent implements OnInit {
  showProfileDropdown = false;
  basicInfo: JobseekerProfile| null = null;
  skills: Skill[] = []; // 🆕 skills array
  isLoading = false;
  isSkillsLoading = false; // 🆕 loading for skills
  errorMessage = '';
  skillsError = ''; // 🆕 error for skills

  constructor(private jobseekerProfileService: JobseekerProfileService) {}  // 🆕 Inject the service

  ngOnInit() {
    this.fetchBasicInfo();
    this.fetchSkills(); // 🆕 fetch skills on init
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    if (this.showProfileDropdown && (!this.basicInfo || this.skills.length === 0)) {
      this.fetchBasicInfo();
      this.fetchSkills();
    }
  }

  // 🆕 Fetch basic info from the service
  fetchBasicInfo() {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobseekerProfileService.getJobSeekerBasicInfo().subscribe({
      next: (data) => {
        this.basicInfo = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load profile info';
        this.isLoading = false;
      }
    });
  }

  // 🆕 Fetch skills from the service
  fetchSkills() {
    this.isSkillsLoading = true;
    this.skillsError = '';

    this.jobseekerProfileService.getJobSeekerSkills().subscribe({
      next: (data) => {
        this.skills = data;
        this.isSkillsLoading = false;
      },
      error: (error) => {
        this.skillsError = error?.error?.message || 'Failed to load skills';
        this.isSkillsLoading = false;
      }
    });
  }
}
