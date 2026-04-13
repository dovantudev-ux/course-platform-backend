"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgress = exports.getMyEnrollments = exports.enrollCourse = void 0;
const database_1 = __importDefault(require("../config/database"));
const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        // Check if already enrolled
        const existing = await database_1.default.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: req.userId,
                    courseId,
                },
            },
        });
        if (existing) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }
        const enrollment = await database_1.default.enrollment.create({
            data: {
                userId: req.userId,
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
    }
    catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
};
exports.enrollCourse = enrollCourse;
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await database_1.default.enrollment.findMany({
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
    }
    catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
exports.getMyEnrollments = getMyEnrollments;
const updateProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { progress } = req.body;
        const enrollment = await database_1.default.enrollment.update({
            where: {
                userId_courseId: {
                    userId: req.userId,
                    courseId,
                },
            },
            data: {
                progress,
                completedAt: progress === 100 ? new Date() : null,
            },
        });
        res.json(enrollment);
    }
    catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};
exports.updateProgress = updateProgress;
