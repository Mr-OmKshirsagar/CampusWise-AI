import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { initDb, getDbAdapter } from './config/db.js';
import { DocumentService } from './services/documentService.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    frameguard: false,
  })
);

// Request Logger
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// CORS Configuration
const allowedOrigins = env.corsOrigins.map((o) => o.replace(/\/+$/, '').toLowerCase());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '').toLowerCase();

    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(normalizedOrigin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      /^https?:\/\/(192\.168|10|172\.(1[6-9]|2[0-9]|3[0-1]))\./.test(origin)
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Rejected request from origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files for uploads & sample files (with cross-origin embed headers & Database sync fallback)
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.resolve(__dirname, '../uploads')),
  express.static(path.resolve(__dirname, '../sample_data')),
  async (req, res, next) => {
    try {
      const filename = path.basename(req.path || '');
      if (filename && filename.length > 0) {
        const fileInfo = await DocumentService.getDocumentFile(filename);
        res.setHeader('Content-Type', fileInfo.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${fileInfo.filename}"`);
        return res.send(fileInfo.buffer);
      }
    } catch (err) {
      // If not in database either, pass to 404 handler
    }
    next();
  }
);

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Health Check Endpoint (support root, /health, /api/health)
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusWise AI Backend API',
    dbAdapter: getDbAdapter(),
  });
});

// Mount Routes (support both /api/ prefix and root path)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', documentRoutes);
app.use('/admin', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.',
    ...(env.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
});

// Server Initialization
export async function startServer(port = env.port) {
  await initDb();
  return new Promise((resolve) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[CampusWise AI] Server running at http://0.0.0.0:${port} in ${env.nodeEnv} mode`);
      resolve(server);
    });
  });
}

// Automatically start when executed directly
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (process.env.NODE_ENV !== 'test' && isMainModule) {
  startServer();
}

export default app;
