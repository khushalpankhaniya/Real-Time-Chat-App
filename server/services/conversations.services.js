import { Conversation } from '../models/conversations.js';
import { Message }      from '../models/messages.js';

const POPULATE_USER = '_id username displayName avatarUrl status lastSeenAt';

/**
 * Atomically find or create a conversation between two users.
 * Always stores participant1 = lexicographically lower ID.
 */
export const getOrCreateConversation = async (userId, contactId) => {
  const participant1 = userId < contactId ? userId : contactId;
  const participant2 = userId < contactId ? contactId : userId;

  const conversation = await Conversation.findOneAndUpdate(
    { participant1, participant2 },
    { participant1, participant2 },
    { upsert: true, new: true, runValidators: true }
  )
    .populate('participant1', POPULATE_USER)
    .populate('participant2', POPULATE_USER);

  return conversation;
};

/**
 * Return all conversations for a user, with the other participant and
 * the latest message attached. Sorted by latest activity desc.
 */
export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    $or: [{ participant1: userId }, { participant2: userId }],
  })
    .populate('participant1', POPULATE_USER)
    .populate('participant2', POPULATE_USER)
    .lean();

  // Attach latest message for each conversation
  const withLastMessage = await Promise.all(
    conversations.map(async (conv) => {
      const roomId = conv._id.toString();
      const lastMessage = await Message.findOne({ roomId })
        .sort({ sentAt: -1 })
        .select('ciphertext sentAt')
        .lean();

      const otherUser =
        conv.participant1._id === userId ? conv.participant2 : conv.participant1;

      return {
        _id:         conv._id,
        otherUser,
        lastMessage: lastMessage
          ? { ciphertext: lastMessage.ciphertext, sentAt: lastMessage.sentAt }
          : null,
        updatedAt: conv.updatedAt,
      };
    })
  );

  // Sort by latest message sentAt desc, fall back to conversation updatedAt
  withLastMessage.sort((a, b) => {
    const aTime = a.lastMessage ? a.lastMessage.sentAt : a.updatedAt;
    const bTime = b.lastMessage ? b.lastMessage.sentAt : b.updatedAt;
    return new Date(bTime) - new Date(aTime);
  });

  return withLastMessage;
};
