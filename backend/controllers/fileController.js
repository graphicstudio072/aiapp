import File from '../models/File.js';
import ActivityLog from '../models/ActivityLog.js';
import { parseDocument } from '../utils/documentParser.js';
import { generateSummary, generateDocumentAnswer } from '../utils/openai.js';
import fs from 'fs';

// @desc    Upload & summarize file
// @route   POST /api/files/upload
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { originalname, path: filePath, mimetype, size } = req.file;

    // Parse document contents
    let parsedText = '';
    try {
      parsedText = await parseDocument(filePath, originalname);
    } catch (parseError) {
      // Clean up uploaded file from disk if parsing fails
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({ success: false, error: `Failed to parse file: ${parseError.message}` });
    }

    // Generate AI Summary
    let summary = '';
    try {
      summary = await generateSummary(parsedText);
    } catch (summaryError) {
      summary = 'Summarization failed. Please try again.';
    }

    const fileDoc = await File.create({
      name: req.file.filename,
      originalName: originalname,
      path: filePath,
      mimeType: mimetype,
      size: size,
      parsedContent: parsedText,
      summary: summary,
      user: req.user._id
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'FILE_UPLOAD',
      details: `Uploaded file: ${originalname} (${(size / 1024).toFixed(1)} KB)`,
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      file: {
        id: fileDoc._id,
        originalName: fileDoc.originalName,
        mimeType: fileDoc.mimeType,
        size: fileDoc.size,
        summary: fileDoc.summary,
        parsedContent: fileDoc.parsedContent,
        createdAt: fileDoc.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all files for user
// @route   GET /api/files
// @access  Private
export const getFiles = async (req, res, next) => {
  const { search } = req.query;

  try {
    let query = { user: req.user.id };

    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    const files = await File.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      files: files.map(f => ({
        id: f._id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        summary: f.summary,
        createdAt: f.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Private
export const getFileById = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({
      success: true,
      file: {
        id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        summary: file.summary,
        parsedContent: file.parsedContent,
        createdAt: file.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user file
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Attempt to delete from disk
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn('Could not delete file from disk:', file.path);
      }
    }

    await File.deleteOne({ _id: file._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'FILE_DELETE',
      details: `Deleted file: ${file.originalName}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Query document (Document AI Q&A)
// @route   POST /api/files/:id/query
// @access  Private
export const queryFile = async (req, res, next) => {
  const { question } = req.body;

  try {
    if (!question) {
      return res.status(400).json({ success: false, error: 'Please specify a question' });
    }

    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    if (!file.parsedContent) {
      return res.status(400).json({ success: false, error: 'File does not contain readable parsed content' });
    }

    const answer = await generateDocumentAnswer(file.parsedContent, question);

    await ActivityLog.create({
      user: req.user._id,
      action: 'FILE_QUERY',
      details: `Queried file: ${file.originalName} with question: "${question.substring(0, 50)}..."`,
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      answer
    });
  } catch (error) {
    next(error);
  }
};
