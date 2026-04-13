const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const meetingInclude = {
    createdBy: { select: { id: true, name: true, email: true } },
    participants: { select: { id: true, name: true, email: true, avatar: true } },
    project: { select: { id: true, name: true } }
};

// GET /api/meetings?project=:id
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { project: projectId } = req.query;

    const where = {};
    
    if (projectId) {
        // Strict check: User must be part of the requested project
        where.projectId = projectId;
        where.project = {
            OR: [
                { guideId: userId },
                { leaderId: userId },
                { members: { some: { id: userId } } }
            ]
        };
    } else {
        // Return meetings for all projects the user is involved in
        where.project = {
            OR: [
                { guideId: userId },
                { leaderId: userId },
                { members: { some: { id: userId } } }
            ]
        };
    }

    const meetings = await prisma.meeting.findMany({
        where,
        include: meetingInclude,
        orderBy: { date: 'asc' }
    });

    res.json({ success: true, meetings });
}));

// POST /api/meetings
router.post('/', protect, authorize('guide', 'leader'), asyncHandler(async (req, res) => {
    const { project, title, date, time, agenda, meetingLink } = req.body;
    
    const proj = await prisma.project.findUnique({
        where: { id: project },
        include: { members: true }
    });

    if (!proj) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Verify user is the guide or leader of this project
    if (proj.guideId !== req.user.id && proj.leaderId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to schedule meetings for this project');
    }

    // Collect all unique participant IDs
    const participantIds = [proj.guideId, proj.leaderId, ...proj.members.map(m => m.id)].filter(Boolean);
    const uniqueParticipantIds = [...new Set(participantIds)];

    const meeting = await prisma.meeting.create({
        data: {
            projectId: project,
            title,
            date: new Date(date),
            time,
            agenda: agenda || '',
            meetingLink: meetingLink || '',
            createdById: req.user.id,
            participants: {
                connect: uniqueParticipantIds.map(id => ({ id }))
            }
        },
        include: meetingInclude
    });

    // Notify all participants except creator
    const toNotify = uniqueParticipantIds.filter(id => id !== req.user.id);
    if (toNotify.length > 0) {
        const notifications = await Promise.all(toNotify.map(userId => 
            prisma.notification.create({
                data: {
                    userId,
                    type: 'meeting_scheduled',
                    title: 'Meeting Scheduled',
                    message: `"${title}" scheduled on ${new Date(date).toLocaleDateString()} at ${time}`,
                    link: '/meetings'
                }
            })
        ));

        // Real-time targeted notification push
        if (global.io && global.userSocketMap) {
            notifications.forEach(notif => {
                const socketId = global.userSocketMap[notif.userId];
                if (socketId) {
                    global.io.to(socketId).emit('notification_received', notif);
                }
            });
        }
    }

    // Real-time project-specific broadcast for view refresh
    if (global.io) {
        global.io.to(`project_${project}`).emit('meeting_added', { project, meeting });
    }

    res.status(201).json({ success: true, meeting });
}));

// PUT /api/meetings/:id
router.put('/:id', protect, authorize('guide', 'leader'), asyncHandler(async (req, res) => {
    const { title, date, time, agenda, meetingLink } = req.body;
    
    const data = {};
    if (title !== undefined) data.title = title;
    if (date !== undefined) data.date = new Date(date);
    if (time !== undefined) data.time = time;
    if (agenda !== undefined) data.agenda = agenda;
    if (meetingLink !== undefined) data.meetingLink = meetingLink;

    const meeting = await prisma.meeting.update({
        where: { id: req.params.id },
        data,
        include: meetingInclude
    });

    if (!meeting) {
        res.status(404);
        throw new Error('Meeting not found');
    }

    res.json({ success: true, meeting });
}));

// DELETE /api/meetings/:id
router.delete('/:id', protect, authorize('guide', 'leader'), asyncHandler(async (req, res) => {
    await prisma.meeting.delete({
        where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Meeting deleted' });
}));

module.exports = router;
