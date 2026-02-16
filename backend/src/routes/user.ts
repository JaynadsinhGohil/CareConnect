import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { authController } from '../controllers/auth.js';
import { userModel } from '../models/index.js';

const router = express.Router();

// Profile endpoints
router.patch('/profile', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const user = await userModel.update(userId, {
      first_name: firstName,
      last_name: lastName,
      phone: phone || undefined,
    } as any);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Support request endpoint
router.post('/support-request', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // For now, just log the support request
    // In a production app, you would save this to a database
    console.log('Support Request:', {
      userId,
      subject,
      message,
      category,
      timestamp: new Date().toISOString(),
    });

    // You could send an email here if needed
    res.json({
      message: 'Support request submitted successfully',
      requestId: `SR-${Date.now()}`,
    });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({ error: 'Failed to submit support request' });
  }
});

// Password change (alternative route)
router.post('/change-password', authMiddleware, authController.changePassword);

export default router;
