const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `uploads/projects/${req.query.project || 'general'}/${req.body.category || 'other'}`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|txt|js|py|java|cpp|ts|json|csv/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        if (ext) cb(null, true);
        else cb(new Error('File type not allowed'));
    }
});

// POST /api/files/upload
router.post('/upload', protect, upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }
    
    res.json({
        success: true,
        file: {
            filename: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            category: req.body.category || 'other',
            uploadedBy: req.user.id,
        }
    });
}));

// GET /api/files - list files for a project
router.get('/', protect, asyncHandler(async (req, res) => {
    const projectId = req.query.project || 'general';
    const dir = `uploads/projects/${projectId}`;
    
    if (!fs.existsSync(dir)) {
        return res.json({ success: true, files: {} });
    }
    
    const categories = fs.readdirSync(dir);
    const result = {};
    
    categories.forEach(cat => {
        const catPath = path.join(dir, cat);
        if (fs.statSync(catPath).isDirectory()) {
            result[cat] = fs.readdirSync(catPath).map(f => {
                const filePath = path.join(catPath, f);
                return {
                    name: f,
                    path: `/uploads/projects/${projectId}/${cat}/${f}`,
                    size: fs.statSync(filePath).size,
                };
            });
        }
    });
    
    res.json({ success: true, files: result });
}));

module.exports = router;
