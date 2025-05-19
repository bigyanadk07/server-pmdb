// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the URI being used (without exposing credentials)
    const sanitizedUri = process.env.MONGO_URI 
      ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ':***@')
      : 'MONGO_URI is undefined';
    
    console.log('Attempting to connect to MongoDB with URI:', sanitizedUri);
    
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Add connection options for better diagnostics
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of default 30
    });
    
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error Details:');
    console.error(`- Error Name: ${err.name}`);
    console.error(`- Error Message: ${err.message}`);
    console.error(`- Error Code: ${err.code || 'N/A'}`);
    console.error(`- Stack Trace: ${err.stack}`);
    
    // Check for common error causes
    if (err.message.includes('URI must include hostname')) {
      console.error('HINT: Your MongoDB URI format appears to be incorrect. Ensure it follows the format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>');
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('HINT: Server selection timed out. Check your network connection or MongoDB Atlas status.');
    } else if (err.message.includes('Authentication failed')) {
      console.error('HINT: Authentication failed. Check your username and password in the connection string.');
    }
    
    // Exit the process with failure
    process.exit(1);
  }
};

module.exports = connectDB;