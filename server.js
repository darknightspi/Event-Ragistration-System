require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

// Import routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const participantsRoutes = require('./routes/participants');
const registrationsRoutes = require('./routes/registrations');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-registration';

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/participants', participantsRoutes);
app.use('/registrations', registrationsRoutes);

// API route for root (keep for API access)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Matoshri Event Registration System API',
    version: '1.0.0',
    endpoints: {
      events: {
        'GET /events': 'Get all events',
        'GET /events/:id': 'Get event by ID',
        'POST /events': 'Create new event',
        'PUT /events/:id': 'Update event',
        'DELETE /events/:id': 'Delete event'
      },
      participants: {
        'GET /participants': 'Get all participants',
        'GET /participants/:id': 'Get participant by ID',
        'POST /participants': 'Create new participant',
        'PUT /participants/:id': 'Update participant',
        'DELETE /participants/:id': 'Delete participant'
      },
      registrations: {
        'POST /registrations/register': 'Register participant for event',
        'DELETE /registrations/unregister': 'Unregister participant from event',
        'GET /registrations': 'Get all registrations (with optional ?event_id= or ?participant_id= filters)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start server after MongoDB connection
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVER IS RUNNING');
    console.log('='.repeat(60));
    console.log(`📱 Frontend URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api`);
    console.log(`📊 Events Endpoint: http://localhost:${PORT}/events`);
    console.log(`👥 Participants Endpoint: http://localhost:${PORT}/participants`);
    console.log(`📋 Registrations Endpoint: http://localhost:${PORT}/registrations`);
    console.log('='.repeat(60));
    console.log(`\n✅ Server successfully started on port ${PORT}\n`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('Please check your MongoDB connection and try again.');
  process.exit(1);
});

module.exports = app;

