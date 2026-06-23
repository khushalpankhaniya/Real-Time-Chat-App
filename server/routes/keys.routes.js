import express from 'express';
import { upsertPublicKey } from '../controllers/users.controllers.js';

const router = express.Router();

// POST /api/keys/public
router.post('/public', upsertPublicKey);

export default router;
