import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.js';
import { generateController } from '../controllers/generateController.js';

const router = Router();

router.post('/', rateLimit, generateController);

export default router;
