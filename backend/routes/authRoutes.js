import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile, 
  googleAuth, 
  sendOTP, 
  verifyOTP,
  getSmsConfig,
  saveSmsConfig
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/sms-config', getSmsConfig);
router.post('/sms-config', saveSmsConfig);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
