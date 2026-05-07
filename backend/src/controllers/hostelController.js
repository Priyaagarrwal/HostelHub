const db = require('../db/database');

// --- Student Endpoints ---

// @desc    Submit hostel application
// @route   POST /api/hostel/apply
// @access  Private (Student)
exports.applyHostel = async (req, res) => {
  try {
    const { preferred_hostel_id, preferred_room_type, preferred_roommate_name, notes } = req.body;
    
    // Check if already applied
    const existing = await db.queryOne('SELECT * FROM hostel_applications WHERE student_id = ? AND status IN ("pending", "approved")', [req.user.id]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Application already exists' });
    }

    await db.execute(
      'INSERT INTO hostel_applications (student_id, preferred_hostel_id, preferred_room_type, preferred_roommate_name, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, preferred_hostel_id, preferred_room_type, preferred_roommate_name, notes]
    );

    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Check application status
// @route   GET /api/hostel/my-application
// @access  Private (Student)
exports.getMyApplication = async (req, res) => {
  try {
    const application = await db.queryOne(`
      SELECT a.*, h.name as hostel_name 
      FROM hostel_applications a 
      LEFT JOIN hostels h ON a.preferred_hostel_id = h.id
      WHERE a.student_id = ? 
      ORDER BY a.applied_date DESC LIMIT 1
    `, [req.user.id]);
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    View allotted room
// @route   GET /api/hostel/my-allotment
// @access  Private (Student)
exports.getMyAllotment = async (req, res) => {
  try {
    const allotment = await db.queryOne(`
      SELECT a.*, r.room_number, r.room_type, b.block_name, h.name as hostel_name
      FROM allotments a
      JOIN rooms r ON a.room_id = r.id
      JOIN blocks b ON r.block_id = b.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE a.student_id = ? AND a.is_active = TRUE
    `, [req.user.id]);
    
    res.json({ success: true, data: allotment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Request room change
// @route   POST /api/hostel/room-transfer
// @access  Private (Student)
exports.requestRoomTransfer = async (req, res) => {
  try {
    const { requested_room_id, reason } = req.body;
    
    const allotment = await db.queryOne('SELECT room_id FROM allotments WHERE student_id = ? AND is_active = TRUE', [req.user.id]);
    if (!allotment) {
      return res.status(400).json({ success: false, error: 'You do not have an active room allotment' });
    }

    await db.execute(
      'INSERT INTO room_change_requests (student_id, current_room_id, requested_room_id, reason) VALUES (?, ?, ?, ?)',
      [req.user.id, allotment.room_id, requested_room_id, reason]
    );

    res.status(201).json({ success: true, message: 'Room transfer requested successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Warden/Admin Endpoints ---

// @desc    List all pending apps
// @route   GET /api/hostel/pending-applications
// @access  Private (Warden, Admin)
exports.getPendingApplications = async (req, res) => {
  try {
    const apps = await db.query(`
      SELECT a.*, u.name as student_name, u.email, h.name as preferred_hostel
      FROM hostel_applications a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN hostels h ON a.preferred_hostel_id = h.id
      WHERE a.status = 'pending'
    `);
    res.json({ success: true, data: apps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Auto-assign room
// @route   POST /api/hostel/auto-allot/:appId
// @access  Private (Warden, Admin)
exports.autoAllotRoom = async (req, res) => {
  try {
    const appId = req.params.appId;
    
    // Get application details
    const app = await db.queryOne('SELECT * FROM hostel_applications WHERE id = ?', [appId]);
    if (!app || app.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Invalid or non-pending application' });
    }

    // Find best available room matching preferences (hostel and type)
    let roomQuery = `
      SELECT r.id 
      FROM rooms r
      JOIN blocks b ON r.block_id = b.id
      WHERE r.current_occupancy < r.capacity AND r.is_available = TRUE
    `;
    let params = [];

    if (app.preferred_hostel_id) {
      roomQuery += ` AND b.hostel_id = ?`;
      params.push(app.preferred_hostel_id);
    }
    if (app.preferred_room_type) {
      roomQuery += ` AND r.room_type = ?`;
      params.push(app.preferred_room_type);
    }
    
    roomQuery += ` LIMIT 1`;
    
    let room = await db.queryOne(roomQuery, params);
    
    // Fallback: any available room
    if (!room) {
      room = await db.queryOne('SELECT id FROM rooms WHERE current_occupancy < capacity AND is_available = TRUE LIMIT 1');
    }

    if (!room) {
      return res.status(400).json({ success: false, error: 'No rooms available' });
    }

    // Create allotment
    await db.execute(
      'INSERT INTO allotments (student_id, room_id, application_id) VALUES (?, ?, ?)',
      [app.student_id, room.id, appId]
    );

    // Update room occupancy
    await db.execute('UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?', [room.id]);
    
    // Update application status
    await db.execute('UPDATE hostel_applications SET status = "allotted" WHERE id = ?', [appId]);

    res.json({ success: true, message: 'Room auto-allotted successfully', room_id: room.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    List all vacant rooms
// @route   GET /api/hostel/vacant-rooms
// @access  Private (Warden, Admin)
exports.getVacantRooms = async (req, res) => {
  try {
    const rooms = await db.query(`
      SELECT r.*, b.block_name, h.name as hostel_name
      FROM rooms r
      JOIN blocks b ON r.block_id = b.id
      JOIN hostels h ON b.hostel_id = h.id
      WHERE r.current_occupancy < r.capacity AND r.is_available = TRUE
    `);
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve transfer
// @route   PUT /api/hostel/room-transfer/:id/approve
// @access  Private (Warden, Admin)
exports.approveTransfer = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await db.queryOne('SELECT * FROM room_change_requests WHERE id = ?', [requestId]);
    
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Invalid transfer request' });
    }

    // Check if requested room has space
    const requestedRoom = await db.queryOne('SELECT * FROM rooms WHERE id = ?', [request.requested_room_id]);
    if (requestedRoom.current_occupancy >= requestedRoom.capacity) {
      return res.status(400).json({ success: false, error: 'Requested room is full' });
    }

    // Update old room
    await db.execute('UPDATE rooms SET current_occupancy = current_occupancy - 1 WHERE id = ?', [request.current_room_id]);
    // Update new room
    await db.execute('UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?', [request.requested_room_id]);
    
    // Update allotment
    await db.execute('UPDATE allotments SET room_id = ? WHERE student_id = ? AND is_active = TRUE', [request.requested_room_id, request.student_id]);
    
    // Update request status
    await db.execute('UPDATE room_change_requests SET status = "approved", reviewed_by = ? WHERE id = ?', [req.user.id, requestId]);

    res.json({ success: true, message: 'Transfer approved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get occupancy percentage
// @route   GET /api/hostel/occupancy/:blockId
// @access  Private (Warden, Admin)
exports.getOccupancy = async (req, res) => {
  try {
    const { blockId } = req.params;
    const stats = await db.queryOne(`
      SELECT SUM(capacity) as total_capacity, SUM(current_occupancy) as total_occupied
      FROM rooms WHERE block_id = ?
    `, [blockId]);
    
    const percentage = stats.total_capacity > 0 ? (stats.total_occupied / stats.total_capacity) * 100 : 0;
    
    res.json({ success: true, data: { percentage: percentage.toFixed(2), ...stats } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Admin Only Endpoints ---

// @desc    Create new hostel
// @route   POST /api/hostel
// @access  Private (Admin)
exports.createHostel = async (req, res) => {
  try {
    const { name, address, warden_id, total_blocks } = req.body;
    const result = await db.execute(
      'INSERT INTO hostels (name, address, warden_id, total_blocks) VALUES (?, ?, ?, ?)',
      [name, address, warden_id, total_blocks]
    );
    res.status(201).json({ success: true, data: { id: result.lastID } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update hostel
// @route   PUT /api/hostel/:id
// @access  Private (Admin)
exports.updateHostel = async (req, res) => {
  try {
    const { name, address, warden_id } = req.body;
    await db.execute(
      'UPDATE hostels SET name = ?, address = ?, warden_id = ? WHERE id = ?',
      [name, address, warden_id, req.params.id]
    );
    res.json({ success: true, message: 'Hostel updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete hostel
// @route   DELETE /api/hostel/:id
// @access  Private (Admin)
exports.deleteHostel = async (req, res) => {
  try {
    await db.execute('DELETE FROM hostels WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Hostel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add block
// @route   POST /api/hostel/blocks
// @access  Private (Admin)
exports.addBlock = async (req, res) => {
  try {
    const { hostel_id, block_name, total_floors, gender_type } = req.body;
    await db.execute(
      'INSERT INTO blocks (hostel_id, block_name, total_floors, gender_type) VALUES (?, ?, ?, ?)',
      [hostel_id, block_name, total_floors, gender_type]
    );
    res.status(201).json({ success: true, message: 'Block added' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Bulk add rooms
// @route   POST /api/hostel/rooms/bulk
// @access  Private (Admin)
exports.bulkAddRooms = async (req, res) => {
  try {
    // Expects array of { block_id, room_number, capacity, room_type }
    const rooms = req.body.rooms; 
    
    for (let r of rooms) {
      await db.execute(
        'INSERT INTO rooms (block_id, room_number, capacity, room_type) VALUES (?, ?, ?, ?)',
        [r.block_id, r.room_number, r.capacity, r.room_type]
      );
    }
    res.status(201).json({ success: true, message: `${rooms.length} rooms added` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Added GET /api/hostel endpoint to list all hostels for the dashboard
exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await db.query('SELECT * FROM hostels');
    res.json({ success: true, data: hostels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Added GET /api/hostel/blocks endpoint to list all blocks
exports.getAllBlocks = async (req, res) => {
  try {
    const blocks = await db.query(`
      SELECT b.*, h.name as hostel_name 
      FROM blocks b
      JOIN hostels h ON b.hostel_id = h.id
    `);
    res.json({ success: true, data: blocks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
