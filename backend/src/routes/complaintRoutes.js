const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  raiseComplaint, getMyComplaints, rateComplaint,
  getPendingComplaints, assignComplaint, updateStatus,
  getCategories, addCategory, getAnalytics
} = require('../controllers/complaintController');

// Student routes
router.post('/', protect, authorize('student'), raiseComplaint);
router.get('/my-complaints', protect, authorize('student'), getMyComplaints);
router.put('/:id/rate', protect, authorize('student'), rateComplaint);

// Shared/General routes
router.get('/categories', protect, getCategories);

// Warden/Admin routes
router.get('/pending', protect, authorize('warden', 'admin'), getPendingComplaints);
router.put('/:id/assign', protect, authorize('warden', 'admin'), assignComplaint);
router.put('/:id/status', protect, authorize('warden', 'admin', 'mess_staff'), updateStatus);

// Admin routes
router.post('/categories', protect, authorize('admin'), addCategory);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
