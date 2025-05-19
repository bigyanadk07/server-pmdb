// routes/videos.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo
} = require('../controllers/videoController');

// @route   GET /api/videos
// @desc    Get all videos with pagination and filters
// @access  Public
router.get('/', getAllVideos);

// @route   GET /api/videos/:id
// @desc    Get video by ID
// @access  Public
router.get('/:id', getVideoById);

// @route   POST /api/videos
// @desc    Create a new video
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('videoUrl', 'Valid video URL is required').isURL(),
      check('actress', 'At least one actress is required').not().isEmpty(),
      check('genre', 'At least one genre is required').not().isEmpty(),
      check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
      check('site', 'Site is required').not().isEmpty()
    ]
  ],
  createVideo
);

// @route   PUT /api/videos/:id
// @desc    Update video by ID
// @access  Private
router.put(
  '/:id',
  [
    protect,
    [
      check('title', 'Title must be valid').optional(),
      check('videoUrl', 'Video URL must be valid').optional().isURL(),
      check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 })
    ]
  ],
  updateVideo
);

// @route   DELETE /api/videos/:id
// @desc    Delete video by ID
// @access  Private
router.delete('/:id', protect, deleteVideo);

module.exports = router;