// middleware/adminAuth.js
// Simple API key authentication for admin endpoints.
// In production, replace with JWT/OAuth via Azure AD.

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const adminAuth = (req, res, next) => {
  // Skip auth in development if no key is configured
  if (!ADMIN_API_KEY) {
    return next();
  }

  const apiKey =
    req.headers['x-admin-api-key'] ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid admin API key required. Set x-admin-api-key header.',
    });
  }

  next();
};

module.exports = adminAuth;
