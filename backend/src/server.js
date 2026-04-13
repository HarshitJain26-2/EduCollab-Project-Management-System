require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;


// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

// Socket.io: real-time notifications
const userSocketMap = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId) => {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} joined with socket ${socket.id}`);

        try {
            // Find all projects the user is part of
            const projects = await prisma.project.findMany({
                where: {
                    OR: [
                        { guideId: userId },
                        { leaderId: userId },
                        { members: { some: { id: userId } } }
                    ]
                },
                select: { id: true }
            });

            // Join a room for each project
            projects.forEach(project => {
                const roomName = `project_${project.id}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined room ${roomName}`);
            });
        } catch (error) {
            console.error('Error joining project rooms:', error);
        }
    });

    socket.on('disconnect', () => {
        const userId = Object.keys(userSocketMap).find(k => userSocketMap[k] === socket.id);
        if (userId) delete userSocketMap[userId];
        console.log('User disconnected:', socket.id);
    });
});

// Export io for use in routes (event emitter)
global.io = io;
global.userSocketMap = userSocketMap;

// Connect to MongoDB and then start the server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB on startup', err);
    process.exit(1);
});

module.exports = server;
