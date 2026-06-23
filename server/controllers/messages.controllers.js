import { Message } from '../models/messages.js';

/**
 * GET /api/messages/:roomId
 * Returns the last `limit` messages before `before` timestamp.
 * Supports cursor-based pagination for infinite scroll later.
 */
export const getRoomHistory = async (req, res) => {
  try {
    const { roomId }  = req.params;
    const limit       = Math.min(parseInt(req.query.limit) || 50, 100);
    const before      = req.query.before ? new Date(req.query.before) : new Date();

    const messages = await Message.find({ roomId, sentAt: { $lt: before } })
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();

    // Return chronological order (oldest first)
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
