const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, role, college, avatar } = req.body;
    
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // Hash password manually (Prisma doesn't have hooks by default)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            college: college || '',
            avatar: avatar || ''
        }
    });

    if (user) {
        const token = generateToken(user.id);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                avatar: user.avatar
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const token = generateToken(user.id);
    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            avatar: user.avatar
        }
    });
}));

// GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
}));

// POST /api/auth/forgot-password (stub)
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        res.status(404);
        throw new Error('No user found with this email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    
    await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetPasswordExpire }
    });
    
    res.json({
        success: true,
        message: 'Password reset token generated (configure email to send it)',
        resetToken
    });
}));

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { gt: new Date() }
        }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpire: null
        }
    });
    
    const token = generateToken(user.id);
    res.json({ success: true, token, message: 'Password reset successful' });
}));

// PATCH /api/auth/profile - update user profile
router.patch('/profile', protect, asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;
    
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            name: name || req.user.name,
            avatar: avatar !== undefined ? avatar : req.user.avatar
        }
    });

    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            avatar: user.avatar
        }
    });
}));

// PATCH /api/auth/change-password - change password
router.patch('/change-password', protect, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        res.status(401);
        throw new Error('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    });
    
    res.json({ success: true, message: 'Password changed successfully' });
}));

module.exports = router;
