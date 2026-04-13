import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { analyzeController } from '../controllers/analyzeController.js';

const router = Router();

router.post('/', upload.single('image'), analyzeController);

export default router;
