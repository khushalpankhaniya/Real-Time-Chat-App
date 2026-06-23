import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participant1: { type: String, required: true, ref: 'users' }, // lower Clerk ID
    participant2: { type: String, required: true, ref: 'users' }, // higher Clerk ID
  },
  { timestamps: true }
);

// Unique pair constraint — prevents duplicate conversations
conversationSchema.index({ participant1: 1, participant2: 1 }, { unique: true });

export const Conversation = mongoose.model('conversations', conversationSchema);
