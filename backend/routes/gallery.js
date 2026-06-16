import express from 'express';
import Gallery from '../models/Gallery.js';
import { protect, admin } from '../middleware/auth.js';
import { upload, uploadImage } from '../utils/upload.js';

const router = express.Router();

// @desc    Get gallery statistics
// @route   GET /api/gallery/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalPhotos = await Gallery.countDocuments({});
    const eventCounts = await Gallery.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      totalPhotos,
      totalEvents: eventCounts.length,
      byCategory: eventCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const galleryItems = await Gallery.find({}).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add a gallery image
// @route   POST /api/gallery
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  const { title, category } = req.body;

  try {
    let imageUrl = '';

    if (req.file) {
      imageUrl = await uploadImage(req.file, 'cic_gallery');
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Please upload an image file or provide an image URL' });
    }

    const galleryItem = new Gallery({
      title,
      category: category || 'Events',
      image: imageUrl,
    });

    const createdItem = await galleryItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error adding gallery item:', error);
    res.status(400).json({ message: 'Invalid gallery data' });
  }
});

// @desc    Update a gallery image
// @route   PUT /api/gallery/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { title, category } = req.body;

  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (title) galleryItem.title = title;
    if (category) galleryItem.category = category;

    const updatedItem = await galleryItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid gallery data' });
  }
});

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (galleryItem) {
      await galleryItem.deleteOne();
      res.json({ message: 'Gallery item removed' });
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
