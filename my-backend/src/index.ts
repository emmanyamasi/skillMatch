import { Router } from 'express';
import helloController from './controllers/helloController';
import rootController from './controllers/rootController';


const router = Router();

router.get('/', rootController); // 👈 root route

router.get('/hello', helloController);

export default router;
