import express from 'express';
import { uploadFile, getFiles, getFileById, deleteFile, queryFile } from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/', protect, getFiles);
router.get('/:id', protect, getFileById);
router.delete('/:id', protect, deleteFile);
router.post('/:id/query', protect, queryFile);

export default router;
