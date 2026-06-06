import express from 'express';
import { 
  getAdminStats, 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getAllConversations, 
  deleteUserConversation,
  getSystemLogs, 
  getDatabaseMetrics, 
  purgeActivityLogs, 
  getSystemSettings, 
  updateSystemSettings 
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin check to all routes in this file
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/conversations', getAllConversations);
router.delete('/conversations/:id', deleteUserConversation);
router.get('/logs', getSystemLogs);
router.get('/database', getDatabaseMetrics);
router.delete('/database/purge-logs', purgeActivityLogs);
router.get('/settings', getSystemSettings);
router.post('/settings', updateSystemSettings);

export default router;
