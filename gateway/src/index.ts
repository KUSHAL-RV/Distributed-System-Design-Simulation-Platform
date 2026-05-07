import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth';
import designRoutes from './routes/designs';
import templateRoutes from './routes/templates';
import { connectRedis } from './lib/redis';

// ─── Environment ─────────────────────────────────

const PORT = parseInt(process.env.GATEWAY_PORT || '4000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ─── Express App ─────────────────────────────────

const app = express();
const server = http.createServer(app);

// ─── Socket.io Server ────────────────────────────

const io = new SocketIOServer(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// ─── Middleware ───────────────────────────────────

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'livesysdesign-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ──────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/templates', templateRoutes);

// ─── 404 Handler ─────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found.',
  });
});

// ─── Global Error Handler ────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Gateway] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
});

// ─── Socket.io Connection ────────────────────────

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_simulation', ({ simId }) => {
    socket.join(`sim:${simId}`);
    console.log(`[Socket.io] ${socket.id} joined sim:${simId}`);
  });

  socket.on('leave_simulation', ({ simId }) => {
    socket.leave(`sim:${simId}`);
    console.log(`[Socket.io] ${socket.id} left sim:${simId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
  });
});

import { prisma } from './lib/prisma';
import { redisSub } from './lib/redis';

let metricsBuffer: any[] = [];

// Flush interval writing to TimescaleDB
setInterval(async () => {
  if (metricsBuffer.length === 0) return;
  const batch = [...metricsBuffer];
  metricsBuffer = []; // Reset fast

  try {
    // @ts-ignore - Prisma Language Server cache bypass
    await prisma.simulationMetric.createMany({
      data: batch.map((m: any) => ({
        simulationId: m.simulationId || m.simulation_id || m.SimulationID,
        nodeId: m.nodeId || m.node_id || m.NodeID,
        timestamp: new Date(m.timestamp || m.Timestamp || Date.now()),
        latency: m.latency || m.Latency || 0,
        success: m.success !== undefined ? m.success : (m.Success !== undefined ? m.Success : true),
        statusCode: m.statusCode || m.status_code || m.StatusCode || 200,
      })),
      skipDuplicates: true // Just in case
    });
  } catch (err) {
    console.error('[TimescaleDB] Bulk insertion failed:', err);
  }
}, 3000);

redisSub.psubscribe('sim:*:metrics', (err, count) => {
  if (err) {
    console.error('[Redis] Failed to subscribe to metrics channel');
  } else {
    console.log(`[Redis] Subscribed to metrics channels (${count})`);
  }
});

redisSub.on('pmessage', (pattern, channel, message) => {
  console.log(`[Redis] pmessage received on ${channel}`);
  const simId = channel.split(':')[1];
  try {
    const data = JSON.parse(message);
    console.log(`[Metrics] Received from ${simId}: ${data.nodeId} (${data.success ? 'OK' : 'ERR'})`);
    io.to(`sim:${simId}`).emit('metric', data);
    
    // Add to buffer for TimeScaleDB
    metricsBuffer.push(data);
  } catch (err) {
    console.error('[Redis] Failed to parse metric message', err);
  }
});

// Make io accessible for route handlers
app.set('io', io);

// ─── Server Start ────────────────────────────────

server.listen(PORT, async () => {
  // Connect to Redis (non-blocking, falls back to in-memory)
  await connectRedis();

  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 LiveSysDesign Gateway              ║
  ║   REST API:    http://localhost:${PORT}     ║
  ║   WebSocket:   ws://localhost:${PORT}       ║
  ║   Health:      http://localhost:${PORT}/health ║
  ╚══════════════════════════════════════════╝
  `);
});

export { app, server, io };
