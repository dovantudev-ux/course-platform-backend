import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
router.put('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), deleteCourse);

export default router;
