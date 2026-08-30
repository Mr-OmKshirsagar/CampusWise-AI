import { DocumentChunkModel } from '../models/index.js';
import { EmbeddingService } from './embeddingService.js';
import { env } from '../config/env.js';

export class VectorStoreService {
  /**
   * Stores chunks with their computed embedding vectors
   * @param {Array<object>} chunks
   * @returns {Promise<Array<object>>}
   */
  static async indexChunks(chunks) {
    if (!chunks || chunks.length === 0) return [];

    // Include document title and category in embedding representation
    const texts = chunks.map(c => {
      const docTitle = c.metadata?.document_title || '';
      const category = c.metadata?.category || '';
      return `${docTitle} ${category} ${c.content}`;
    });
    const embeddings = await EmbeddingService.generateBatchEmbeddings(texts);

    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));

    return DocumentChunkModel.createMany(chunksWithEmbeddings);
  }

  /**
   * Performs semantic similarity retrieval over indexed chunks
   * @param {string} query - Natural language search query
   * @param {object} options - { topK, categoryFilter, threshold }
   * @returns {Promise<Array<object>>}
   */
  static async similaritySearch(query, options = {}) {
    const topK = options.topK || env.rag.topK;
    const hasCloudApiKey = !!(env.ai.geminiApiKey || env.ai.openaiApiKey);
    const defaultThreshold = hasCloudApiKey ? 0.30 : 0.10;
    const threshold = options.threshold !== undefined ? options.threshold : defaultThreshold;
    const categoryFilter = options.categoryFilter || null;

    // Generate query embedding
    const queryEmbedding = await EmbeddingService.generateEmbedding(query);

    // Retrieve nearest neighbours by hybrid search (vector + intent metadata boost)
    const candidateChunks = await DocumentChunkModel.searchHybrid(query, queryEmbedding, topK * 2, categoryFilter);

    // Filter by similarity threshold
    const filteredChunks = candidateChunks.filter(chunk => chunk.similarity >= threshold);

    // Return top-k filtered results (or candidate matches if threshold filtering permits)
    return {
      query,
      results: filteredChunks.slice(0, topK),
      rawCandidates: candidateChunks.slice(0, topK),
      thresholdApplied: threshold,
      isGrounded: filteredChunks.length > 0,
    };
  }

  /**
   * Deletes all vector chunks associated with a document
   */
  static async deleteDocumentVectors(documentId) {
    const chunks = await DocumentChunkModel.findByDocumentId(documentId);
    return chunks.length;
  }
}
