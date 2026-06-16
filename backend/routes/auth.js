import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Rate limiters ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Please try again later.' },
});

// ── Token generator ───────────────────────────────────────────
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set.');
  return jwt.sign({ id }, jwtSecret, { expiresIn: '7d' });
};

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', registerLimiter, async (req, res) => {
  const { name, ien, email, password, role, adminSecretKey } = req.body;

  if (!name || !ien || !email || !password) {
    return res.status(400).json({ message: 'name, ien, email and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { ien }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this Email or IEN already exists.' });
    }

    const userRole = role === 'admin' ? 'admin' : 'student';

    if (userRole === 'student') {
      if (!email.toLowerCase().endsWith('@nhitm.ac.in')) {
        return res.status(400).json({
          message: 'Student registration is restricted to @nhitm.ac.in emails.',
        });
      }
    }

    if (userRole === 'admin') {
      const serverAdminKey = process.env.ADMIN_SECRET_KEY;
      if (!serverAdminKey) {
        return res.status(500).json({ message: 'Server configuration error.' });
      }
      if (adminSecretKey !== serverAdminKey) {
        return res.status(401).json({ message: 'Invalid Admin Security Key.' });
      }
    }

    const user = await User.create({
      name,
      ien,
      email: email.toLowerCase(),
      password,
      role: userRole,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      ien: user.ien,
      email: user.email,
      role: user.role,
      xp: user.xp,
      streak: user.streak,
      solvedCount: user.solvedCount,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        ien: user.ien,
        email: user.email,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        solvedCount: user.solvedCount,
        token: generateToken(user._id),
      });
    } else {
      // Same message for both "user not found" and "wrong password" to prevent user enumeration
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      ien: user.ien,
      email: user.email,
      role: user.role,
      xp: user.xp,
      streak: user.streak,
      solvedCount: user.solvedCount,
    });
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
// Only allows changing name and password — not email or ien
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Explicitly whitelist updatable fields — ien and email are immutable after registration
    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
      }
      user.password = req.body.password;
    }

    // Silently ignore any attempt to change email or ien
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      ien: updatedUser.ien,
      email: updatedUser.email,
      role: updatedUser.role,
      xp: updatedUser.xp,
      streak: updatedUser.streak,
      solvedCount: updatedUser.solvedCount,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;