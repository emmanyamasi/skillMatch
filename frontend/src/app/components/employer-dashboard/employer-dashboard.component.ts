import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployerService } from '../../services/employer.service';
import { Job } from '../../models/jobs';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.css']
})
export class EmployerDashboardComponent implements OnInit {
  jobs: Job[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;

  newJob: Partial<Job> = {
    title: '',
    company_name: '',
    location: '',
    description: '',
    required_skills: []
  };

  skillsInput: string = '';

  constructor(private employerService: EmployerService) { }

  ngOnInit(): void {
    this.fetchPostedJobs();
  }

  fetchPostedJobs(): void {
    this.isLoading = true;
    this.employerService.fetchPostedJobs().subscribe({
      next: (data) => {
        this.jobs = data.jobs; // Extract only the jobs array
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching jobs', err);
        this.isLoading = false;
      }
    });
  }
    
  // View applications for a particular job
  viewApplications(jobId: number): void {
    console.log('View applications for job:', jobId);
    // Here you can implement routing or open a modal to display applications
  }

  openModal(): void {
    this.showModal = true;
  }
    
  closeModal(): void {
    this.resetModal();
  }

  submitJob(): void {
    const { title, company_name, location, description } = this.newJob;
    
    if (!title || !company_name || !location || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Process skills as names (strings) instead of IDs
    const skillNames = this.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');
    
    const jobPayload = {
      ...this.newJob,
      required_skills: skillNames // Now sending string array instead of number array
    };
    
    this.employerService.createJob(jobPayload).subscribe({
      next: (createdJob) => {
        console.log('Type of this.jobs:', typeof this.jobs);
        console.log('this.jobs value:', this.jobs);
        
        if (Array.isArray(this.jobs)) {
          this.jobs.push(createdJob);
        } else {
          this.jobs = [createdJob];
        }
        this.resetModal();
      },
      error: (err) => {
        console.error('Error creating job:', err);
        alert('Failed to post job.');
      }
    });
  }

  resetModal(): void {
    this.newJob = {
      title: '',
      company_name: '',
      location: '',
      description: '',
      required_skills: []
    };
    this.skillsInput = '';
    this.showModal = false;
  }
}