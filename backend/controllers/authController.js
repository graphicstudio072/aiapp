import User from '../models/User.js';
import Role from '../models/Role.js';
import ActivityLog from '../models/ActivityLog.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345!', {
    expiresIn: '30d'
  });
};

const createActivityLog = async (userId, action, details, req) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to create activity log:', error.message);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Default to User role, or create role if it doesn't exist
    let roleObj = await Role.findOne({ name: 'User' });
    if (!roleObj) {
      // Fallback in case roles are not seeded yet
      roleObj = await Role.create({ name: 'User', description: 'Standard user access' });
    }

    // If this is the first user ever, make them Admin
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      let adminRole = await Role.findOne({ name: 'Admin' });
      if (!adminRole) {
        adminRole = await Role.create({ name: 'Admin', description: 'Administrative access', permissions: ['all'] });
      }
      roleObj = adminRole;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: roleObj._id
    });

    const token = generateToken(user._id);
    await createActivityLog(user._id, 'USER_REGISTER', 'User account registered', req);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleObj.name,
        status: user.status,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password' });
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact admin.' });
    }

    const token = generateToken(user._id);
    await createActivityLog(user._id, 'USER_LOGIN', 'User logged in successfully', req);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        status: user.status,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        status: user.status,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password (direct bypass for demo / password reset request)
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please specify email and new password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with this email' });
    }

    user.password = password;
    await user.save();
    
    await createActivityLog(user._id, 'USER_PASSWORD_RESET', 'Password was successfully reset', req);

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};
