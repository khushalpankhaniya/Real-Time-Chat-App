import mongoose from 'mongoose';

/**
 * group_members  (many-to-many join between groups ↔ users)
 * ------------------------------------------------------------------
 * encKeyForMember – the group's symmetric key wrapped (NaCl box-sealed)
 *                   with *this member's* public key.
 *                   The server stores only the encrypted blob; it never
 *                   sees the raw symmetric key.
 *
 * role            – 'admin' can add/remove members and update group info.
 *                   'member' is the default.
 *
 * joinedAt        – when the user joined (or was added to) the group.
 */
const groupMemberSchema = new mongoose.Schema(
  {
    groupId:          { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'groups' },
    userId:           { type: String, required: true, ref: 'users' },
    encKeyForMember:  { type: String, required: true },  // base64 sealed box (group key → member pubKey)
    role:             { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt:         { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    _id: true,
  }
);

// Prevent duplicate membership rows
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

// Fast lookup: "which groups is this user in?"
groupMemberSchema.index({ userId: 1 });

export const GroupMember = mongoose.model('group_members', groupMemberSchema);
