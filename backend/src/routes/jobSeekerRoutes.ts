// backend/routes/jobseekerProfileRoutes.js
import express from 'express';


import { protect } from '../middlwares/auth/protect';
import { getAllSkills, getSkillCategories, saveJobSeekerBasicInfo, saveJobSeekerSkills } from '../controllers/jobseekerController';
import { EmployeeGuard } from '../middlwares/auth/roleMiddleware';

const router = express.Router();

router.post('/basic', protect, EmployeeGuard, saveJobSeekerBasicInfo);
router.post('/skills', protect, EmployeeGuard, saveJobSeekerSkills);
router.get('/skill-categories', getSkillCategories); // Public route for now
router.get('/skills', getAllSkills); // Public route for now

export default router;