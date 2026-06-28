// ── dotenv MUST be loaded first before any other imports read process.env ──
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
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

// ── Validate required environment variables ────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_SECRET_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key] || process.env[key].startsWith('REPLACE_')) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET is too short. Use at least 32 random characters.');
  process.exit(1);
}

// ── App setup ─────────────────────────────────────────────────
const app = express();

// ── CORS — must be the very first middleware ───────────────────
// Always include the Netlify origin; extend via ALLOWED_ORIGINS env var on Render
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  'https://cic-club-nhitm.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...envOrigins,
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
};

app.use(cors(corsOptions));

// Explicitly handle all OPTIONS preflight requests before anything else
app.options('*', cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// ── Static uploads ────────────────────────────────────────────
const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ── Seed data (non-blocking) ──────────────────────────────────
const seedDefaultData = async () => {
  setTimeout(async () => {
    try {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        const tempPassword = crypto.randomBytes(12).toString('base64url');
        await User.create({
          name: 'NHITM Admin',
          ien: 'IEN000000',
          email: 'admin@nhitm.ac.in',
          password: tempPassword,
          role: 'admin',
        });
        console.log('✅ Seeded default admin: admin@nhitm.ac.in');
        console.log(`🔑 Temporary password (change immediately): ${tempPassword}`);
      }

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

app.get('/', (req, res) => {
  res.send('CIC Portal Backend is running successfully!');
});

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(statusCode).json({
    message: isProduction ? 'An internal server error occurred.' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// ── Start server, THEN connect to DB ─────────────────────────
// Binding the port first means Render's health check passes immediately.
// The DB connects in the background — API calls before DB is ready will
// get a 500, but the server won't crash and CORS headers will still be sent.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  connectDB()
    .then(() => seedDefaultData())
    .catch(err => {
      console.error('❌ DB connection failed:', err.message);
    });
});