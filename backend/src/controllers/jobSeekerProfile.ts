import { Request, Response } from 'express';

import { UserRequest } from '../utils/types/userTypes';
import pool from '../config/dbconfig';

// Get Basic Info of Job Seeker


export const getJobSeekerBasicInfo = async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return; 
    }
  
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        `SELECT u.name, jp.profile_id, jp.phone, jp.location, jp.portfolio_link
         FROM users u
         LEFT JOIN jobseeker_profiles jp ON u.id = jp.user_id
         WHERE u.id = $1`,
        [userId]
      );
  
      if (result.rows.length === 0) {
         res.status(404).json({ message: 'Profile not found' });
         return
      }
  
      const profile = result.rows[0];
  
      res.status(200).json({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        portfolioLink: profile.portfolio_link,
        profileId: profile.profile_id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching basic job seeker info' });
    }
  };
  

  // Get Skills of Job Seeker
export const getJobSeekerSkills = async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  
    const userId = req.user.id;
  
    try {
      // Get profile_id first
      const profileRes = await pool.query(
        `SELECT profile_id FROM jobseeker_profiles WHERE user_id = $1`,
        [userId]
      );
  
      if (profileRes.rows.length === 0) {
         res.status(404).json({ message: 'Profile not found' });
         return
      }
  
      const profileId = profileRes.rows[0].profile_id;
  
      // Fetch skills
      const skillsResult = await pool.query(
        `SELECT js.skill_id, s.skill_name, sc.category_name, js.skill_level, js.years_of_experience
         FROM jobseeker_skills js
         JOIN skills s ON js.skill_id = s.skill_id
         JOIN skill_categories sc ON s.category_id = sc.category_id
         WHERE js.profile_id = $1`,
        [profileId]
      );
  
      const skills = skillsResult.rows.map(skill => ({
        skillId: skill.skill_id,
        skillName: skill.skill_name,
        categoryName: skill.category_name,
        skillLevel: skill.skill_level,
        yearsOfExperience: skill.years_of_experience,
      }));
  
      res.status(200).json({ skills });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching skills' });
    }
  };
  