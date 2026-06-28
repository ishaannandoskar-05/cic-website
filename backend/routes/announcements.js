import express from 'express';
import Announcement from '../models/Announcement.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { title, category, content } = req.body;

  try {
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

    const announcement = new Announcement({
      title,
      category,
      content,
      date: dateStr,
    });

    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
  } catch {
    res.status(400).json({ message: 'Invalid announcement data' });
  }
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { title, category, content } = req.body;

  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      announcement.title = title || announcement.title;
      announcement.category = category || announcement.category;
      announcement.content = content || announcement.content;

      const updatedAnnouncement = await announcement.save();
      res.json(updatedAnnouncement);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      await announcement.deleteOne();
      res.json({ message: 'Announcement removed' });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
