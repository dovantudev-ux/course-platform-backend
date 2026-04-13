"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategories = void 0;
const database_1 = __importDefault(require("../config/database"));
const getCategories = async (req, res) => {
    try {
        const categories = await database_1.default.category.findMany({
            include: {
                _count: {
                    select: { courses: true },
                },
            },
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const category = await database_1.default.category.create({
            data: { name, slug, description },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
