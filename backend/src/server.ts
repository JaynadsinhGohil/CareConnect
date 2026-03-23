import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer } from 'ws';
import { initializeDatabase, seedDatabase } from './models/schema.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import doctorRoutes from './routes/doctors.js';
import patientRoutes from './routes/patients.js';
import adminRoutes from './routes/admin.js';
import { initializeRealtimeServer } from './realtime/ws.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

initializeRealtimeServer(wss);

// Middleware - CORS configured for production and development
const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  /^https:\/\/.*\.vercel\.app$/, // Accept all Vercel deployment URLs
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Realtime WS endpoint: ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
