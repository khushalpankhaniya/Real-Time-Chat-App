import mongoose from 'mongoose';

/**
 * groups
 * ------------------------------------------------------------------
 * A group chat room.
 *
 * createdBy    – Clerk userId of the group creator.
 * name         – Display name shown in the sidebar.
 * avatarUrl    – Optional group avatar.
 * description  – Short blurb shown on the group info screen.
 * isDM         – true when this "group" is actually a two-person DM.
 *                DM roomId follows the pattern  dm_<lowerUserId>_<higherUserId>
 *                so it is deterministic and never duplicated.
 */
const groupSchema = new mongoose.Schema(
  {
    createdBy:   { type: String, required: true, ref: 'users' },
    name:        { type: String, required: true, trim: true },
    avatarUrl:   { type: String, default: '' },
    description: { type: String, default: '' },
    isDM:        { type: Boolean, default: false },
  },
  {
    timestamps: true,  // createdAt, updatedAt
  }
);

export const Group = mongoose.model('groups', groupSchema);
