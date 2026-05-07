const db = require('../db/database');

// --- Student Endpoints ---

// @desc    Get weekly menu with ratings
// @route   GET /api/mess/current-week
// @access  Private
exports.getCurrentWeekMenu = async (req, res) => {
  try {
    const menus = await db.query(`
      SELECT m.*, d.name, d.category, d.cuisine_type, d.is_veg, d.avg_rating
      FROM menu_plans m
      JOIN dishes d ON m.dish_id = d.id
      WHERE m.week_start_date <= date('now', 'weekday 0', '-6 days') 
      -- Simplified for demo: return all recent or order by day
      ORDER BY m.day_of_week, m.meal_type
    `);
    
    // Group by day for frontend
    const formatted = menus.reduce((acc, item) => {
      if (!acc[item.day_of_week]) acc[item.day_of_week] = [];
      acc[item.day_of_week].push(item);
      return acc;
    }, {});

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit food feedback
// @route   POST /api/mess/feedback
// @access  Private (Student)
exports.submitFeedback = async (req, res) => {
  try {
    const { dish_id, meal_date, meal_type, taste_rating, quantity_rating, hygiene_rating, comment } = req.body;
    
    await db.execute(
      `INSERT INTO food_feedback 
      (student_id, dish_id, meal_date, meal_type, taste_rating, quantity_rating, hygiene_rating, comment) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, dish_id, meal_date, meal_type, taste_rating, quantity_rating, hygiene_rating, comment]
    );

    // Update dish avg rating
    const ratings = await db.queryOne(`
      SELECT AVG((taste_rating + quantity_rating + hygiene_rating) / 3.0) as avg 
      FROM food_feedback WHERE dish_id = ?
    `, [dish_id]);
    
    if (ratings && ratings.avg) {
      await db.execute('UPDATE dishes SET avg_rating = ? WHERE id = ?', [ratings.avg, dish_id]);
    }

    res.status(201).json({ success: true, message: 'Feedback submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get my meal plan
// @route   GET /api/mess/meal-plan
// @access  Private (Student)
exports.getMyMealPlan = async (req, res) => {
  try {
    const plan = await db.queryOne('SELECT * FROM meal_plans WHERE student_id = ? AND is_active = TRUE', [req.user.id]);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Select/change meal plan
// @route   POST /api/mess/meal-plan/select
// @access  Private (Student)
exports.selectMealPlan = async (req, res) => {
  try {
    const { plan_type } = req.body;
    
    // Deactivate old
    await db.execute('UPDATE meal_plans SET is_active = FALSE WHERE student_id = ?', [req.user.id]);
    
    // Insert new
    await db.execute(
      'INSERT INTO meal_plans (student_id, plan_type, start_date) VALUES (?, ?, date("now"))',
      [req.user.id, plan_type]
    );

    res.json({ success: true, message: 'Meal plan updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Mess Staff Endpoints ---

// @desc    Publish weekly menu
// @route   POST /api/mess/menu/publish
// @access  Private (Mess Staff)
exports.publishMenu = async (req, res) => {
  try {
    const { week_start_date, menu_items } = req.body; 
    // menu_items: [{ dish_id, meal_type, day_of_week }]
    
    for (let item of menu_items) {
      await db.execute(
        'INSERT INTO menu_plans (dish_id, meal_type, day_of_week, week_start_date, created_by) VALUES (?, ?, ?, ?, ?)',
        [item.dish_id, item.meal_type, item.day_of_week, week_start_date, req.user.id]
      );
    }
    res.status(201).json({ success: true, message: 'Menu published' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dish performance (ratings & waste)
// @route   GET /api/mess/dish-performance
// @access  Private (Mess Staff)
exports.getDishPerformance = async (req, res) => {
  try {
    const performance = await db.query(`
      SELECT d.id, d.name, d.category, d.avg_rating, 
             COUNT(f.id) as feedback_count,
             COALESCE(SUM(w.leftover_quantity_kg), 0) as total_waste
      FROM dishes d
      LEFT JOIN food_feedback f ON d.id = f.dish_id
      LEFT JOIN menu_plans m ON d.id = m.dish_id
      LEFT JOIN waste_logs w ON m.id = w.menu_plan_id
      GROUP BY d.id
    `);
    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Log leftover quantity
// @route   POST /api/mess/waste/log
// @access  Private (Mess Staff)
exports.logWaste = async (req, res) => {
  try {
    const { menu_plan_id, meal_date, meal_type, leftover_quantity_kg, notes } = req.body;
    
    // Calculate cost
    const menuPlan = await db.queryOne(`
      SELECT d.base_cost FROM menu_plans m JOIN dishes d ON m.dish_id = d.id WHERE m.id = ?
    `, [menu_plan_id]);
    
    let cost = 0;
    if (menuPlan && menuPlan.base_cost) {
      cost = leftover_quantity_kg * menuPlan.base_cost * 1.2;
    }

    await db.execute(
      `INSERT INTO waste_logs (menu_plan_id, meal_date, meal_type, leftover_quantity_kg, estimated_cost_wasted, notes, logged_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [menu_plan_id, meal_date, meal_type, leftover_quantity_kg, cost, notes, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Waste logged successfully', estimated_cost: cost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Low rated dishes
// @route   GET /api/mess/low-rated-dishes
// @access  Private (Mess Staff)
exports.getLowRatedDishes = async (req, res) => {
  try {
    const dishes = await db.query('SELECT * FROM dishes WHERE avg_rating > 0 AND avg_rating < 3.0');
    res.json({ success: true, data: dishes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Admin Endpoints ---

// @desc    Add new dish
// @route   POST /api/mess/dishes
// @access  Private (Admin)
exports.addDish = async (req, res) => {
  try {
    const { name, category, cuisine_type, is_veg, base_cost, nutrition_info } = req.body;
    await db.execute(
      'INSERT INTO dishes (name, category, cuisine_type, is_veg, base_cost, nutrition_info) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, cuisine_type, is_veg, base_cost, nutrition_info]
    );
    res.status(201).json({ success: true, message: 'Dish added' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update dish
// @route   PUT /api/mess/dishes/:id
// @access  Private (Admin)
exports.updateDish = async (req, res) => {
  try {
    const { name, category, cuisine_type, is_veg, base_cost, nutrition_info } = req.body;
    await db.execute(
      'UPDATE dishes SET name=?, category=?, cuisine_type=?, is_veg=?, base_cost=?, nutrition_info=? WHERE id=?',
      [name, category, cuisine_type, is_veg, base_cost, nutrition_info, req.params.id]
    );
    res.json({ success: true, message: 'Dish updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete dish
// @route   DELETE /api/mess/dishes/:id
// @access  Private (Admin)
exports.deleteDish = async (req, res) => {
  try {
    await db.execute('DELETE FROM dishes WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Dish removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all dishes
// @route   GET /api/mess/dishes/all
// @access  Private (Admin, Mess Staff)
exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await db.query('SELECT * FROM dishes');
    res.json({ success: true, data: dishes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
