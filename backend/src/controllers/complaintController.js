const db = require('../db/database');

// --- Student Endpoints ---

// @desc    Raise new complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.raiseComplaint = async (req, res) => {
  try {
    const { category_id, priority, title, description, photo_url } = req.body;
    
    await db.execute(
      `INSERT INTO complaints (student_id, category_id, priority, title, description, photo_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id, priority, title, description, photo_url]
    );

    res.status(201).json({ success: true, message: 'Complaint raised successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get my complaints
// @route   GET /api/complaints/my-complaints
// @access  Private (Student)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await db.query(`
      SELECT c.*, cat.category_name 
      FROM complaints c
      JOIN complaint_categories cat ON c.category_id = cat.id
      WHERE c.student_id = ?
      ORDER BY c.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Rate resolved complaint
// @route   PUT /api/complaints/:id/rate
// @access  Private (Student)
exports.rateComplaint = async (req, res) => {
  try {
    const { rating } = req.body;
    await db.execute(
      'UPDATE complaints SET rating = ? WHERE id = ? AND student_id = ? AND status = "resolved"',
      [rating, req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Complaint rated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Warden Endpoints ---

// @desc    Get unassigned complaints
// @route   GET /api/complaints/pending
// @access  Private (Warden, Admin)
exports.getPendingComplaints = async (req, res) => {
  try {
    const complaints = await db.query(`
      SELECT c.*, cat.category_name, u.name as student_name 
      FROM complaints c
      JOIN complaint_categories cat ON c.category_id = cat.id
      JOIN users u ON c.student_id = u.id
      WHERE c.status = 'raised' OR c.status = 'assigned'
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Assign to staff member
// @route   PUT /api/complaints/:id/assign
// @access  Private (Warden, Admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { assigned_to } = req.body;
    await db.execute(
      'UPDATE complaints SET assigned_to = ?, status = "assigned", assigned_date = date("now") WHERE id = ?',
      [assigned_to, req.params.id]
    );
    res.json({ success: true, message: 'Complaint assigned' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update status
// @route   PUT /api/complaints/:id/status
// @access  Private (Warden, Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, resolution_notes } = req.body;
    let query = 'UPDATE complaints SET status = ?, resolution_notes = ?';
    let params = [status, resolution_notes];
    
    if (status === 'resolved') {
      query += ', resolved_date = date("now")';
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.execute(query, params);
    res.json({ success: true, message: `Complaint marked as ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Admin Endpoints ---

// @desc    Get all categories
// @route   GET /api/complaints/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM complaint_categories');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add new category
// @route   POST /api/complaints/categories
// @access  Private (Admin)
exports.addCategory = async (req, res) => {
  try {
    const { category_name, priority_level } = req.body;
    await db.execute(
      'INSERT INTO complaint_categories (category_name, priority_level) VALUES (?, ?)',
      [category_name, priority_level]
    );
    res.status(201).json({ success: true, message: 'Category added' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Category-wise stats & resolution time
// @route   GET /api/complaints/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const categoryStats = await db.query(`
      SELECT cat.category_name, COUNT(c.id) as count
      FROM complaints c
      JOIN complaint_categories cat ON c.category_id = cat.id
      GROUP BY cat.id
    `);
    
    res.json({ success: true, data: { categoryStats } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
