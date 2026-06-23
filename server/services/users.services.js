import { User }    from '../models/users.js';
import { UserKey } from '../models/user_keys.js';

/**
 * Create or update a user profile.
 * If a pubKey is supplied it is saved to user_keys (not on the user document).
 */
export const saveUserProfile = async (profileData) => {
  const { clerkId, username, displayName, bio, email, pubKey, avatarUrl, timezone } = profileData;

  if (!clerkId || !email) throw new Error('Clerk ID and email are required');

  // Guard: username taken by someone else
  if (username) {
    const conflict = await User.findOne({ username: username.trim() });
    if (conflict && conflict._id !== clerkId) throw new Error('Username is already taken');
  }

  // Upsert user row
  const user = await User.findOneAndUpdate(
    { _id: clerkId },
    {
      username:    username?.trim(),
      displayName: displayName?.trim(),
      bio:         bio?.trim(),
      email:       email.trim(),
      avatarUrl:   avatarUrl || '',
      timezone:    timezone || 'UTC',
      status:      'online',
      lastSeenAt:  new Date(),
    },
    { returnDocument: 'after', upsert: true, runValidators: true }
  );

  // Upsert key record if a public key was provided
  if (pubKey) {
    await UserKey.findOneAndUpdate(
      { userId: clerkId },
      { pubKey },
      { upsert: true, runValidators: true }
    );
  }

  return user;
};

export const getUserProfileById = async (clerkId) => {
  return User.findById(clerkId);
};

export const getAllUserProfiles = async () => {
  return User.find({});
};

/** Return the public key for a user (safe to expose to other users) */
export const getPublicKey = async (clerkId) => {
  return UserKey.findOne({ userId: clerkId }, 'pubKey keyVersion');
};

/**
 * Case-insensitive contains search on username.
 * Excludes the requesting user if excludeId is provided.
 * Returns max 20 results with safe public fields only.
 */
export const searchUsers = async (query, excludeId) => {
  if (!query || !query.trim()) return [];

  const filter = {
    username: { $regex: query.trim(), $options: 'i' },
  };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return User.find(filter)
    .select('_id username displayName avatarUrl status lastSeenAt')
    .limit(20)
    .lean();
};

/**
 * Upsert user + key in one call (used by POST /api/users/sync).
 * Identical to saveUserProfile — kept as a named alias for clarity.
 */
export const syncUser = saveUserProfile;
