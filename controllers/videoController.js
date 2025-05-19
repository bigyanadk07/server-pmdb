// controllers/videoController.js
const { validationResult } = require('express-validator');
const Video = require('../models/Video');

// @desc    Get all videos with pagination and filters
// @route   GET /api/videos
// @access  Public
exports.getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, actress, genre, rating } = req.query;
    
    // Build query
    const query = {};
    
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    
    if (actress) {
      query.actress = { $in: actress.split(',').map(a => new RegExp(a.trim(), 'i')) };
    }
    
    if (genre) {
      query.genre = { $in: genre.split(',').map(g => new RegExp(g.trim(), 'i')) };
    }
    
    if (rating) {
      query.rating = { $gte: parseInt(rating) };
    }
    
    // Find videos with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: { path: 'createdBy', select: 'username' }
    };
    
    const videos = await Video.paginate(query, options);
    
    res.json({
      videos: videos.docs,
      totalPages: videos.totalPages,
      currentPage: videos.page,
      totalVideos: videos.totalDocs
    });
  } catch (error) {
    console.error(`Error in getAllVideos: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Public
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('createdBy', 'username');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error(`Error in getVideoById: ${error.message}`);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new video
// @route   POST /api/videos
// @access  Private
exports.createVideo = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, videoUrl, actress, genre, rating, site } = req.body;
  
  try {
    const newVideo = await Video.create({
      title,
      videoUrl,
      actress: Array.isArray(actress) ? actress : [actress],
      genre: Array.isArray(genre) ? genre : [genre],
      rating,
      site,
      createdBy: req.user._id
    });
    
    const video = await Video.findById(newVideo._id).populate('createdBy', 'username');
    
    res.status(201).json(video);
  } catch (error) {
    console.error(`Error in createVideo: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update video by ID
// @route   PUT /api/videos/:id
// @access  Private
exports.updateVideo = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user owns the video
    if (video.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }
    
    const { title, videoUrl, actress, genre, rating, site } = req.body;
    
    // Update fields
    video.title = title || video.title;
    video.videoUrl = videoUrl || video.videoUrl;
    video.actress = actress ? (Array.isArray(actress) ? actress : [actress]) : video.actress;
    video.genre = genre ? (Array.isArray(genre) ? genre : [genre]) : video.genre;
    video.rating = rating || video.rating;
    video.site = site || video.site;
    
    video = await video.save();
    
    res.json(video);
  } catch (error) {
    console.error(`Error in updateVideo: ${error.message}`);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete video by ID
// @route   DELETE /api/videos/:id
// @access  Private
exports.deleteVideo = async (req, res) => {
  try {
    console.log('Delete request received for video ID:', req.params.id);
    console.log('User making request:', req.user._id);
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      console.log('Video not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Log the video details for debugging
    console.log('Video found:', video);
    
    // Check if createdBy exists on the video
    if (!video.createdBy) {
      console.log('This video has no createdBy field:', req.params.id);
      
      // Option 1: Allow deletion by any authenticated user if no owner is set
      // Remove the ownership check entirely for this case
      
      await video.deleteOne();
      console.log('Video with no owner successfully deleted:', req.params.id);
      
      return res.json({ message: 'Video removed' });
    }
    
    // Check if user owns the video
    if (video.createdBy.toString() !== req.user._id.toString()) {
      console.log('Authorization failed. Video creator:', video.createdBy, 'Request user:', req.user._id);
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    await video.deleteOne();
    console.log('Video successfully deleted:', req.params.id);
    
    res.json({ message: 'Video removed' });
  } catch (error) {
    console.error(`Error in deleteVideo: ${error.message}`);
    console.error(error.stack);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Video not found - invalid ID format' });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};