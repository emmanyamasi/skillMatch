import express from 'express';
import { getJobSeekerBasicInfo, getJobSeekerSkills } from '../controllers/jobSeekerProfile';
import { protect } from '../middlwares/auth/protect';
import { EmployeeGuard } from '../middlwares/auth/roleMiddleware';


const router = express.Router();

router.get('/basic',protect,EmployeeGuard, getJobSeekerBasicInfo);
router.get('/skills', protect,EmployeeGuard, getJobSeekerSkills);

export default router;
