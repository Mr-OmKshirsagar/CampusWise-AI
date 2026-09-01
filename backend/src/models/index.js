import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getDbAdapter,
  getMemoryStore,
  persistLocalStore,
  getPgPool,
  cosineSimilarity,
} from '../config/db.js';

// Remove null bytes (\u0000 / 0x00) and unsupported UTF-8 control characters that PostgreSQL rejects
export function sanitizeUtf8(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\u0000/g, '').replace(/\0/g, '');
}

export function sanitizeMetadata(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeMetadata);
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const cleanKey = sanitizeUtf8(k);
    result[cleanKey] = typeof v === 'string' ? sanitizeUtf8(v) : sanitizeMetadata(v);
  }
  return result;
}


// ==========================================
// 1. User Model
// ==========================================
export const UserModel = {
  async findByEmail(email) {
    const adapter = getDbAdapter();
    const normalizedEmail = email.toLowerCase().trim();

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT id, name, email, password, role, created_at FROM users WHERE LOWER(email) = $1 LIMIT 1',
        [normalizedEmail]
      );
      return res.rows[0] || null;
    }

    const store = getMemoryStore();
    return store.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async findById(id) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
        [id]
      );
      return res.rows[0] || null;
    }

    const store = getMemoryStore();
    const user = store.users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async create({ name, email, password, role = 'student' }) {
    const adapter = getDbAdapter();
    const normalizedEmail = email.toLowerCase().trim();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        `INSERT INTO users (id, name, email, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, created_at`,
        [id, name.trim(), normalizedEmail, password, role, createdAt]
      );
      return res.rows[0];
    }

    const store = getMemoryStore();
    const newUser = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      created_at: createdAt,
    };
    store.users.push(newUser);
    persistLocalStore();

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async listAll() {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
      return res.rows;
    }
    const store = getMemoryStore();
    return store.users.map(({ password, ...u }) => u);
  },
};

