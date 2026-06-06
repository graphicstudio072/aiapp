import User from '../models/User.js';
import Role from '../models/Role.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import File from '../models/File.js';
import ActivityLog from '../models/ActivityLog.js';
import Setting from '../models/Setting.js';
import mongoose from 'mongoose';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const activeUsers = totalUsers - suspendedUsers;

    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalFiles = await File.countDocuments();

    // Sum file storage size
    const fileStats = await File.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);
    const totalSizeInBytes = fileStats[0]?.totalSize || 0;
    const totalSizeInMB = (totalSizeInBytes / (1024 * 1024)).toFixed(2);

    // Get Subscription plans distribution
    const subscriptions = await User.aggregate([
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
    ]);

    // Action types distribution for charts
    const logsDistribution = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        conversations: totalConversations,
        messages: totalMessages,
        files: { count: totalFiles, sizeMB: parseFloat(totalSizeInMB) },
        subscriptions: subscriptions.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        logsDistribution: logsDistribution.map(l => ({ action: l._id, count: l.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: List users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('role', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Create user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  const { name, email, password, roleName, subscriptionPlan } = req.body;

  try {
    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ success: false, error: 'Please enter all required fields' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role._id,
      subscription: {
        plan: subscriptionPlan || 'Free',
        active: true
      }
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_CREATE_USER',
      details: `Created user account: ${email} with role ${roleName}`,
      ipAddress: req.ip || ''
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  const { name, email, roleName, status, subscriptionPlan } = req.body;

  try {
    const user = await User.findById(req.params.id);
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
    if (status) user.status = status;
    
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (role) {
        user.role = role._id;
      }
    }

    if (subscriptionPlan) {
      user.subscription.plan = subscriptionPlan;
    }

    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_UPDATE_USER',
      details: `Updated user account: ${user.email}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Users: Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot delete yourself!' });
    }

    // Cascade deletions for this user
    await File.deleteMany({ user: user._id });
    const convos = await Conversation.find({ user: user._id });
    for (let c of convos) {
      await Message.deleteMany({ conversation: c._id });
    }
    await Conversation.deleteMany({ user: user._id });
    await ActivityLog.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_DELETE_USER',
      details: `Deleted user account: ${user.email} and all historical records`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'User deleted successfully along with all related logs, files, and chats' });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Conversations: List all conversations
// @route   GET /api/admin/conversations
// @access  Private/Admin
export const getAllConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Conversations: Delete a conversation
// @route   DELETE /api/admin/conversations/:id
// @access  Private/Admin
export const deleteUserConversation = async (req, res, next) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    await Message.deleteMany({ conversation: convo._id });
    await Conversation.deleteOne({ _id: convo._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_DELETE_CONVO',
      details: `Deleted conversation: "${convo.title}"`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    View System Logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getSystemLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Database monitoring
// @route   GET /api/admin/database
// @access  Private/Admin
export const getDatabaseMetrics = async (req, res, next) => {
  try {
    const collections = [
      { name: 'Users', count: await User.countDocuments() },
      { name: 'Roles', count: await Role.countDocuments() },
      { name: 'Conversations', count: await Conversation.countDocuments() },
      { name: 'Messages', count: await Message.countDocuments() },
      { name: 'Files', count: await File.countDocuments() },
      { name: 'Settings', count: await Setting.countDocuments() },
      { name: 'ActivityLogs', count: await ActivityLog.countDocuments() }
    ];

    res.json({
      success: true,
      collections,
      dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      host: mongoose.connection.host
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear Activity Logs older than 30 days
// @route   DELETE /api/admin/database/purge-logs
// @access  Private/Admin
export const purgeActivityLogs = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await ActivityLog.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_PURGE_LOGS',
      details: `Purged ${result.deletedCount} logs older than 30 days`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: `Successfully deleted ${result.deletedCount} historical logs.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All System Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSystemSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Create System Settings
// @route   POST /api/admin/settings
// @access  Private/Admin
export const updateSystemSettings = async (req, res, next) => {
  const { key, value, description } = req.body;

  try {
    if (!key) {
      return res.status(400).json({ success: false, error: 'Key is required' });
    }

    let setting = await Setting.findOne({ key });
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    } else {
      setting = await Setting.create({ key, value, description });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'ADMIN_UPDATE_SETTINGS',
      details: `Updated system configuration key: ${key}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, setting });
  } catch (error) {
    next(error);
  }
};
