import express from 'express';
import { getRoomHistory } from '../controllers/messages.controllers.js';

const router = express.Router();

// GET /api/messages/:roomId?before=<timestamp>&limit=<n>
router.get('/:roomId', getRoomHistory);

export default router;
