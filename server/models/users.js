import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id:         { type: String, required: true },  // Clerk userId  e.g. "user_2abc123"
    username:    { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, trim: true, default: '' },
    bio:         { type: String, trim: true, default: '' },
    email:       { type: String, required: true, unique: true, trim: true },
    avatarUrl:   { type: String, default: '' },     // pulled from Clerk profile
    timezone:    { type: String, default: 'UTC' },
    status:      { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
    lastSeenAt:  { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    _id: false,  // we supply Clerk ID manually
  }
);

// Full-text index for username search / autocomplete
userSchema.index({ username: 'text' });

export const User = mongoose.model('users', userSchema);
