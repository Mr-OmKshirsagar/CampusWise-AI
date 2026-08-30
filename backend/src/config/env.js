import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim()),
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
  database: {
    url: (process.env.DATABASE_URL || '').trim(),
    adapter: (process.env.DB_ADAPTER || 'auto').trim(),
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    grokApiKey: process.env.GROK_API_KEY || '',
    grokModel: process.env.GROK_MODEL || 'grok-2-latest',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  rag: {
    topK: parseInt(process.env.RAG_TOP_K || '4', 10),
    similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.10'),
    chunkSize: parseInt(process.env.CHUNK_SIZE || '800', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '100', 10),
  },
  upload: {
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10) * 1024 * 1024,
    uploadDir: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || './uploads'),
  },
};
