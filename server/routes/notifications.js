import express from 'express';
import NotificationService from '../services/notificationService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null
    } = req.query;
    
    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type
    });
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
});

// Get unread notification count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const unreadCount = await NotificationService.getUserNotifications(userId, {
      limit: 1 // We only need the count
    });
    
    res.json({
      success: true,
      unreadCount: unreadCount.unreadCount
    });
    
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification count'
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;
    
    const notification = await NotificationService.markAsRead(notificationId, userId);
    
    res.json({
      success: true,
      notification
    });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const modifiedCount = await NotificationService.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: `Marked ${modifiedCount} notifications as read`
    });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;
    
    const deleted = await NotificationService.deleteNotification(notificationId, userId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Admin Routes
const adminRouter = express.Router();

// Send broadcast notification (Admin only)
adminRouter.post('/broadcast', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { title, message, priority, actionUrl } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    const result = await NotificationService.createBroadcastNotification(user._id, {
      title,
      message,
      priority,
      actionUrl
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast notification'
    });
  }
});

// Get admin notification stats
adminRouter.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Get notification statistics
    const Notification = (await import('../models/Notification.js')).default;
    
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);
    
    const totalNotifications = await Notification.countDocuments();
    const totalUnread = await Notification.countDocuments({ isRead: false });
    
    res.json({
      success: true,
      stats: {
        total: totalNotifications,
        totalUnread,
        byType: stats
      }
    });
    
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats'
    });
  }
});

export { adminRouter };
export default router;
