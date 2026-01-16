import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import sosRoutes from './routes/sos.routes';
import presentationRoutes from './routes/presentation.routes';
import riskZonesRoutes from './routes/risk-zones.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import { setupSocketHandlers } from './sockets/handlers';
import { AuthRequest } from './middlewares/auth';
import { createCorsOptions } from './config/cors';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middlewares/error';

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);
const corsOptions = createCorsOptions();
const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigins(),
    credentials: true,
  },
});

const PORT = env.port();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.static('uploads'));

// Make io available to routes
app.use((req: AuthRequest, res, next) => {
  (req as any).io = io;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/presentation', presentationRoutes);
app.use('/api/risk-zones', riskZonesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);

// Error handling
app.use(errorHandler);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Aurora Sentinel Backend running on port ${PORT}`);
  logger.info(`WebSocket server ready`);
  logger.info(`CORS enabled for: ${env.corsOrigins().join(', ')}`);
});