// ==========================================
// 2. Document Model
// ==========================================
export const DocumentModel = {
  async create({ title, filename, file_url, file_data = null, category = 'General', file_size = 0, chunk_count = 0, uploaded_by }) {
    const adapter = getDbAdapter();
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const cleanTitle = sanitizeUtf8(title || 'Untitled');
    const cleanFilename = sanitizeUtf8(filename || 'document');
    const cleanFileUrl = sanitizeUtf8(file_url || '');
    const cleanCategory = sanitizeUtf8(category || 'General');

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        `INSERT INTO documents (id, title, filename, file_url, file_data, category, file_size, chunk_count, uploaded_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, title, filename, file_url, category, file_size, chunk_count, uploaded_by, created_at`,
        [id, cleanTitle, cleanFilename, cleanFileUrl, file_data, cleanCategory, file_size, chunk_count, uploaded_by, createdAt]
      );
      return res.rows[0];
    }

    const store = getMemoryStore();
    const newDoc = {
      id,
      title: cleanTitle,
      filename: cleanFilename,
      file_url: cleanFileUrl,
      file_data,
      category: cleanCategory,
      file_size,
      chunk_count,
      uploaded_by,
      created_at: createdAt,
    };
    store.documents.push(newDoc);
    persistLocalStore();
    const { file_data: _, ...savedMeta } = newDoc;
    return savedMeta;
  },

  async findAll() {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        `SELECT d.id, d.title, d.filename, d.file_url, d.category, d.file_size, d.chunk_count, d.uploaded_by, d.created_at, u.name as uploader_name
         FROM documents d
         LEFT JOIN users u ON u.id = d.uploaded_by
         ORDER BY d.created_at DESC`
      );
      return res.rows;
    }
    const store = getMemoryStore();
    return store.documents.map(doc => {
      const uploader = store.users.find(u => u.id === doc.uploaded_by);
      const { file_data, ...docMeta } = doc;
      return {
        ...docMeta,
        uploader_name: uploader ? uploader.name : 'Admin',
      };
    });
  },

  async findById(id) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT id, title, filename, file_url, category, file_size, chunk_count, uploaded_by, created_at FROM documents WHERE id = $1',
        [id]
      );
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    const doc = store.documents.find(d => d.id === id);
    if (!doc) return null;
    const { file_data, ...docMeta } = doc;
    return docMeta;
  },

  async findByFilename(filename) {
    const adapter = getDbAdapter();
    const cleanFilename = path.basename(filename || '');
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT id, title, filename, file_url, file_data, category, file_size FROM documents WHERE filename = $1 OR file_url LIKE $2 LIMIT 1',
        [cleanFilename, `%${cleanFilename}`]
      );
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    return store.documents.find(d => d.filename === cleanFilename || (d.file_url && d.file_url.includes(cleanFilename))) || null;
  },

  async findByIdWithFile(id) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    return store.documents.find(d => d.id === id) || null;
  },

  async deleteById(id) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    const docIndex = store.documents.findIndex(d => d.id === id);
    if (docIndex === -1) return null;
    const [deletedDoc] = store.documents.splice(docIndex, 1);
    // Cascade delete chunks
    store.document_chunks = store.document_chunks.filter(c => c.document_id !== id);
    persistLocalStore();
    return deletedDoc;
  },

  async update({ id, title, filename, file_url, file_data = null, category = 'General', file_size = 0, chunk_count = 0 }) {
    const adapter = getDbAdapter();
    const cleanTitle = sanitizeUtf8(title || 'Untitled');
    const cleanFilename = sanitizeUtf8(filename || 'document');
    const cleanFileUrl = sanitizeUtf8(file_url || '');
    const cleanCategory = sanitizeUtf8(category || 'General');

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        `UPDATE documents
         SET title = $1, filename = $2, file_url = $3, file_data = COALESCE($4, file_data), category = $5, file_size = $6, chunk_count = $7
         WHERE id = $8
         RETURNING id, title, filename, file_url, category, file_size, chunk_count, uploaded_by, created_at`,
        [cleanTitle, cleanFilename, cleanFileUrl, file_data, cleanCategory, file_size, chunk_count, id]
      );
      return res.rows[0] || null;
    }

    const store = getMemoryStore();
    const doc = store.documents.find(d => d.id === id);
    if (!doc) return null;
    doc.title = cleanTitle;
    doc.filename = cleanFilename;
    doc.file_url = cleanFileUrl;
    if (file_data !== null) doc.file_data = file_data;
    doc.category = cleanCategory;
    doc.file_size = file_size;
    doc.chunk_count = chunk_count;
    persistLocalStore();
    const { file_data: _, ...savedMeta } = doc;
    return savedMeta;
  },

  async updateChunkCount(id, count) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      await pool.query('UPDATE documents SET chunk_count = $1 WHERE id = $2', [count, id]);
      return;
    }
    const store = getMemoryStore();
    const doc = store.documents.find(d => d.id === id);
    if (doc) {
      doc.chunk_count = count;
      persistLocalStore();
    }
  },

  async countAll() {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT COUNT(*) as count FROM documents');
      return parseInt(res.rows[0].count, 10);
    }
    const store = getMemoryStore();
    return store.documents.length;
  },
};

