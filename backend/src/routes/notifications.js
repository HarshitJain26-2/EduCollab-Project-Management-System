const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// GET /api/notifications - get user notifications
router.get('/', protect, asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    
    const unreadCount = await prisma.notification.count({
        where: { userId: req.user.id, read: false }
    });
    
    res.json({ success: true, notifications, unreadCount });
}));

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
    const notification = await prisma.notification.update({
        where: { id: req.params.id },
        data: { read: true }
    });
    
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }
    
    res.json({ success: true });
}));

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
        where: { userId: req.user.id, read: false },
        data: { read: true }
    });
    
    res.json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
