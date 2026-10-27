import jwt from 'jsonwebtoken';
import pool from '../db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUUID = (uuid) => {
  return typeof uuid === 'string' && UUID_REGEX.test(uuid.trim());
};

/**
 * JWT Authentication & User Verification Middleware
 * Prioritizes httpOnly cookie / Bearer JWT, with fallback to verified userId in body/params
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.jwtToken ||
      req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (token) {
      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'membrain_super_secret_jwt_key_2026_secure'
        );
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }

      const { rows } = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists.',
        });
      }

      req.user = rows[0];
      return next();
    }

    // Fallback: If no token provided, check if valid userId was passed in body/params
    const candidateUserId = req.body?.userId || req.params?.userId || req.query?.userId;
    if (candidateUserId && isValidUUID(candidateUserId)) {
      const { rows } = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [candidateUserId.trim()]
      );

      if (rows.length > 0) {
        req.user = rows[0];
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};
