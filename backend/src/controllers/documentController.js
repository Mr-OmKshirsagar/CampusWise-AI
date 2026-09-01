import { DocumentService } from '../services/documentService.js';

export class DocumentController {
  /**
   * POST /api/admin/documents/upload
   */
  static async upload(req, res, next) {
    const isStreaming = req.query.stream === 'true' || req.headers.accept?.includes('text/event-stream');

    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const sendProgress = (payload) => {
        try {
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        } catch (_) {}
      };

      try {
        const { title, category, replaceDocumentId } = req.body;
        const file = req.file;

        sendProgress({
          stage: 'upload',
          progress: 10,
          message: 'Uploaded file payload received & validating structural format...',
        });

        const result = await DocumentService.ingestDocument({
          file,
          title,
          category,
          replaceDocumentId: replaceDocumentId || null,
          userId: req.user.id,
          onProgress: sendProgress,
        });

        sendProgress({
          stage: 'complete',
          progress: 100,
          success: true,
          message: result.isUpdate
            ? 'Vector embeddings successfully re-indexed and document updated in pgvector!'
            : 'Vector embeddings successfully indexed into pgvector database!',
          data: result,
        });
        return res.end();
      } catch (err) {
        sendProgress({
          stage: 'error',
          progress: 0,
          error: err.message || 'Failed to ingest document.',
        });
        return res.end();
      }
    }

    // Standard non-streaming fallback
    try {
      const { title, category, replaceDocumentId } = req.body;
      const file = req.file;

      const result = await DocumentService.ingestDocument({
        file,
        title,
        category,
        replaceDocumentId: replaceDocumentId || null,
        userId: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: result.isUpdate
          ? 'Document successfully updated and re-indexed into vector store.'
          : 'Document successfully ingested and indexed into vector store.',
        data: result,
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to ingest document.',
      });
    }
  }

  /**
   * GET /api/admin/documents
   */
  static async listAll(req, res, next) {
    try {
      const documents = await DocumentService.getAllDocuments();
      return res.status(200).json({
        success: true,
        data: {
          documents,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch documents.',
      });
    }
  }

  /**
   * GET /api/admin/documents/:id
   */
  static async getById(req, res, next) {
    try {
      const doc = await DocumentService.getDocumentById(req.params.id);
      return res.status(200).json({
        success: true,
        data: {
          document: doc,
        },
      });
    } catch (err) {
      const statusCode = err.statusCode || 404;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Document not found.',
      });
    }
  }

  /**
   * DELETE /api/admin/documents/:id
   */
  static async delete(req, res, next) {
    try {
      const deleted = await DocumentService.deleteDocument(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Document and associated vector chunks deleted successfully.',
        data: {
          document: deleted,
        },
      });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Failed to delete document.',
      });
    }
  }

  /**
   * GET /api/admin/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await DocumentService.getStats();
      return res.status(200).json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch statistics.',
      });
    }
  }

  /**
   * GET /api/admin/documents/:id/file
   */
  static async getFile(req, res, next) {
    try {
      const fileData = await DocumentService.getDocumentFile(req.params.id);
      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileData.filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.send(fileData.buffer);
    } catch (err) {
      const statusCode = err.statusCode || 404;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'File not found.',
      });
    }
  }
}
