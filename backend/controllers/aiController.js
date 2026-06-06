import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateChatResponse } from '../utils/openai.js';

// @desc    Get user conversations
// @route   GET /api/ai/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for conversation
// @route   GET /api/ai/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!convo) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new conversation
// @route   POST /api/ai/conversations
// @access  Private
export const createConversation = async (req, res, next) => {
  const { title } = req.body;

  try {
    const convo = await Conversation.create({
      title: title || 'New Chat',
      user: req.user.id
    });
    res.status(201).json({ success: true, conversation: convo });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete conversation
// @route   DELETE /api/ai/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!convo) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    await Message.deleteMany({ conversation: convo._id });
    await Conversation.deleteOne({ _id: convo._id });

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send chat message
// @route   POST /api/ai/chat
// @access  Private
export const sendChatMessage = async (req, res, next) => {
  const { conversationId, content } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, error: 'Please enter a message' });
    }

    let convo = null;

    if (conversationId) {
      convo = await Conversation.findOne({ _id: conversationId, user: req.user.id });
      if (!convo) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
    } else {
      // Auto-create new conversation
      const truncatedTitle = content.split(' ').slice(0, 5).join(' ') + (content.split(' ').length > 5 ? '...' : '');
      convo = await Conversation.create({
        title: truncatedTitle || 'New Chat',
        user: req.user.id
      });
    }

    // Save user message in DB
    const userMessage = await Message.create({
      conversation: convo._id,
      role: 'user',
      content: content
    });

    // Fetch message history for AI context
    const previousMessages = await Message.find({ conversation: convo._id })
      .sort({ createdAt: 1 })
      .limit(20);

    const apiMessages = previousMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Call OpenAI
    const aiTextResponse = await generateChatResponse(apiMessages);

    // Save AI response in DB
    const aiMessage = await Message.create({
      conversation: convo._id,
      role: 'assistant',
      content: aiTextResponse
    });

    // Update conversation timestamp
    convo.updatedAt = Date.now();
    await convo.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'AI_CHAT_MESSAGE',
      details: `Chat message sent in conversation: "${convo.title}"`,
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      conversation: convo,
      userMessage,
      aiMessage
    });
  } catch (error) {
    next(error);
  }
};
