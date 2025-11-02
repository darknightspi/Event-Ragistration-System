const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const { isAuthenticated } = require('../middleware/auth');

/**
 * POST /register
 * Register a participant for an event
 */
router.post('/register', isAuthenticated, async (req, res) => {
  try {
    const { event_id, participant_id } = req.body;
    
    // Validate required fields
    if (!event_id || !participant_id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and Participant ID are required'
      });
    }
    
    // Check if event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if participant exists
    const participant = await Participant.findById(participant_id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    // Check if event is full
    if (event.registered_count >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full. Maximum participants reached.'
      });
    }
    
    // Check if already registered
    const existingRegistration = await Registration.findOne({
      event_id: event_id,
      participant_id: participant_id
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Participant is already registered for this event'
      });
    }
    
    // Create registration
    const registration = new Registration({
      event_id: event_id,
      participant_id: participant_id
    });
    
    await registration.save();
    
    // Update event registered_count
    event.registered_count += 1;
    await event.save();
    
    // Add event to participant's registered_events array
    participant.registered_events.push(event_id);
    await participant.save();
    
    // Populate registration with details
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('event_id', 'name date venue')
      .populate('participant_id', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: populatedRegistration
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Participant is already registered for this event'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering participant',
      error: error.message
    });
  }
});

/**
 * DELETE /unregister
 * Unregister a participant from an event
 */
router.delete('/unregister', isAuthenticated, async (req, res) => {
  try {
    const { event_id, participant_id } = req.body;
    
    // Validate required fields
    if (!event_id || !participant_id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and Participant ID are required'
      });
    }
    
    // Find and delete registration
    const registration = await Registration.findOneAndDelete({
      event_id: event_id,
      participant_id: participant_id
    });
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }
    
    // Update event registered_count
    const event = await Event.findById(event_id);
    if (event) {
      event.registered_count = Math.max(0, event.registered_count - 1);
      await event.save();
    }
    
    // Remove event from participant's registered_events array
    const participant = await Participant.findById(participant_id);
    if (participant) {
      participant.registered_events = participant.registered_events.filter(
        eventId => eventId.toString() !== event_id
      );
      await participant.save();
    }
    
    res.json({
      success: true,
      message: 'Unregistration successful',
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unregistering participant',
      error: error.message
    });
  }
});

/**
 * GET /registrations
 * Get all registrations with optional filters
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { event_id, participant_id } = req.query;
    
    let query = {};
    
    if (event_id) {
      query.event_id = event_id;
    }
    
    if (participant_id) {
      query.participant_id = participant_id;
    }
    
    const registrations = await Registration.find(query)
      .populate('event_id', 'name date venue organizer')
      .populate('participant_id', 'name email phone')
      .sort({ registration_date: -1 });
    
    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
});

module.exports = router;

