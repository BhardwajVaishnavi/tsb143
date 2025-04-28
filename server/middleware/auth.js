const { verifyToken } = require('../utils/jwt');
// Use real Prisma client with SQLite database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 * Adds the user to the request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided in request:', req.headers);
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 10) + '...');

    // Verify the token
    const decoded = verifyToken(token);
    console.log('Token decoded successfully for user ID:', decoded.id);

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      console.log('User is inactive:', user.id);
      return res.status(401).json({ error: 'User is inactive' });
    }

    // Add the user to the request object
    req.user = user;
    console.log('Authentication successful for user:', user.name);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Convert user role to uppercase for case-insensitive comparison
    const userRole = req.user.role.toUpperCase();

    // Convert all roles to uppercase for comparison
    const upperCaseRoles = roles.map(role => typeof role === 'string' ? role.toUpperCase() : role);

    if (!upperCaseRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
