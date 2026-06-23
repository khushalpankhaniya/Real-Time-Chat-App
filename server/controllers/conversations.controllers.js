import {
  getOrCreateConversation,
  getUserConversations,
} from '../services/conversations.services.js';
import { Message } from '../models/messages.js';

/**
 * POST /api/conversations
 * Body: { userId, contactId }
 */
export const createOrGetConversation = async (req, res) => {
  try {
    const { userId, contactId } = req.body;
    if (!userId || !contactId) {
      return res.status(400).json({ message: 'userId and contactId are required' });
    }
    const conversation = await getOrCreateConversation(userId, contactId);
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/conversations?userId=clerkId
 */
export const listConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId query param is required' });
    }
    const conversations = await getUserConversations(userId);
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/conversations/:conversationId/messages?before=&limit=50
 */
export const getConversationMessages = async (req, res) => {
  try {
    const roomId = req.params.conversationId;
    const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before ? new Date(req.query.before) : new Date();

    const messages = await Message.find({ roomId, sentAt: { $lt: before } })
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
