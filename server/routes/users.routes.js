import express from 'express';
import {
  createUserProfile,
  syncUserProfile,
  getUserProfile,
  getAllUsers,
  getUserPubKey,
  searchUsersHandler,
} from '../controllers/users.controllers.js';

const router = express.Router();

// NOTE: /search and /sync must be registered BEFORE /:clerkId
// so they are not swallowed as a clerkId param.
router.post('/sync',               syncUserProfile);        // POST /api/users/sync
router.get('/search',              searchUsersHandler);     // GET  /api/users/search?q=&exclude=
router.post('/',                   createUserProfile);      // POST /api/users (legacy)
router.get('/',                    getAllUsers);             // GET  /api/users
router.get('/:clerkId',            getUserProfile);         // GET  /api/users/:clerkId
router.get('/:clerkId/pubkey',     getUserPubKey);          // GET  /api/users/:clerkId/pubkey

export default router;
