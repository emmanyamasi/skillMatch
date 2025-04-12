// backend/controllers/jobSeekerController.js
import { Request, Response } from 'express';

import { UserRequest } from '../utils/types/userTypes';
import pool from '../config/dbconfig';

// Save Jobseeker Basic Info
export const saveJobSeekerBasicInfo = async (req: UserRequest, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  const { name, phone, location, portfolio_link } = req.body;
  const userId = req.user.id;

  try {
    // Update user name in users table
    await pool.query(`UPDATE users SET name = $1 WHERE id = $2`, [name, userId]);

    // Check if profile already exists
    const existingProfile = await pool.query(
      `SELECT * FROM jobseeker_profiles WHERE user_id = $1`,
      [userId]
    );

    let profileId;
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      const result = await pool.query(
        `UPDATE jobseeker_profiles 
         SET phone = $1, location = $2, portfolio_link = $3 
         WHERE user_id = $4 
         RETURNING profile_id`,
        [phone, location, portfolio_link, userId]
      );
      profileId = result.rows[0].profile_id;
    } else {
      // Insert new profile
      const result = await pool.query(
        `INSERT INTO jobseeker_profiles (user_id, phone, location, portfolio_link)
         VALUES ($1, $2, $3, $4)
         RETURNING profile_id`,
        [userId, phone, location, portfolio_link]
      );
      profileId = result.rows[0].profile_id;
    }

    res.status(201).json({ message: 'Basic info saved', profileId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving basic info' });
  }
};

// Save Jobseeker Skills
export const saveJobSeekerSkills = async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  const { profileId, skills } = req.body;

  try {
    // Verify the profile belongs to the user
    const profileCheck = await pool.query(
      `SELECT * FROM jobseeker_profiles WHERE profile_id = $1 AND user_id = $2`,
      [profileId, req.user.id]
    );
    if (profileCheck.rows.length === 0) {
       res.status(403).json({ message: 'Profile does not belong to this user' });
       return
    }

    // Delete existing skills for this profile (to avoid duplicates)
    await pool.query(`DELETE FROM jobseeker_skills WHERE profile_id = $1`, [profileId]);

    // Insert new skills
    const skillInsertQueries = skills.map((skill: any) =>
      pool.query(
        `INSERT INTO jobseeker_skills (profile_id, skill_id, skill_level, years_of_experience)
         VALUES ($1, $2, $3, $4)`,
        [profileId, skill.skill_id, skill.skill_level, skill.years_of_experience]
      )
    );

    await Promise.all(skillInsertQueries);

    res.status(201).json({ message: 'Skills saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving skills' });
  }
};

// Get Skill Categories
export const getSkillCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM skill_categories`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching skill categories' });
  }
};

// Get All Skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.skill_id, s.skill_name, s.category_id, sc.category_name 
       FROM skills s 
       JOIN skill_categories sc ON s.category_id = sc.category_id`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching skills' });
  }
};