import { Request, Response } from 'express';
import { UserRequest } from '../utils/types/userTypes';
import pool from '../config/dbconfig';

// Post a job (including required skills)
// Post a job (including required skills)
export const postJob = async (req: UserRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    
    const { title, description, company_name, location, required_skills } = req.body;
    const employer_id = req.user.id;
    
    // Validate required fields
    if (!title || !description || !company_name) {
        res.status(400).json({ message: 'Title, description, and company name are required' });
        return;
    }
    
    // Validate required_skills to ensure it's an array of non-empty strings
    if (!Array.isArray(required_skills) || required_skills.length === 0 || !required_skills.every(skill => typeof skill === 'string' && skill.trim() !== '')) {
        res.status(400).json({ message: 'At least one valid skill name is required' });
        return;
    }
    
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Trim skill names to ensure no extra spaces
            const skillNames = required_skills.map((skill: string) => skill.trim());
            console.log('Trimmed skillNames:', skillNames);
            
            // Query to find skill_ids for the provided skill names
            const skillQuery = await client.query(
                'SELECT skill_id, skill_name FROM skills WHERE skill_name = ANY($1::text[])',
                [skillNames]
            );
            
            // Log query result for debugging
            console.log('Skill query result:', skillQuery.rows);
            
            // Ensure that all provided skills exist in the database
            const foundSkills = skillQuery.rows;
            if (foundSkills.length === 0) {
                res.status(400).json({ message: 'No valid skills found' });
                return;
            }
            
            // Identify missing skills that are not found in the database
            const foundSkillNames = foundSkills.map((skill: any) => skill.skill_name);
            const missingSkills = skillNames.filter((name: string) => !foundSkillNames.includes(name));
            
            if (missingSkills.length > 0) {
                res.status(400).json({ message: `Invalid skill names: ${missingSkills.join(', ')}` });
                return;
            }
            
            // Insert the job into the jobs table
            const jobResult = await client.query(
                'INSERT INTO jobs (employer_id, title, description, company_name, location) VALUES ($1, $2, $3, $4, $5) RETURNING job_id',
                [employer_id, title, description, company_name, location]
            );
            const job_id = jobResult.rows[0].job_id;
            
            // Insert job skills into the job_skills table - one by one to better track errors
            for (const skill of foundSkills) {
                console.log(`Inserting skill: ${skill.skill_name} with ID: ${skill.skill_id} for job ${job_id}`);
                await client.query(
                    'INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2)',
                    [job_id, skill.skill_id]
                );
            }
            
            // Commit the transaction
            await client.query('COMMIT');
            
            // Return success response
            res.status(201).json({ message: 'Job posted successfully', job_id });
        } catch (error) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            console.error('Error posting job:', error);
            res.status(500).json({ message: 'Error posting job' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Error posting job' });
    }
};

// Get all jobs posted by the employer
export const getPostedJobs = async (req: UserRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const employer_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT j.job_id, j.title, j.description, j.company_name, j.location, j.created_at,
                    ARRAY_AGG(s.skill_name) AS required_skills
             FROM jobs j
             LEFT JOIN job_skills js ON j.job_id = js.job_id
             LEFT JOIN skills s ON js.skill_id = s.skill_id
             WHERE j.employer_id = $1
             GROUP BY j.job_id
             ORDER BY j.created_at DESC`,
            [employer_id]
        );

        res.status(200).json({ jobs: result.rows });
    } catch (error) {
        console.error('Error fetching posted jobs:', error);
        res.status(500).json({ message: 'Error fetching posted jobs' });
    }
};





// Review applications for a specific job
export const reviewApplications = async (req: UserRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { job_id } = req.params;
    const employer_id = req.user.id;


    if(!job_id ||isNaN(parseInt(job_id))) {
        console.log('invalid job_id',job_id);
        res.status(400).json({message:'Invalid job ID'});
        return;

    }



    try {
        const result = await pool.query(
            `SELECT a.application_id, a.profile_id, a.status, a.matching_score, a.interview_date, a.interview_status,
                    jp.phone, jp.location, jp.portfolio_link, u.name, u.email
             FROM applications a
             JOIN jobseeker_profiles jp ON a.profile_id = jp.profile_id
             JOIN users u ON jp.user_id = u.id
             JOIN jobs j ON a.job_id = j.job_id
             WHERE a.job_id = $1 AND j.employer_id = $2`,
            [job_id, employer_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error reviewing applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};

// Schedule an interview for an application
export const scheduleInterview = async (req: UserRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { application_id } = req.params;
    const { interview_date, interview_status } = req.body;
    const employer_id = req.user.id;

    // Validate required fields

    if (!application_id || isNaN(parseInt(application_id))) {
        console.log('Invalid application_id:', application_id);
        res.status(400).json({ message: 'Invalid application ID' });
        return;
    }





    if (!interview_date || !interview_status) {
        res.status(400).json({ message: 'Interview date and status are required' });
        return;
    }

    const date = new Date(interview_date);
    if (isNaN(date.getTime())) {
        console.log('Invalid interview_date:', interview_date);
        res.status(400).json({ message: 'Invalid interview date format' });
        return;
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verify the application belongs to the employer's job
            const appCheck = await client.query(
                `SELECT a.application_id
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 WHERE a.application_id = $1 AND j.employer_id = $2`,
                [application_id, employer_id]
            );

            if (appCheck.rows.length === 0) {
                res.status(403).json({ message: 'Unauthorized or application not found' });
                return;
            }

            // Update the application with interview details
            await client.query(
                'UPDATE applications SET interview_date = $1, interview_status = $2, updated_at = CURRENT_TIMESTAMP WHERE application_id = $3',
                [interview_date, interview_status, application_id]
            );

            await client.query('COMMIT');
            res.status(200).json({ message: 'Interview scheduled successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Error scheduling interview' });
    }
};