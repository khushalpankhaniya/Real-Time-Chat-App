import express from 'express';
import {
  createOrGetConversation,
  listConversations,
  getConversationMessages,
} from '../controllers/conversations.controllers.js';

const router = express.Router();

router.post('/',                                   createOrGetConversation);
router.get('/',                                    listConversations);
router.get('/:conversationId/messages',            getConversationMessages);

export default router;
