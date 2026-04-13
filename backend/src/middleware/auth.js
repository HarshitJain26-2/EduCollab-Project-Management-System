const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // exclude password from result
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                college: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized for this action` });
        }
        next();
    };
};

module.exports = { protect, authorize };
