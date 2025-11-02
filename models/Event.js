const mongoose = require('mongoose');

/**
 * Event Schema
 * Stores event details including name, date, venue, organizer, description, 
 * maximum participants, and current registration count
 */
const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    minlength: [3, 'Event name must be at least 3 characters long']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  organizer: {
    type: String,
    required: [true, 'Organizer is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  max_participants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Maximum participants must be at least 1']
  },
  registered_count: {
    type: Number,
    default: 0,
    min: [0, 'Registered count cannot be negative']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for faster queries
eventSchema.index({ date: 1 });
eventSchema.index({ name: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

