import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import announcementRoutes from './routes/announcements.js';
import eventRoutes from './routes/events.js';
import resourceRoutes from './routes/resources.js';
import galleryRoutes from './routes/gallery.js';
import questRoutes from './routes/quests.js';
import submissionRoutes from './routes/submissions.js';
import memberRoutes from './routes/members.js';
import leaderboardRoutes from './routes/leaderboard.js';
import analyticsRoutes from './routes/analytics.js';
import compilerRoutes from './routes/compiler.js';

// Model imports (for seeding)
import User from './models/User.js';
import Quest from './models/Quest.js';

// Initialize environment variables
dotenv.config();

// Validate required environment variables at startup
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_SECRET_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key] || process.env[key].startsWith('REPLACE_')) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Warn if JWT secret is too short (should be >= 32 chars)
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET is too short. Use at least 32 random characters.');
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) only in development
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing with size limits ────────────────────────────
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// ── Static uploads ────────────────────────────────────────────
const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ── Seed data (non-blocking, runs after DB connects) ──────────
const seedDefaultData = async () => {
  setTimeout(async () => {
    try {
      // Seed default admin only if none exists
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        // Generate a random one-time password instead of a hardcoded one
        const tempPassword = crypto.randomBytes(12).toString('base64url');
        await User.create({
          name: 'NHITM Admin',
          ien: 'IEN000000',
          email: 'admin@nhitm.ac.in',
          password: tempPassword,
          role: 'admin',
        });
        // Log the temporary password ONCE so the real admin can log in and change it
        console.log('✅ Seeded default admin: admin@nhitm.ac.in');
        console.log(`🔑 Temporary password (change immediately): ${tempPassword}`);
      }

      // Seed a default quest if none exists
      const questCount = await Quest.countDocuments({});
      if (questCount === 0) {
        await Quest.create({
          title: 'Clone Graph',
          difficulty: 'Medium',
          statement: 'Given a reference of a node in a connected undirected graph, return a deep copy of the graph.',
          hints: [
            'Use a HashMap to store cloning mapping from original nodes to copies',
            'Use BFS or DFS for traversal',
          ],
          testcases: [
            { input: '[[[2,4],[1,3],[2,4],[1,3]]]', expectedOutput: '[[2,4],[1,3],[2,4],[1,3]]', explanation: 'Deep copy' },
            { input: '[[[]]]', expectedOutput: '[[]]', explanation: 'Single node' },
            { input: '[[]]', expectedOutput: '[]', explanation: 'Empty graph' },
          ],
          tags: ['Graph', 'DFS', 'BFS'],
        });
        console.log('✅ Seeded default Daily Quest: Clone Graph');
      }
    } catch (error) {
      console.error('ℹ️ Seed error (non-critical):', error.message);
    }
  }, 3000);
};

seedDefaultData();

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/compiler', compilerRoutes);

// ── Serve Frontend ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(frontendDistPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('CIC Portal Backend is running successfully!');
  });
}

// ── Global error handler — never leaks stack traces in production ──
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(statusCode).json({
    message: isProduction ? 'An internal server error occurred.' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});