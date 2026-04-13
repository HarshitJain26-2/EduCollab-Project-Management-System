const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const projectInclude = {
    guide: { select: { id: true, name: true, email: true, avatar: true } },
    leader: { select: { id: true, name: true, email: true, avatar: true } },
    members: { select: { id: true, name: true, email: true, avatar: true, role: true } },
    driveLinks: { include: { addedBy: { select: { id: true, name: true } } } }
};

// GET /api/projects - list projects based on role
router.get('/', protect, asyncHandler(async (req, res) => {
    let projects;
    if (req.user.role === 'guide') {
        projects = await prisma.project.findMany({
            where: { guideId: req.user.id },
            include: projectInclude
        });
    } else if (req.user.role === 'leader') {
        projects = await prisma.project.findMany({
            where: { leaderId: req.user.id },
            include: projectInclude
        });
    } else {
        projects = await prisma.project.findMany({
            where: { members: { some: { id: req.user.id } } },
            include: projectInclude
        });
    }
    res.json({ success: true, projects });
}));

// POST /api/projects - guide creates
router.post('/', protect, authorize('guide'), asyncHandler(async (req, res) => {
    const { name, description, leader, members, timeline, status, githubLink } = req.body;
    
    const project = await prisma.project.create({
        data: {
            name,
            description: description || '',
            guideId: req.user.id,
            leaderId: leader || null,
            members: {
                connect: (members || []).map(id => ({ id }))
            },
            startDate: timeline?.startDate ? new Date(timeline.startDate) : null,
            endDate: timeline?.endDate ? new Date(timeline.endDate) : null,
            status: status || 'planning',
            githubLink: githubLink || '',
        },
        include: projectInclude
    });

    // Notify leader and members
    if (leader) {
        const notification = await prisma.notification.create({
            data: {
                userId: leader,
                type: 'project_added',
                title: 'Added as Project Leader',
                message: `You have been assigned as leader of project "${name}"`,
                link: `/projects/${project.id}`
            }
        });

        // Real-time push
        const socketId = global.userSocketMap[leader];
        if (socketId && global.io) {
            global.io.to(socketId).emit('notification_received', notification);
        }
    }

    if (members && members.length > 0) {
        for (const mId of members) {
            const notification = await prisma.notification.create({
                data: {
                    userId: mId,
                    type: 'project_added',
                    title: 'Added to Project',
                    message: `You have been added to project "${name}"`,
                    link: `/projects/${project.id}`
                }
            });

            // Real-time push
            const socketId = global.userSocketMap[mId];
            if (socketId && global.io) {
                global.io.to(socketId).emit('notification_received', notification);
            }
        }
    }

    res.status(201).json({ success: true, project });
}));

// GET /api/projects/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: projectInclude
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.json({ success: true, project });
}));

// PUT /api/projects/:id
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const existingProject = await prisma.project.findUnique({
        where: { id: req.params.id }
    });

    if (!existingProject) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isGuide = req.user.role === 'guide' && String(existingProject.guideId) === String(req.user.id);
    const isLeader = req.user.role === 'leader' && String(existingProject.leaderId) === String(req.user.id);

    if (!isGuide && !isLeader) {
        res.status(403);
        throw new Error('Not authorized to update this project');
    }

    const { name, description, leader, members, timeline, status, githubLink, progress } = req.body;

    // Only guides can change the group leader or member list
    if (isLeader && (leader !== undefined || members !== undefined || name !== undefined)) {
        res.status(403);
        throw new Error('Only the Guide can modify the project team or name');
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (leader !== undefined && isGuide) data.leaderId = leader || null; // Connect leader
    if (status !== undefined) data.status = status;
    if (githubLink !== undefined) data.githubLink = githubLink;
    if (progress !== undefined) data.progress = parseInt(progress);
    
    if (timeline) {
        if (timeline.startDate) data.startDate = new Date(timeline.startDate);
        if (timeline.endDate) data.endDate = new Date(timeline.endDate);
    }

    if (members && isGuide) {
        data.members = {
            set: members.map(id => ({ id }))
        };
    }

    const updatedProject = await prisma.project.update({
        where: { id: req.params.id },
        data,
        include: projectInclude
    });

    // Real-time synchronization
    if (global.io) {
        global.io.emit('project_updated', { projectId: req.params.id, project: updatedProject });
    }

    res.json({ success: true, project: updatedProject });
}));

// DELETE /api/projects/:id
router.delete('/:id', protect, authorize('guide'), asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id }
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.guideId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to delete this project');
    }

    await prisma.project.delete({
        where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Project deleted' });
}));

// POST /api/projects/:id/drive-links
router.post('/:id/drive-links', protect, asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id }
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const link = await prisma.driveLink.create({
        data: {
            ...req.body,
            projectId: req.params.id,
            addedById: req.user.id
        }
    });

    const driveLinks = await prisma.driveLink.findMany({
        where: { projectId: req.params.id }
    });

    res.json({ success: true, driveLinks });
}));

// DELETE /api/projects/:id/drive-links/:linkId
router.delete('/:id/drive-links/:linkId', protect, asyncHandler(async (req, res) => {
    await prisma.driveLink.delete({
        where: { id: req.params.linkId }
    });

    const driveLinks = await prisma.driveLink.findMany({
        where: { projectId: req.params.id }
    });
    
    res.json({ success: true, driveLinks });
}));

module.exports = router;
