import {
  saveUserProfile,
  syncUser,
  getUserProfileById,
  getAllUserProfiles,
  getPublicKey,
  searchUsers,
} from '../services/users.services.js';
import { UserKey } from '../models/user_keys.js';

/** POST /api/users — legacy upsert (kept for compatibility) */
export const createUserProfile = async (req, res) => {
  try {
    const user = await saveUserProfile(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** POST /api/users/sync — primary upsert used by the client */
export const syncUserProfile = async (req, res) => {
  try {
    const user = await syncUser(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await getUserProfileById(req.params.clerkId);
    if (!user) return res.status(404).json({ message: 'User profile not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUserProfiles();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/users/:clerkId/pubkey — safe to call from any authenticated client */
export const getUserPubKey = async (req, res) => {
  try {
    const keyRecord = await getPublicKey(req.params.clerkId);
    if (!keyRecord) return res.status(404).json({ message: 'Public key not found' });
    res.status(200).json(keyRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/users/search?q=<username>&exclude=<clerkId>
 * Returns up to 20 users whose username contains q (case-insensitive).
 */
export const searchUsersHandler = async (req, res) => {
  try {
    const { q, exclude } = req.query;
    if (!q) return res.status(400).json({ message: 'q query param is required' });
    const users = await searchUsers(q, exclude);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/keys/public
 * Body: { userId, pubKey }
 */
export const upsertPublicKey = async (req, res) => {
  try {
    const { userId, pubKey } = req.body;
    if (!userId || !pubKey) {
      return res.status(400).json({ message: 'userId and pubKey are required' });
    }
    await UserKey.findOneAndUpdate(
      { userId },
      { pubKey },
      { upsert: true, runValidators: true }
    );
    res.status(200).json({ userId, pubKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
