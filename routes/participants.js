const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

/**
 * GET /participants
 * Retrieve all participants
 */
router.get('/', async (req, res) => {
  try {
    const participants = await Participant.find()
      .populate('registered_events', 'name date venue')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching participants',
      error: error.message
    });
  }
});

/**
 * GET /participants/:id
 * Retrieve a single participant by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('registered_events', 'name date venue organizer description');
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching participant',
      error: error.message
    });
  }
});

/**
 * POST /participants
 * Create a new participant
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participant = new Participant(req.body);
    const savedParticipant = await participant.save();
    
    res.status(201).json({
      success: true,
      message: 'Participant created successfully',
      data: savedParticipant
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating participant',
      error: error.message
    });
  }
});

/**
 * PUT /participants/:id
 * Update an existing participant
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Participant updated successfully',
      data: participant
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating participant',
      error: error.message
    });
  }
});

/**
 * DELETE /participants/:id
 * Delete a participant
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Participant deleted successfully',
      data: participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting participant',
      error: error.message
    });
  }
});

module.exports = router;

