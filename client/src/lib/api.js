// ── api.js ────────────────────────────────────────────────────────────────
// Centralised Axios calls so base URLs and endpoints live in one place.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE_URL });

/** Fetch all registered users */
export const fetchAllUsers = () => api.get('/api/users');

/** Fetch a single user profile by Clerk ID */
export const fetchUserById = (clerkId) => api.get(`/api/users/${clerkId}`);

/** Create or upsert a user profile */
export const saveUserProfile = (data) => api.post('/api/users', data);

/** Search users by query string, excluding the given userId */
export const searchUsers = (q, excludeId) =>
  api.get('/api/users/search', { params: { q, exclude: excludeId } });

/** Fetch the public key of any user (safe — server exposes this openly) */
export const fetchUserPubKey = (clerkId) => api.get(`/api/users/${clerkId}/pubkey`);

/** GET /api/conversations?userId=clerkId */
export const fetchConversations = (userId) =>
  api.get('/api/conversations', { params: { userId } });

/** POST /api/conversations — find or create a DM conversation */
export const createConversation = (userId, contactId) =>
  api.post('/api/conversations', { userId, contactId });

/** GET /api/conversations/:conversationId/messages */
export const fetchConversationMessages = (conversationId, params = {}) =>
  api.get(`/api/conversations/${conversationId}/messages`, { params });
