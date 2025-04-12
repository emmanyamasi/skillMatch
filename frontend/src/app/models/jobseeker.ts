// src/app/models/jobseeker-profile.ts
export interface JobseekerProfile {
    profileId: number;
    userId: number;
    name: string;
    phone: string;
    location: string;
    portfolio_link?: string;
  }