import { Router } from 'express';
import { enrollCourse, getMyEnrollments, updateProgress } from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, enrollCourse);
router.get('/my', authenticate, getMyEnrollments);
router.put('/:courseId/progress', authenticate, updateProgress);

export default router;
