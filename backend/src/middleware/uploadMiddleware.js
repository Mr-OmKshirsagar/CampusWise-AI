import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

// Ensure upload directory exists
if (!fs.existsSync(env.upload.uploadDir)) {
  fs.mkdirSync(env.upload.uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.upload.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

// File filter accepting application/pdf and images (PNG, JPG, JPEG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

  const isMimeAllowed = allowedMimes.includes(file.mimetype.toLowerCase());
  const isExtAllowed = allowedExts.includes(path.extname(file.originalname).toLowerCase());

  if (isMimeAllowed || isExtAllowed) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only official PDFs, scanned documents, and image files (PNG, JPG, JPEG, WEBP) are accepted.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Multer upload instance
export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeBytes, // 15MB limit
  },
});

// Wrapper to handle Multer specific errors with clean JSON responses
export function handleUpload(req, res, next) {
  const uploadSingle = uploadPdf.single('file');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `File size exceeds the maximum allowed limit of ${env.upload.maxFileSizeBytes / (1024 * 1024)}MB.`,
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message || 'File upload failed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided in upload payload (expected form-data field "file").',
      });
    }

    next();
  });
}
