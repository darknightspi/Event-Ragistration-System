const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * POST /auth/register
 * Register a new user
 * Note: Only admins can create admin accounts. Regular users can only register as 'user'
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Use email as username if username not provided
    const finalUsername = username || email;

    // Validate role
    let userRole = role || 'user';
    if (userRole !== 'admin' && userRole !== 'user') {
      userRole = 'user';
    }

    // Allow users to self-register with their chosen role (admin or user)

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: finalUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (using email as username)
    const user = new User({
      username: finalUsername,
      email,
      password: hashedPassword,
      name,
      role: userRole
    });

    await user.save();

    // Don't send password in response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userName = user.name;
    req.session.username = user.username;

    // Don't send password in response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out',
        error: err.message
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

/**
 * GET /auth/me
 * Get current user information
 */
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  res.json({
    success: true,
    data: {
      _id: req.session.userId,
      username: req.session.username,
      name: req.session.userName,
      role: req.session.userRole
    }
  });
});

module.exports = router;

