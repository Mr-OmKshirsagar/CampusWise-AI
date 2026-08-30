import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocumentModel, DocumentChunkModel, UserModel } from '../models/index.js';
import { PdfService } from './pdfService.js';
import { VectorStoreService } from './vectorStoreService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentService {
  /**
   * Processes and indexes an uploaded PDF document
   */
  static async ingestDocument({ file, title, category, userId }) {
    if (!file) {
      throw new Error('File payload is missing.');
    }

    const docTitle = (title || file.originalname.replace(/\.[^/.]+$/, '')).trim();
    const docCategory = category || 'General';

    // Read buffer for persistent storage across environments
    let fileBuffer = null;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path && fs.existsSync(file.path)) {
      fileBuffer = fs.readFileSync(file.path);
    }
    const fileBase64 = fileBuffer ? fileBuffer.toString('base64') : null;

    // 1. Create base document record with file_data
    const document = await DocumentModel.create({
      title: docTitle,
      filename: file.filename || file.originalname,
      file_url: `/uploads/${file.filename || file.originalname}`,
      file_data: fileBase64,
      category: docCategory,
      file_size: file.size || (fileBuffer ? fileBuffer.length : 0),
      chunk_count: 0,
      uploaded_by: userId,
    });

    try {
      // 2. Extract page-by-page text from PDF or Image document
      const pages = await PdfService.extractTextWithPages(file.path || file.buffer, file.mimetype);

      if (!pages || pages.length === 0) {
        throw new Error('No readable text content found in the provided document.');
      }

      // 3. Perform semantic recursive text chunking
      const rawChunks = PdfService.processDocumentChunks(pages, {
        documentId: document.id,
        title: docTitle,
        category: docCategory,
      });

      // 4. Generate embeddings and index in vector store
      const indexedChunks = await VectorStoreService.indexChunks(rawChunks);

      // 5. Update document chunk count
      await DocumentModel.updateChunkCount(document.id, indexedChunks.length);
      document.chunk_count = indexedChunks.length;

      return {
        document,
        totalPages: pages.length,
        totalChunks: indexedChunks.length,
      };
    } catch (err) {
      // Cleanup document record if parsing/indexing fails
      await DocumentModel.deleteById(document.id);
      throw err;
    }
  }

  /**
   * Retrieves all documents with metadata
   */
  static async getAllDocuments() {
    return DocumentModel.findAll();
  }

  /**
   * Retrieves document by ID
   */
  static async getDocumentById(id) {
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      const error = new Error('Document not found.');
      error.statusCode = 404;
      throw error;
    }
    const chunks = await DocumentChunkModel.findByDocumentId(id);
    return {
      ...doc,
      chunks,
    };
  }

  /**
   * Deletes document and cascading chunks
   */
  static async deleteDocument(id) {
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      const error = new Error('Document not found.');
      error.statusCode = 404;
      throw error;
    }

    // If file exists on disk, attempt removal
    if (doc.filename) {
      try {
        const filePath = doc.file_url ? `.${doc.file_url}` : null;
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('[DocumentService] Could not remove file from disk:', err.message);
      }
    }

    const deleted = await DocumentModel.deleteById(id);
    return deleted;
  }

  /**
   * Retrieves administrative overview statistics
   */
  static async getStats() {
    const docCount = await DocumentModel.countAll();
    const chunkCount = await DocumentChunkModel.countAll();
    const allDocs = await DocumentModel.findAll();

    // Group documents by category
    const categoriesMap = {};
    let totalSizeBytes = 0;

    for (const doc of allDocs) {
      categoriesMap[doc.category] = (categoriesMap[doc.category] || 0) + 1;
      totalSizeBytes += (doc.file_size || 0);
    }

    return {
      totalDocuments: docCount,
      totalChunks: chunkCount,
      totalStorageBytes: totalSizeBytes,
      categories: categoriesMap,
    };
  }

  /**
   * Retrieves binary document file from disk or PostgreSQL database
   */
  static async getDocumentFile(idOrFilename) {
    let doc = null;
    if (typeof idOrFilename === 'string' && idOrFilename.includes('-') && idOrFilename.length === 36) {
      doc = await DocumentModel.findByIdWithFile(idOrFilename);
    }
    if (!doc) {
      doc = await DocumentModel.findByFilename(idOrFilename);
    }

    const filename = doc ? doc.filename : path.basename(idOrFilename);
    const isImage = /\.(png|jpe?g|webp|gif|bmp)$/i.test(filename);
    const mimeType = isImage ? (filename.endsWith('.png') ? 'image/png' : 'image/jpeg') : 'application/pdf';

    // 1. Check local disk first
    const diskPath = path.resolve(__dirname, '../../uploads', filename);
    const samplePath = path.resolve(__dirname, '../../sample_data', filename);

    if (fs.existsSync(diskPath)) {
      return {
        buffer: fs.readFileSync(diskPath),
        filename,
        mimeType,
      };
    }
    if (fs.existsSync(samplePath)) {
      return {
        buffer: fs.readFileSync(samplePath),
        filename,
        mimeType,
      };
    }

    // 2. Fallback to database file_data
    if (doc && doc.file_data) {
      const buffer = Buffer.from(doc.file_data, 'base64');
      // Cache to local uploads dir for future fast access
      try {
        const uploadDir = path.resolve(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(diskPath, buffer);
      } catch (cacheErr) {
        console.warn('[DocumentService] Could not write cache to disk:', cacheErr.message);
      }
      return {
        buffer,
        filename,
        mimeType,
      };
    }

    const error = new Error(`File '${filename}' not found on server or database.`);
    error.statusCode = 404;
    throw error;
  }
}
