import mongoose from 'mongoose';

/**
 * messages
 * ------------------------------------------------------------------
 * The server NEVER stores plaintext. Every message body is ciphertext.
 *
 * roomId      – group ObjectId (toString) for group chats, or the
 *               deterministic string  dm_<lowerUserId>_<higherUserId>
 *               for direct messages. No separate DM collection needed.
 *
 * senderId    – Clerk userId of the sender.
 *
 * ciphertext  – base64 NaCl-box / secretbox encrypted message body.
 *
 * nonce       – base64 NaCl nonce that pairs with this ciphertext.
 *               Receiver needs both ciphertext + nonce to decrypt.
 *
 * mediaId     – optional ref to a media document if the message
 *               contains a file attachment.
 *
 * sentAt      – indexed descending with roomId for fast history pages.
 */
const messageSchema = new mongoose.Schema(
  {
    roomId:     { type: String, required: true },
    senderId:   { type: String, required: true, ref: 'users' },
    ciphertext: { type: String, required: true },
    nonce:      { type: String, default: '' },
    mediaId:    { type: mongoose.Schema.Types.ObjectId, ref: 'media', default: null },
    sentAt:     { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    _id: true,
  }
);

// Primary query pattern: paginated history for a room, newest first
messageSchema.index({ roomId: 1, sentAt: -1 });

export const Message = mongoose.model('messages', messageSchema);
