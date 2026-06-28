import express from 'express';
import Submission from '../models/Submission.js';
import Quest from '../models/Quest.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate difference in calendar days
const getDaysBetween = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  
  // Set time components to midnight to compare days only
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// @desc    Submit a quest solution
// @route   POST /api/submissions/:questId/submit
// @access  Private
router.post('/:questId/submit', protect, async (req, res) => {
  const { code, language } = req.body;
  const questId = req.params.questId;

  try {
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // Check if user already has a pending submission for this quest
    const existingPending = await Submission.findOne({
      student: req.user._id,
      quest: questId,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({ message: 'You already have a pending submission for this quest' });
    }

    const submission = new Submission({
      student: req.user._id,
      quest: questId,
      code,
      language: language || 'Python',
    });

    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get current student's submissions
// @route   GET /api/submissions/my-submissions
// @access  Private
router.get('/my-submissions', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('quest', 'title difficulty')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all submissions (Admin only)
// @route   GET /api/submissions
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate('student', 'name ien email')
      .populate('quest', 'title difficulty')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Review submission (Approve/Reject)
// @route   PUT /api/submissions/:id/review
// @access  Private/Admin
router.put('/:id/review', protect, admin, async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student')
      .populate('quest');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Submission has already been reviewed' });
    }

    submission.status = status;

    if (status === 'approved') {
      const student = await User.findById(submission.student._id);
      
      if (!student) {
        return res.status(404).json({ message: 'Student user not found' });
      }

      // 1. Calculate points based on quest difficulty
      let points = 50; // Easy
      if (submission.quest.difficulty === 'Medium') points = 100;
      if (submission.quest.difficulty === 'Hard') points = 150;

      submission.pointsAwarded = points;

      // 2. Award XP
      student.xp += points;
      student.solvedCount += 1;

      // 3. Update Streak
      const today = new Date();
      if (student.lastActiveDate) {
        const daysDiff = getDaysBetween(student.lastActiveDate, today);

        if (daysDiff === 1) {
          // Submitted on consecutive day
          student.streak += 1;
        } else if (daysDiff > 1) {
          // Streak broken
          student.streak = 1;
        }
        // If daysDiff === 0 (same day), streak remains the same
      } else {
        // First ever submission approval
        student.streak = 1;
      }
      student.lastActiveDate = today;

      await student.save();
    } else {
      submission.pointsAwarded = 0;
    }

    const updatedSubmission = await submission.save();
    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error reviewing submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
