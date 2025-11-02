const mongoose = require('mongoose');

/**
 * Registration Schema
 * Links participants to events and stores registration date
 * Ensures one participant can only register once per event
 */
const registrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: [true, 'Participant ID is required']
  },
  registration_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure one registration per participant per event
registrationSchema.index({ event_id: 1, participant_id: 1 }, { unique: true });

// Index for faster queries
registrationSchema.index({ participant_id: 1 });
registrationSchema.index({ event_id: 1 });
registrationSchema.index({ registration_date: -1 });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;

