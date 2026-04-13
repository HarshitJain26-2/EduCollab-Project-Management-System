const prisma = require('../lib/prisma');

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ SQLite Connected via Prisma');
    } catch (error) {
        console.error('❌ Prisma connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
