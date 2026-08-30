import fs from 'fs';
import { DocumentModel, DocumentChunkModel, UserModel } from '../models/index.js';
import { PdfService } from './pdfService.js';
import { VectorStoreService } from './vectorStoreService.js';

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

    // 1. Create base document record
    const document = await DocumentModel.create({
      title: docTitle,
      filename: file.filename || file.originalname,
      file_url: `/uploads/${file.filename || file.originalname}`,
      category: docCategory,
      file_size: file.size || 0,
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
}
