import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    // Return all members except passwords, sorted by XP desc
    const members = await User.find({}).select('-password').sort({ xp: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Manually assign / adjust XP for a member
// @route   PATCH /api/members/:id/xp
// @access  Private/Admin
router.patch('/:id/xp', protect, admin, async (req, res) => {
  const { xp, mode = 'set' } = req.body; // mode: 'set' | 'add' | 'subtract'

  if (xp === undefined || isNaN(Number(xp))) {
    return res.status(400).json({ message: 'xp must be a number' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (mode === 'add')           user.xp = Math.max(0, (user.xp || 0) + Number(xp));
    else if (mode === 'subtract') user.xp = Math.max(0, (user.xp || 0) - Number(xp));
    else                          user.xp = Math.max(0, Number(xp));   // 'set'

    await user.save();
    res.json({ _id: user._id, name: user.name, xp: user.xp });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Remove a member
// @route   DELETE /api/members/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only admin' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
