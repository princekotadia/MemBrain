import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user
 * Method: POST
 * Route: /try/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, fullName, email, password } = req.body;
    const rawName = name || fullName;

    if (!rawName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const cleanName = String(rawName).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into Postgres
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at;`,
      [cleanName, cleanEmail, hashedPassword]
    );

    const newUser = result.rows[0];

    // NO Auto-Login on Register: Do NOT set a JWT cookie on registration
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please sign in.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Error in register controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during registration',
    });
  }
};

/**
 * Login user & set httpOnly JWT cookie
 * Method: POST
 * Route: /try/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const { rows } = await pool.query(
      'SELECT id, name, email, password, created_at FROM users WHERE email = $1',
      [cleanEmail]
    );

    const user = rows[0];

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Sign JWT token
    const payload = { id: user.id };
    const jwtSecret = process.env.JWT_SECRET || 'membrain_super_secret_jwt_key_2026_secure';
    const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
    const isProduction = process.env.NODE_ENV === 'production';

    return res
      .cookie('jwtToken', jwtToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    console.error('Error in login controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during login',
    });
  }
};

/**
 * Get current user profile from req.user
 * Method: GET
 * Route: /try/auth/profile
 */
export const profile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Error in profile controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
};

/**
 * Logout user & clear httpOnly cookie
 * Method: POST
 * Route: /try/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    return res
      .clearCookie('jwtToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
      })
      .status(200)
      .json({
        success: true,
        message: 'Logged out successfully',
      });
  } catch (error) {
    console.error('Error in logout controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log out',
    });
  }
};

