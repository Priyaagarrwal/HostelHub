const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  applyHostel, getMyApplication, getMyAllotment, requestRoomTransfer,
  getPendingApplications, autoAllotRoom, getVacantRooms, approveTransfer, getOccupancy,
  createHostel, updateHostel, deleteHostel, addBlock, bulkAddRooms,
  getAllHostels, getAllBlocks
} = require('../controllers/hostelController');

// Student routes
router.post('/apply', protect, authorize('student'), applyHostel);
router.get('/my-application', protect, authorize('student'), getMyApplication);
router.get('/my-allotment', protect, authorize('student'), getMyAllotment);
router.post('/room-transfer', protect, authorize('student'), requestRoomTransfer);

// Warden & Admin routes
router.get('/pending-applications', protect, authorize('warden', 'admin'), getPendingApplications);
router.post('/auto-allot/:appId', protect, authorize('warden', 'admin'), autoAllotRoom);
router.get('/vacant-rooms', protect, authorize('warden', 'admin'), getVacantRooms);
router.put('/room-transfer/:id/approve', protect, authorize('warden', 'admin'), approveTransfer);
router.get('/occupancy/:blockId', protect, authorize('warden', 'admin'), getOccupancy);

// Admin only routes
router.post('/', protect, authorize('admin'), createHostel);
router.get('/', protect, getAllHostels); // added to list hostels
router.get('/blocks', protect, getAllBlocks); // added to list blocks
router.put('/:id', protect, authorize('admin'), updateHostel);
router.delete('/:id', protect, authorize('admin'), deleteHostel);
router.post('/blocks', protect, authorize('admin'), addBlock);
router.post('/rooms/bulk', protect, authorize('admin'), bulkAddRooms);

module.exports = router;
