const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCurrentWeekMenu, submitFeedback, getMyMealPlan, selectMealPlan,
  publishMenu, getDishPerformance, logWaste, getLowRatedDishes,
  addDish, updateDish, deleteDish, getAllDishes
} = require('../controllers/messController');

// Public/Student routes
router.get('/current-week', protect, getCurrentWeekMenu);
router.post('/feedback', protect, authorize('student'), submitFeedback);
router.get('/meal-plan', protect, authorize('student'), getMyMealPlan);
router.post('/meal-plan/select', protect, authorize('student'), selectMealPlan);

// Mess Staff routes
router.post('/menu/publish', protect, authorize('mess_staff', 'admin'), publishMenu);
router.get('/dish-performance', protect, authorize('mess_staff', 'admin'), getDishPerformance);
router.post('/waste/log', protect, authorize('mess_staff', 'admin'), logWaste);
router.get('/low-rated-dishes', protect, authorize('mess_staff', 'admin'), getLowRatedDishes);

// Admin routes
router.post('/dishes', protect, authorize('admin'), addDish);
router.put('/dishes/:id', protect, authorize('admin'), updateDish);
router.delete('/dishes/:id', protect, authorize('admin'), deleteDish);
router.get('/dishes/all', protect, authorize('admin', 'mess_staff'), getAllDishes);

module.exports = router;
