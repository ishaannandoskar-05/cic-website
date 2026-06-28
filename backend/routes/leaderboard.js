import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get students sorted by XP descending
    const students = await User.find({ role: 'student' })
      .select('name xp streak solvedCount')
      .sort({ xp: -1 });

    // Format with dynamic ranks
    const rankings = students.map((student, index) => ({
      rank: index + 1,
      _id: student._id,
      name: student.name,
      xp: student.xp,
      streak: student.streak,
      solvedCount: student.solvedCount,
    }));

    res.json(rankings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
