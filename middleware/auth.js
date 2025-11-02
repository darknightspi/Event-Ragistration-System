/**
 * Authentication and Authorization Middleware
 */

/**
 * Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

/**
 * Check if user is admin or regular user
 */
const isAdminOrUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isAdminOrUser
};

