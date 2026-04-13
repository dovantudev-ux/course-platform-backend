import { Request, Response } from 'express';
import prisma from '../config/database';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, search, page = '1', limit = '12' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { status: 'PUBLISHED' };
    
    if (category) where.categoryId = category;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          instructor: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          category: true,
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        category: true,
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

export const createCourse = async (req: any, res: Response) => {
  try {
    const { title, description, price, categoryId, level } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        categoryId,
        level,
        instructorId: req.userId,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'DRAFT',
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

export const updateCourse = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check ownership
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.instructorId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: updates,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

export const deleteCourse = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.instructorId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.course.delete({ where: { id } });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};
