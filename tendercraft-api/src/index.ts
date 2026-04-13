import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startCleanupScheduler } from './utils/storage.js';

import analyzeRoutes from './routes/analyze.js';
import generateRoutes from './routes/generate.js';
import editRoutes from './routes/edit.js';
import renderRoutes from './routes/render.js';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      env.FRONTEND_URL,
      'http://localhost:4173',
      'http://localhost:5173',
    ];
    // Allow requests with no origin (mobile apps, curl) or matching origins
    if (!origin || allowed.some((o) => origin.startsWith(o) || origin.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
}));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/edit', editRoutes);
app.use('/api/render', renderRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start
startCleanupScheduler();
app.listen(env.PORT, () => {
  console.log(`[SERVER] TenderCraft API running on port ${env.PORT}`);
  console.log(`[SERVER] CORS origin: ${env.FRONTEND_URL}`);
  console.log(`[SERVER] Environment: ${env.NODE_ENV}`);
});
