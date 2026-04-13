import { Router } from 'express';
import {
  renderController,
  renderImageController,
} from '../controllers/renderController.js';

const router = Router();

router.get('/:id', renderController);
router.get('/:id/image', renderImageController);

export default router;
