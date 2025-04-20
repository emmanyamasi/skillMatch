export interface Job {
    job_id: number;
    title: string;
    company_name: string;
    location: string;
    description: string;
    required_skills: string[];
    created_at?: string;
    employer_id?: number;
  }