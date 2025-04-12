// src/app/components/jobseeker-profile/jobseeker-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobseekerProfileService } from '../../services/jobseeker-profile.service';
import { CommonModule } from '@angular/common';
import { SkillCategory } from '../../models/skillCategory';
import { Skill } from '../../models/skills';
import { JobseekerProfile } from '../../models/jobseeker';

@Component({
  selector: 'app-jobseeker-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jobseeker-profile.component.html',
  styleUrls: ['./jobseeker-profile.component.css'],
})
export class JobseekerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  skillCategories: SkillCategory[] = [];
  skills: Skill[] = [];
  filteredSkills: Skill[][] = [];
  savedProfileId: number | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private profileService: JobseekerProfileService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      portfolioLink: [''],
      skills: this.fb.array([]),
    });

    // Load skill categories and skills on component initialization
    this.loadSkillCategories();
    this.loadAllSkills();
  }

  get skillsFormArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  addSkill(): void {
    const skillGroup = this.fb.group({
      category: ['', Validators.required],
      skill: ['', Validators.required],
      level: ['', Validators.required],
      years: ['', [Validators.required, Validators.min(0)]],
    });

    this.skillsFormArray.push(skillGroup);
    this.filteredSkills.push([]);
  }

  removeSkill(index: number): void {
    this.skillsFormArray.removeAt(index);
    this.filteredSkills.splice(index, 1);
  }

  loadSkillCategories(): void {
    this.profileService.getSkillCategories().subscribe({
      next: (data) => {
        this.skillCategories = data;
      },
      error: (error) => console.error('Error loading skill categories:', error),
    });
  }

  loadAllSkills(): void {
    this.profileService.getAllSkills().subscribe({
      next: (data) => {
        this.skills = data;
      },
      error: (error) => console.error('Error loading skills:', error),
    });
  }

  updateSkillOptions(index: number): void {
    const categoryId = this.skillsFormArray.at(index).get('category')?.value;
    if (categoryId) {
      this.filteredSkills[index] = this.skills.filter(skill => skill.category_id === +categoryId);
      this.skillsFormArray.at(index).get('skill')?.setValue('');
    }
  }

  onFormSubmit(): void {
    this.onSubmitBasicInfo();
  }

  onSubmitBasicInfo(): void {
    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formData = this.profileForm.value;
    const basicInfoPayload = {
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      portfolio_link: formData.portfolioLink,
    };

    this.isSubmitting = true;
    this.profileService.saveJobSeekerBasicInfo(basicInfoPayload).subscribe({
      next: (response: JobseekerProfile) => {
        this.savedProfileId = response.profileId;
        this.isSubmitting = false;
        alert('Basic information saved successfully!');
      },
      error: (error) => {
        console.error('Error saving basic info:', error);
        this.isSubmitting = false;
        alert('Error saving basic information. Please try again.');
      },
    });
  }

  onSubmitSkills(): void {
    if (!this.savedProfileId) {
      alert('Please save your basic information first!');
      return;
    }

    if (this.skillsFormArray.invalid) {
      alert('Please complete all skill information correctly');
      return;
    }

    const skillsPayload = {
      profileId: this.savedProfileId,
      skills: this.skillsFormArray.value.map((s: any) => ({
        skill_id: s.skill,
        skill_level: s.level,
        years_of_experience: s.years,
      })),
    };

    this.isSubmitting = true;
    this.profileService.saveJobSeekerSkills(skillsPayload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        alert('Skills saved successfully!');
      },
      error: (error) => {
        console.error('Error saving skills:', error);
        this.isSubmitting = false;
        alert('Error saving skills. Please try again.');
      },
    });
  }
}