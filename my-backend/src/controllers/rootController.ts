import { Request, Response } from 'express';

const rootController = (req: Request, res: Response) => {
  res.send('Welcome to Skillmatch');
};

export default rootController;
