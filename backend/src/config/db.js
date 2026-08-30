import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let adapter = 'memory'; // 'postgres' | 'memory'

// Persistent storage path for embedded local adapter
const localDataDir = path.resolve(__dirname, '../../data');
const localDataFile = path.resolve(localDataDir, 'db_store.json');

// In-Memory / Local fallback store structure
const memoryStore = {
  users: [],
  documents: [],
  document_chunks: [],
  conversations: [],
  messages: [],
};

// Cosine similarity between two float vectors
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Load local database store from disk if exists
function loadLocalStore() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    if (fs.existsSync(localDataFile)) {
      const data = fs.readFileSync(localDataFile, 'utf8');
      const parsed = JSON.parse(data);
      Object.assign(memoryStore, parsed);
    }
  } catch (err) {
    console.warn('[DB] Could not load local store file:', err.message);
  }
}

// Save local database store to disk
export function persistLocalStore() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    fs.writeFileSync(localDataFile, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB] Could not save local store file:', err.message);
  }
}

export async function initDb() {
  loadLocalStore();

  if (env.database.url && env.database.adapter !== 'memory') {
    try {
      pool = new Pool({
        connectionString: env.database.url,
        ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      });

      // Test connection
      const client = await pool.connect();
      console.log('[DB] Connected successfully to PostgreSQL (pgvector).');

      // Auto-run schema migrations
      const schemaPath = path.resolve(__dirname, '../models/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('[DB] Schema verified & migrations applied.');
      }
      client.release();
      adapter = 'postgres';
      return;
    } catch (err) {
      console.warn(`[DB] PostgreSQL connection failed (${err.message}). Falling back to embedded vector store.`);
      adapter = 'memory';
    }
  } else {
    console.log('[DB] Initialized in embedded vector store mode (Local/Dev).');
    adapter = 'memory';
  }
}

export function getDbAdapter() {
  return adapter;
}

export function getMemoryStore() {
  return memoryStore;
}

export function getPgPool() {
  return pool;
}

export async function query(text, params) {
  if (adapter === 'postgres' && pool) {
    return pool.query(text, params);
  }
  throw new Error('Direct SQL query not available in embedded adapter mode. Use models layer.');
}
