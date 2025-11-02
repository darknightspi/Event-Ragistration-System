const mongoose = require('mongoose');

/**
 * Participant Schema
 * Stores participant information including name, email, phone, department, 
 * year, and list of registered events
 */
const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    enum: ['First', 'Second', 'Third', 'Fourth', 'Graduate', 'Other'],
    trim: true
  },
  registered_events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Email index is automatically created by unique: true, so no need for explicit index

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;

