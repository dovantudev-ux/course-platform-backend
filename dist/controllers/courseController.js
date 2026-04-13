"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const database_1 = __importDefault(require("../config/database"));
const getCourses = async (req, res) => {
    try {
        const { category, level, search, page = '1', limit = '12' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { status: 'PUBLISHED' };
        if (category)
            where.categoryId = category;
        if (level)
            where.level = level;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [courses, total] = await Promise.all([
            database_1.default.course.findMany({
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
            database_1.default.course.count({ where }),
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
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
exports.getCourses = getCourses;
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await database_1.default.course.findUnique({
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
    }
    catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};
exports.getCourseById = getCourseById;
const createCourse = async (req, res) => {
    try {
        const { title, description, price, categoryId, level } = req.body;
        const course = await database_1.default.course.create({
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
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Check ownership
        const course = await database_1.default.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructorId !== req.userId && req.userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const updated = await database_1.default.course.update({
            where: { id },
            data: updates,
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await database_1.default.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructorId !== req.userId && req.userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await database_1.default.course.delete({ where: { id } });
        res.json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};
exports.deleteCourse = deleteCourse;
