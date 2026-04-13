import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const enrollCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.userId!,
          courseId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.userId!,
        courseId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { fullName: true, avatarUrl: true },
            },
            category: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;

    const enrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: req.userId!,
          courseId,
        },
      },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    res.json(enrollment);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};
