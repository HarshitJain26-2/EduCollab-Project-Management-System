const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    college: true,
    avatar: true,
    createdAt: true,
    updatedAt: true
};

// GET /api/users/profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
}));

// PUT /api/users/profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const { name, college, avatar } = req.body;
    
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, college, avatar },
        select: userSelect
    });
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    res.json({ success: true, user });
}));

// GET /api/users - list all users (with optional filters)
router.get('/', protect, asyncHandler(async (req, res) => {
    const { role, college } = req.query;
    const where = {};
    if (role) where.role = role;
    if (college) where.college = college;

    const users = await prisma.user.findMany({
        where,
        select: userSelect
    });
    res.json({ success: true, users });
}));

// GET /api/users/by-role/:role
router.get('/by-role/:role', protect, asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        where: { role: req.params.role },
        select: userSelect
    });
    res.json({ success: true, users });
}));

module.exports = router;
