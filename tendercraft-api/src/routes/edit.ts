import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.js';
import { editController } from '../controllers/editController.js';

const router = Router();

router.post('/', rateLimit, editController);

export default router;
