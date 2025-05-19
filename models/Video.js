// models/Video.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Please provide a video URL'],
    match: [
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:\/?#[\]@!$&'()*+,;=]*)?$/,
      'Please provide a valid URL'
    ]
  },
  actress: {
    type: [String],
    required: [true, 'Please provide at least one actress']
  },
  genre: {
    type: [String],
    required: [true, 'Please provide at least one genre']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  site: {
    type: String,
    required: [true, 'Please provide the source site']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add pagination plugin
VideoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Video', VideoSchema);