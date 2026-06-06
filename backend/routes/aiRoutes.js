import express from 'express';
import { 
  getConversations, 
  getConversationMessages, 
  createConversation, 
  deleteConversation, 
  sendChatMessage 
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id/messages', protect, getConversationMessages);
router.delete('/conversations/:id', protect, deleteConversation);
router.post('/chat', protect, sendChatMessage);

export default router;
