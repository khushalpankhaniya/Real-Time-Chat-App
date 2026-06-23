import mongoose from 'mongoose';

/**
 * media
 * ------------------------------------------------------------------
 * Tracks every encrypted file upload.
 *
 * roomId      – same roomId convention as messages (group id or dm_* string).
 *               Indexed so you can fetch all files shared in a room.
 *
 * uploaderId  – Clerk userId of the uploader.
 *
 * storageUrl  – URL of the encrypted blob on S3 (or any object store).
 *               The blob itself is AES-GCM encrypted before upload;
 *               the server never sees the raw file.
 *
 * encNonce    – base64 nonce the receiver needs to decrypt the blob.
 *
 * mimeType    – original MIME type (helps the client render previews).
 *
 * fileName    – original filename for download UX.
 *
 * sizeBytes   – unencrypted file size, for quota tracking.
 */
const mediaSchema = new mongoose.Schema(
  {
    roomId:     { type: String, required: true },
    uploaderId: { type: String, required: true, ref: 'users' },
    storageUrl: { type: String, required: true },
    encNonce:   { type: String, required: true },
    mimeType:   { type: String, default: 'application/octet-stream' },
    fileName:   { type: String, default: '' },
    sizeBytes:  { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'uploadedAt', updatedAt: false },
    _id: true,
  }
);

// Fast lookup: all media in a room
mediaSchema.index({ roomId: 1 });

export const Media = mongoose.model('media', mediaSchema);
