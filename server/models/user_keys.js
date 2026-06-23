import mongoose from 'mongoose';

/**
 * user_keys  (one-to-one with users)
 * ------------------------------------------------------------------
 * Stores the NaCl keypair for each user.
 *
 * pubKey       – base64 X25519 public key. Safe to share with anyone.
 * encPrivKey   – private key encrypted with the user's PIN (AES-GCM).
 *                Optional backup. The server NEVER sees the raw private key.
 * keyVersion   – incremented each time the user rotates keys.
 */
const userKeysSchema = new mongoose.Schema(
  {
    userId:     { type: String, required: true, unique: true, ref: 'users' }, // Clerk ID
    pubKey:     { type: String, required: true },   // base64 NaCl public key
    encPrivKey: { type: String, default: '' },       // base64 AES-GCM-encrypted private key (PIN-locked)
    keyVersion: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    _id: true,
  }
);

export const UserKey = mongoose.model('user_keys', userKeysSchema);