// ==========================================
// 3. Document Chunk Model (Vector Store)
// ==========================================
export const DocumentChunkModel = {
  async createMany(chunks) {
    if (!chunks || chunks.length === 0) return [];
    const adapter = getDbAdapter();

    const preparedChunks = chunks.map(c => ({
      id: c.id || uuidv4(),
      document_id: c.document_id,
      content: sanitizeUtf8(c.content || ''),
      chunk_index: c.chunk_index,
      page_number: c.page_number || 1,
      embedding: c.embedding || [],
      metadata: sanitizeMetadata(c.metadata || {}),
      created_at: new Date().toISOString(),
    }));

    if (adapter === 'postgres') {
      const pool = getPgPool();
      for (const chunk of preparedChunks) {
        await pool.query(
          `INSERT INTO document_chunks (id, document_id, content, chunk_index, page_number, embedding, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            chunk.id,
            chunk.document_id,
            chunk.content,
            chunk.chunk_index,
            chunk.page_number,
            chunk.embedding.length > 0 ? `[${chunk.embedding.join(',')}]` : null,
            JSON.stringify(chunk.metadata),
            chunk.created_at,
          ]
        );
      }
      return preparedChunks;
    }

    const store = getMemoryStore();
    store.document_chunks.push(...preparedChunks);
    persistLocalStore();
    return preparedChunks;
  },

  async findByDocumentId(documentId) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT id, document_id, content, chunk_index, page_number, metadata FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC',
        [documentId]
      );
      return res.rows;
    }
    const store = getMemoryStore();
    return store.document_chunks
      .filter(c => c.document_id === documentId)
      .sort((a, b) => a.chunk_index - b.chunk_index);
  },

  async deleteByDocumentId(documentId) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      await pool.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
      return;
    }
    const store = getMemoryStore();
    store.document_chunks = store.document_chunks.filter(c => c.document_id !== documentId);
    persistLocalStore();
  },

  async searchSimilar(queryEmbedding, topK = 4, categoryFilter = null) {
    const adapter = getDbAdapter();

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const vectorStr = `[${queryEmbedding.join(',')}]`;
      const res = await pool.query(
        `SELECT
           dc.id,
           dc.document_id,
           dc.content,
           dc.chunk_index,
           dc.page_number,
           dc.metadata,
           d.title as document_title,
           d.category as document_category,
           1 - (dc.embedding <=> $1::vector) AS similarity
         FROM document_chunks dc
         JOIN documents d ON d.id = dc.document_id
         WHERE ($3::text IS NULL OR d.category = $3)
         ORDER BY dc.embedding <=> $1::vector ASC
         LIMIT $2`,
        [vectorStr, topK, categoryFilter || null]
      );
      return res.rows.map(r => ({
        ...r,
        similarity: parseFloat(r.similarity),
      }));
    }

    // Memory / Local similarity calculation
    const store = getMemoryStore();
    const scoredChunks = [];

    for (const chunk of store.document_chunks) {
      const parentDoc = store.documents.find(d => d.id === chunk.document_id);
      if (!parentDoc) continue;

      if (categoryFilter && parentDoc.category !== categoryFilter) {
        continue;
      }

      if (!chunk.embedding || chunk.embedding.length === 0) continue;

      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      scoredChunks.push({
        id: chunk.id,
        document_id: chunk.document_id,
        document_title: parentDoc.title,
        document_category: parentDoc.category,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        page_number: chunk.page_number,
        metadata: chunk.metadata,
        similarity: score,
      });
    }

    return scoredChunks.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  },

  async searchHybrid(queryText, queryEmbedding, topK = 6, categoryFilter = null) {
    const adapter = getDbAdapter();
    const queryLower = (queryText || '').toLowerCase();

    const isPublisherQuery = /(which\s*college|which\s*university|who\s*published|published\s*by|department\s*of|institute\s*name|college\s*name|university\s*name|publisher|author)/i.test(queryLower);
    const isElectiveQuery = /(program\s*elective|elective|electives|pec|pe\s*-|tracks?)/i.test(queryLower);
    const isCurriculumQuery = /(what\s*are\s*the\s*subjects|all\s*subjects|list\s*of\s*subjects|curriculum|teaching\s*scheme|course\s*structure)/i.test(queryLower);

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const vectorStr = `[${queryEmbedding.join(',')}]`;

      const res = await pool.query(
        `SELECT
           dc.id,
           dc.document_id,
           dc.content,
           dc.chunk_index,
           dc.page_number,
           dc.metadata,
           d.title as document_title,
           d.category as document_category,
           1 - (dc.embedding <=> $1::vector) AS similarity
         FROM document_chunks dc
         JOIN documents d ON d.id = dc.document_id
         WHERE ($3::text IS NULL OR d.category = $3)
         ORDER BY dc.embedding <=> $1::vector ASC
         LIMIT $2`,
        [vectorStr, topK * 2, categoryFilter || null]
      );

      let rows = res.rows.map(r => ({ ...r, similarity: parseFloat(r.similarity) }));

      const extraChunks = [];
      if (isPublisherQuery) {
        const coverRes = await pool.query(`
          SELECT dc.id, dc.document_id, dc.content, dc.chunk_index, dc.page_number, dc.metadata, d.title as document_title, d.category as document_category, 0.85 AS similarity
          FROM document_chunks dc
          JOIN documents d ON d.id = dc.document_id
          WHERE dc.page_number <= 3
          LIMIT 4
        `);
        extraChunks.push(...coverRes.rows.map(r => ({ ...r, similarity: parseFloat(r.similarity) })));
      }

      if (isElectiveQuery) {
        const electiveRes = await pool.query(`
          SELECT dc.id, dc.document_id, dc.content, dc.chunk_index, dc.page_number, dc.metadata, d.title as document_title, d.category as document_category, 0.85 AS similarity
          FROM document_chunks dc
          JOIN documents d ON d.id = dc.document_id
          WHERE (dc.content ILIKE '%SPEL%' OR dc.content ILIKE '%Program Elective%' OR dc.content ILIKE '%PEC-%' OR dc.content ILIKE '%PE -%')
          ORDER BY dc.page_number ASC
          LIMIT 12
        `);
        extraChunks.push(...electiveRes.rows.map(r => ({ ...r, similarity: parseFloat(r.similarity) })));
      }

      if (isCurriculumQuery) {
        const currRes = await pool.query(`
          SELECT dc.id, dc.document_id, dc.content, dc.chunk_index, dc.page_number, dc.metadata, d.title as document_title, d.category as document_category, 0.75 AS similarity
          FROM document_chunks dc
          JOIN documents d ON d.id = dc.document_id
          WHERE dc.page_number >= 7 AND dc.page_number <= 12 AND (dc.content ILIKE '%SEMESTER%' OR dc.content ILIKE '%Course Code%')
          ORDER BY dc.page_number ASC
          LIMIT 6
        `);
        extraChunks.push(...currRes.rows.map(r => ({ ...r, similarity: parseFloat(r.similarity) })));
      }

      const seenIds = new Set();
      const merged = [];
      for (const item of [...extraChunks, ...rows]) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          merged.push(item);
        }
      }

      return merged;
    }

    return this.searchSimilar(queryEmbedding, topK, categoryFilter);
  },

  async countAll() {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT COUNT(*) as count FROM document_chunks');
      return parseInt(res.rows[0].count, 10);
    }
    const store = getMemoryStore();
    return store.document_chunks.length;
  },
};

// ==========================================
// 4. Conversation Model
// ==========================================
export const ConversationModel = {
  async create({ userId, title = 'New Conversation' }) {
    const adapter = getDbAdapter();
    const id = uuidv4();
    const now = new Date().toISOString();

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, userId, title, now, now]
      );
      return res.rows[0];
    }

    const store = getMemoryStore();
    const newConv = {
      id,
      user_id: userId,
      title,
      created_at: now,
      updated_at: now,
    };
    store.conversations.push(newConv);
    persistLocalStore();
    return newConv;
  },

  async findByUserId(userId) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );
      return res.rows;
    }
    const store = getMemoryStore();
    return store.conversations
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  },

  async findById(id) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    return store.conversations.find(c => c.id === id) || null;
  },

  async updateTitle(id, title) {
    const adapter = getDbAdapter();
    const now = new Date().toISOString();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'UPDATE conversations SET title = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [title, now, id]
      );
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    const conv = store.conversations.find(c => c.id === id);
    if (conv) {
      conv.title = title;
      conv.updated_at = now;
      persistLocalStore();
    }
    return conv || null;
  },

  async touch(id) {
    const adapter = getDbAdapter();
    const now = new Date().toISOString();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      await pool.query('UPDATE conversations SET updated_at = $1 WHERE id = $2', [now, id]);
      return;
    }
    const store = getMemoryStore();
    const conv = store.conversations.find(c => c.id === id);
    if (conv) {
      conv.updated_at = now;
      persistLocalStore();
    }
  },

  async deleteById(id) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('DELETE FROM conversations WHERE id = $1 RETURNING *', [id]);
      return res.rows[0] || null;
    }
    const store = getMemoryStore();
    const idx = store.conversations.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const [deleted] = store.conversations.splice(idx, 1);
    // Cascade delete messages
    store.messages = store.messages.filter(m => m.conversation_id !== id);
    persistLocalStore();
    return deleted;
  },
};

// ==========================================
// 5. Message Model
// ==========================================
export const MessageModel = {
  async create({ conversationId, sender, content, sources = [] }) {
    const adapter = getDbAdapter();
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const cleanContent = sanitizeUtf8(content || '');
    const cleanSources = sanitizeMetadata(sources || []);

    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        `INSERT INTO messages (id, conversation_id, sender, content, sources, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, conversationId, sender, cleanContent, JSON.stringify(cleanSources), createdAt]
      );
      return res.rows[0];
    }

    const store = getMemoryStore();
    const newMsg = {
      id,
      conversation_id: conversationId,
      sender,
      content: cleanContent,
      sources: cleanSources,
      created_at: createdAt,
    };
    store.messages.push(newMsg);
    persistLocalStore();
    return newMsg;
  },

  async findByConversationId(conversationId) {
    const adapter = getDbAdapter();
    if (adapter === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
      );
      return res.rows;
    }
    const store = getMemoryStore();
    return store.messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },
};
