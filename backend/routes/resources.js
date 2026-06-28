import express from 'express';
import Resource from '../models/Resource.js';
import { protect, admin } from '../middleware/auth.js';
import { upload, uploadImage } from '../utils/upload.js';

const router = express.Router();

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const resources = await Resource.find({}).sort({ createdAt: -1 });
    res.json(resources);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  const { title, category, description, tag, link } = req.body;

  try {
    let imageUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop'; // Default fallback

    if (req.file) {
      imageUrl = await uploadImage(req.file, 'cic_resources');
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const resource = new Resource({
      title,
      category,
      description,
      tag: tag || 'Recently Added',
      link: link || '#',
      image: imageUrl,
    });

    const createdResource = await resource.save();
    res.status(201).json(createdResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(400).json({ message: 'Invalid resource data' });
  }
});

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const { title, category, description, tag, link } = req.body;

  try {
    const resource = await Resource.findById(req.params.id);

    if (resource) {
      resource.title = title || resource.title;
      resource.category = category || resource.category;
      resource.description = description || resource.description;
      resource.tag = tag || resource.tag;
      resource.link = link || resource.link;

      if (req.file) {
        resource.image = await uploadImage(req.file, 'cic_resources');
      } else if (req.body.image) {
        resource.image = req.body.image;
      }

      const updatedResource = await resource.save();
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (resource) {
      await resource.deleteOne();
      res.json({ message: 'Resource removed' });
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
