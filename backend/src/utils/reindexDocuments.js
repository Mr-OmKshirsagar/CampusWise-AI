import { initDb, getPgPool } from '../config/db.js';
import { EmbeddingService } from '../services/embeddingService.js';

async function reindex() {
  await initDb();
  const pool = getPgPool();

  console.log('[Reindex] Fetching all chunks from Supabase...');
  const res = await pool.query(`
    SELECT dc.id, dc.content, d.title as doc_title, d.category as doc_category
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    ORDER BY dc.created_at ASC
  `);

  console.log(`[Reindex] Found ${res.rows.length} chunks. Generating embeddings in batches...`);

  const batchSize = 10;
  for (let i = 0; i < res.rows.length; i += batchSize) {
    const batch = res.rows.slice(i, i + batchSize);
    const texts = batch.map(c => `${c.doc_title} ${c.doc_category} ${c.content}`);
    const embeddings = await EmbeddingService.generateBatchEmbeddings(texts);

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const emb = embeddings[j];
      const vecStr = `[${emb.join(',')}]`;
      await pool.query(
        'UPDATE document_chunks SET embedding = $1 WHERE id = $2',
        [vecStr, chunk.id]
      );
    }
    console.log(`[Reindex] Processed chunks ${i + 1} to ${Math.min(i + batchSize, res.rows.length)} / ${res.rows.length}`);
  }

  console.log('[Reindex] All chunks successfully re-indexed!');
  process.exit(0);
}

reindex().catch(console.error);
