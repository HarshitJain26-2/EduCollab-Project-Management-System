const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const taskInclude = {
    assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
    createdBy: { select: { id: true, name: true, email: true } },
    project: { select: { id: true, name: true, guideId: true, leaderId: true } }
};

// GET /api/tasks?project=:id
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { project: projectId } = req.query;

    const where = {};
    
    // Project-based isolation
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

    // Role-based filtering within accessible projects
    if (req.user.role === 'member') {
        where.assignedToId = userId;
    }

    const tasks = await prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tasks });
}));

// POST /api/tasks
router.post('/', protect, authorize('guide', 'leader'), asyncHandler(async (req, res) => {
    const { title, description, project, assignedTo, deadline, priority, status } = req.body;
    
    const task = await prisma.task.create({
        data: {
            title,
            description: description || '',
            projectId: project,
            assignedToId: assignedTo || null,
            deadline: deadline ? new Date(deadline) : null,
            priority: priority || 'medium',
            status: status || 'not_started',
            createdById: req.user.id
        },
        include: taskInclude
    });

    // Notify assigned member
    if (assignedTo) {
        const proj = await prisma.project.findUnique({ where: { id: project } });
        const notification = await prisma.notification.create({
            data: {
                userId: assignedTo,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `You have been assigned task "${title}" in project "${proj ? proj.name : ''}"`,
                link: `/tasks`
            }
        });

        // Real-time notification to the user
        const targetSocketId = global.userSocketMap[assignedTo];
        if (targetSocketId && global.io) {
            global.io.to(targetSocketId).emit('notification_received', notification);
        }
    }

    // Real-time project-specific broadcast
    if (global.io) {
        global.io.to(`project_${project}`).emit('task_added', { project, task });
    }

    res.status(201).json({ success: true, task });
}));

// GET /api/tasks/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: taskInclude
    });

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.json({ success: true, task });
}));

// PUT /api/tasks/:id
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const { title, description, assignedTo, deadline, priority, status } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (assignedTo !== undefined) data.assignedToId = assignedTo || null;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;

    const task = await prisma.task.update({
        where: { id: req.params.id },
        data,
        include: taskInclude
    });

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.json({ success: true, task });
}));

// PATCH /api/tasks/:id/status
router.patch('/:id/status', protect, asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: taskInclude
    });

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Members can only update tasks assigned to them
    if (req.user.role === 'member') {
        if (!task.assignedToId || task.assignedToId !== req.user.id) {
            res.status(403);
            throw new Error('You can only update tasks assigned to you');
        }
    }

    const oldStatus = task.status;
    const newStatus = req.body.status;
    
    const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: { status: newStatus },
        include: taskInclude
    });

    // Update project progress
    const allTasksCount = await prisma.task.count({ where: { projectId: task.projectId } });
    const completedTasksCount = await prisma.task.count({ 
        where: { projectId: task.projectId, status: 'completed' } 
    });
    
    const progress = allTasksCount > 0 ? Math.round((completedTasksCount / allTasksCount) * 100) : 0;
    await prisma.project.update({
        where: { id: task.projectId },
        data: { progress }
    });
    // Real-time targeted project update
    if (global.io) {
        global.io.to(`project_${task.projectId}`).emit('task_updated', { taskId: req.params.id, status: newStatus, progress, projectId: task.projectId });
    }

    // Notify guide and leader in real-time when a member updates status
    if (req.user.role === 'member' && oldStatus !== newStatus) {
        const statusLabel = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }[newStatus] || newStatus;
        const notifMsg = `${req.user.name} marked task "${task.title}" as "${statusLabel}" in project "${task.project.name}"`;
        const notifTitle = newStatus === 'completed' ? '✅ Task Completed' : '🔄 Task Status Updated';
        const notifLink = `/tasks`;

        const recipients = [task.project.guideId, task.project.leaderId].filter(id => id && id !== req.user.id);

        for (const recipientId of recipients) {
            const notification = await prisma.notification.create({
                data: {
                    userId: recipientId,
                    type: 'task_update',
                    title: notifTitle,
                    message: notifMsg,
                    link: notifLink
                }
            });

            // Real-time push via socket.io
            if (global.io && global.userSocketMap) {
                const socketId = global.userSocketMap[recipientId];
                if (socketId) {
                    global.io.to(socketId).emit('notification_received', notification);
                }
            }
        }
    }

    res.json({ success: true, task: updatedTask });
}));

// DELETE /api/tasks/:id
router.delete('/:id', protect, authorize('guide', 'leader'), asyncHandler(async (req, res) => {
    await prisma.task.delete({
        where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Task deleted' });
}));

module.exports = router;
