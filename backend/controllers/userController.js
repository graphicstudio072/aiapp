import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Conversation from '../models/Conversation.js';
import File from '../models/File.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    await ActivityLog.create({
      user: user._id,
      action: 'USER_PROFILE_UPDATE',
      details: 'User updated profile details',
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: req.user.role.name,
        status: user.status,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please specify current and new passwords' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      user: user._id,
      action: 'USER_PASSWORD_CHANGE',
      details: 'User updated security credentials',
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats & activity logs
// @route   GET /api/users/dashboard
// @access  Private
export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Counts
    const chatCount = await Conversation.countDocuments({ user: userId });
    const fileCount = await File.countDocuments({ user: userId });
    
    // Recent activity logs
    const logs = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent uploaded files
    const files = await File.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName mimeType size createdAt summary');

    res.json({
      success: true,
      stats: {
        totalChats: chatCount,
        totalFiles: fileCount,
        subscriptionPlan: req.user.subscription.plan,
        subscriptionActive: req.user.subscription.active
      },
      recentLogs: logs,
      recentFiles: files
    });
  } catch (error) {
    next(error);
  }
};
