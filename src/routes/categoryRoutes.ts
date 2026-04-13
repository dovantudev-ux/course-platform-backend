import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorize('ADMIN'), createCategory);

export default router;
