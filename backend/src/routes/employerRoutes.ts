import express from 'express';
import { getPostedJobs, postJob, reviewApplications, scheduleInterview } from '../controllers/employerController';
import { protect } from '../middlwares/auth/protect';
import { EmployerGuard } from '../middlwares/auth/roleMiddleware';


const router = express.Router();

// Middleware to ensure the user is authenticated and has the employer role


// Routes
router.post('/jobs', protect, EmployerGuard, postJob); // Post a new job
router.get('/jobs',protect,EmployerGuard, getPostedJobs); // Protected route
router.get('/jobs/:job_id/applications', protect, EmployerGuard, reviewApplications); // Review applications for a job
router.put('/applications/:application_id/schedule', protect, EmployerGuard, scheduleInterview); // Schedule an interview

export default router;


