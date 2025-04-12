import { TestBed } from '@angular/core/testing';

import { JobseekerProfileService } from './jobseeker-profile.service';

describe('JobseekerProfileService', () => {
  let service: JobseekerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobseekerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
