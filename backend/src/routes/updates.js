const express = require('express');
const router = express.Router();
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/updates'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const updateInclude = {
    member: { select: { id: true, name: true, email: true, avatar: true } },
    comments: { 
        include: { author: { select: { id: true, name: true, email: true, avatar: true, role: true } } },
        orderBy: { createdAt: 'asc' }
    },
    files: true,
    project: { select: { id: true, name: true } }
};

// GET /api/updates?project=:id
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { project: projectId } = req.query;

    const where = {};

    // Group-based isolation
    const projectFilter = {
        OR: [
            { guideId: userId },
            { leaderId: userId },
            { members: { some: { id: userId } } }
        ]
    };

    if (projectId) {
        where.projectId = projectId;
        where.project = projectFilter;
    } else {
        where.project = projectFilter;
    }

    if (req.user.role === 'member') {
        where.memberId = userId;
    }

    const updates = await prisma.dailyUpdate.findMany({
        where,
        include: updateInclude,
        orderBy: { date: 'desc' }
    });

    res.json({ success: true, updates });
}));

// POST /api/updates
router.post('/', protect, upload.array('files', 5), asyncHandler(async (req, res) => {
    const { project, date, workCompleted, issuesFaced, nextSteps } = req.body;
    
    const update = await prisma.dailyUpdate.create({
        data: {
            projectId: project,
            memberId: req.user.id,
            date: date ? new Date(date) : new Date(),
            workCompleted,
            issuesFaced: issuesFaced || '',
            nextSteps: nextSteps || '',
            files: {
                create: (req.files || []).map(f => ({
                    filename: f.originalname,
                    path: f.path,
                    mimetype: f.mimetype
                }))
            }
        },
        include: updateInclude
    });

    // Notify guide and leader
    const proj = await prisma.project.findUnique({ where: { id: project } });
    if (proj) {
        const notifyUsers = [proj.guideId, proj.leaderId].filter(id => id && id !== req.user.id);
        for (const userId of notifyUsers) {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type: 'daily_update',
                    title: 'New Daily Update Submitted',
                    message: `${req.user.name} submitted a daily update for "${proj.name}"`,
                    link: `/updates`
                }
            });

            // Real-time push
            const socketId = global.userSocketMap[userId];
            if (socketId && global.io) {
                global.io.to(socketId).emit('notification_received', notification);
            }
        }
    }

    // Real-time project-specific update added event
    if (global.io) {
        global.io.to(`project_${project}`).emit('update_added', { update });
    }

    res.status(201).json({ success: true, update });
}));

// POST /api/updates/:id/comment
router.post('/:id/comment', protect, asyncHandler(async (req, res) => {
    const update = await prisma.dailyUpdate.findUnique({
        where: { id: req.params.id }
    });
    
    if (!update) {
        res.status(404);
        throw new Error('Update not found');
    }

    const comment = await prisma.comment.create({
        data: {
            updateId: req.params.id,
            authorId: req.user.id,
            text: req.body.text
        }
    });

    await prisma.notification.create({
        data: {
            userId: update.memberId,
            type: 'guide_comment',
            title: 'New Comment on Your Update',
            message: `${req.user.name} commented on your daily update`,
            link: `/updates`
        }
    });

    const populatedUpdate = await prisma.dailyUpdate.findUnique({
        where: { id: req.params.id },
        include: updateInclude
    });

    // Notify the member if someone else commented
    if (update.memberId !== req.user.id) {
        const notification = await prisma.notification.create({
            data: {
                userId: update.memberId,
                type: 'comment_added',
                title: 'New Comment on Your Update',
                message: `${req.user.name} commented on your daily update`,
                link: '/updates'
            }
        });

        const socketId = global.userSocketMap[update.memberId];
        if (socketId && global.io) {
            global.io.to(socketId).emit('notification_received', notification);
        }
    }

    // Real-time project-specific comment sync
    if (global.io) {
        global.io.to(`project_${update.projectId}`).emit('comment_added', { updateId: req.params.id, comment });
    }

    res.json({ success: true, update: populatedUpdate });
}));

// PATCH /api/updates/:id/status
router.patch('/:id/status', protect, authorize('guide', 'leader'), asyncHandler(async (req, res) => {
    const update = await prisma.dailyUpdate.findUnique({
        where: { id: req.params.id }
    });

    if (!update) {
        res.status(404);
        throw new Error('Update not found');
    }

    const updatedUpdate = await prisma.dailyUpdate.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
        include: updateInclude
    });

    const type = req.body.status === 'approved' ? 'update_approved' : 'update_revision';
    const title = req.body.status === 'approved' ? 'Update Approved' : 'Revision Requested on Your Update';
    const message = req.body.status === 'approved'
        ? `Your daily update has been approved by ${req.user.name}`
        : `${req.user.name} requested a revision on your daily update`;

    const notification = await prisma.notification.create({
        data: {
            userId: update.memberId,
            type,
            title,
            message,
            link: '/updates'
        }
    });

    // Real-time push via socket.io
    if (global.io && global.userSocketMap) {
        const socketId = global.userSocketMap[update.memberId];
        if (socketId) {
            global.io.to(socketId).emit('notification_received', notification);
        }
        // Broadcast that an update was reviewed (only to project members)
        global.io.to(`project_${update.projectId}`).emit('update_status_changed', { updateId: req.params.id, status: req.body.status });
    }

    res.json({ success: true, update: updatedUpdate });
}));

module.exports = router;
