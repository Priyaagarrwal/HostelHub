const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'hostelhub.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // 1. Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'warden', 'mess_staff', 'admin')),
      phone TEXT,
      batch_year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Hostels
    db.run(`CREATE TABLE IF NOT EXISTS hostels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      warden_id INTEGER REFERENCES users(id),
      total_blocks INTEGER DEFAULT 1
    )`);

    // 3. Blocks
    db.run(`CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE,
      block_name TEXT NOT NULL,
      total_floors INTEGER,
      gender_type TEXT CHECK(gender_type IN ('boys', 'girls', 'mixed'))
    )`);

    // 4. Rooms
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
      room_number TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      current_occupancy INTEGER DEFAULT 0,
      room_type TEXT CHECK(room_type IN ('ac', 'non-ac', 'premium')),
      is_available BOOLEAN DEFAULT TRUE,
      UNIQUE(block_id, room_number)
    )`);

    // 5. Hostel Applications
    db.run(`CREATE TABLE IF NOT EXISTS hostel_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id),
      preferred_hostel_id INTEGER REFERENCES hostels(id),
      preferred_room_type TEXT,
      preferred_roommate_name TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'allotted')),
      applied_date DATE DEFAULT CURRENT_DATE,
      notes TEXT
    )`);

    // 6. Allotments
    db.run(`CREATE TABLE IF NOT EXISTS allotments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id) UNIQUE,
      room_id INTEGER REFERENCES rooms(id),
      application_id INTEGER REFERENCES hostel_applications(id),
      allotted_date DATE DEFAULT CURRENT_DATE,
      move_in_date DATE,
      move_out_date DATE,
      is_active BOOLEAN DEFAULT TRUE
    )`);

    // 7. Room Change Requests
    db.run(`CREATE TABLE IF NOT EXISTS room_change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id),
      current_room_id INTEGER REFERENCES rooms(id),
      requested_room_id INTEGER REFERENCES rooms(id),
      reason TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      requested_date DATE DEFAULT CURRENT_DATE,
      reviewed_by INTEGER REFERENCES users(id),
      review_notes TEXT
    )`);

    // 8. Meal Plans
    db.run(`CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id),
      plan_type TEXT CHECK(plan_type IN ('veg', 'non-veg', 'jain', 'special_diet')),
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT TRUE
    )`);

    // 9. Dishes
    db.run(`CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT CHECK(category IN ('breakfast', 'lunch', 'snacks', 'dinner')),
      cuisine_type TEXT,
      is_veg BOOLEAN DEFAULT TRUE,
      base_cost DECIMAL(10,2),
      nutrition_info TEXT,
      avg_rating DECIMAL(3,2) DEFAULT 0
    )`);

    // 10. Menu Plans
    db.run(`CREATE TABLE IF NOT EXISTS menu_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER REFERENCES dishes(id),
      meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
      day_of_week INTEGER CHECK(day_of_week BETWEEN 1 AND 7),
      week_start_date DATE,
      is_special BOOLEAN DEFAULT FALSE,
      special_note TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 11. Food Feedback
    db.run(`CREATE TABLE IF NOT EXISTS food_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id),
      dish_id INTEGER REFERENCES dishes(id),
      meal_date DATE NOT NULL,
      meal_type TEXT,
      taste_rating INTEGER CHECK(taste_rating BETWEEN 1 AND 5),
      quantity_rating INTEGER CHECK(quantity_rating BETWEEN 1 AND 5),
      hygiene_rating INTEGER CHECK(hygiene_rating BETWEEN 1 AND 5),
      comment TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 12. Waste Logs
    db.run(`CREATE TABLE IF NOT EXISTS waste_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_plan_id INTEGER REFERENCES menu_plans(id),
      meal_date DATE NOT NULL,
      meal_type TEXT,
      leftover_quantity_kg DECIMAL(10,2),
      estimated_cost_wasted DECIMAL(10,2),
      notes TEXT,
      logged_by INTEGER REFERENCES users(id)
    )`);

    // 13. Complaint Categories
    db.run(`CREATE TABLE IF NOT EXISTS complaint_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT UNIQUE NOT NULL,
      priority_level INTEGER DEFAULT 2
    )`);

    // 14. Complaints
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id),
      category_id INTEGER REFERENCES complaint_categories(id),
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('emergency', 'normal', 'low')),
      title TEXT NOT NULL,
      description TEXT,
      photo_url TEXT,
      status TEXT DEFAULT 'raised' CHECK(status IN ('raised', 'assigned', 'in_progress', 'resolved', 'rejected')),
      assigned_to INTEGER REFERENCES users(id),
      assigned_date DATE,
      resolved_date DATE,
      resolution_notes TEXT,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 15. Complaint Updates
    db.run(`CREATE TABLE IF NOT EXISTS complaint_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
      update_text TEXT,
      updated_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed data if empty
    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding initial data...");
        const passwordHash = bcrypt.hashSync('password123', 10);
        
        // Seed Users
        const usersStmt = db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
        usersStmt.run("Admin User", "admin@hostelhub.com", passwordHash, "admin");
        usersStmt.run("Warden User", "warden@hostelhub.com", passwordHash, "warden");
        usersStmt.run("Mess Staff", "mess@hostelhub.com", passwordHash, "mess_staff");
        usersStmt.run("Student User", "student@hostelhub.com", passwordHash, "student");
        usersStmt.finalize();

        // Seed Hostels
        const hostelStmt = db.prepare("INSERT INTO hostels (name, address, warden_id, total_blocks) VALUES (?, ?, ?, ?)");
        hostelStmt.run("Bhagirathi Hostel", "North Campus", 2, 2);
        hostelStmt.run("Gandhi Hostel", "South Campus", 2, 1);
        hostelStmt.finalize();

        // Seed Blocks
        const blockStmt = db.prepare("INSERT INTO blocks (hostel_id, block_name, total_floors, gender_type) VALUES (?, ?, ?, ?)");
        blockStmt.run(1, "Bhagirathi - Block A", 3, "boys");
        blockStmt.run(1, "Bhagirathi - Block B", 3, "girls");
        blockStmt.run(2, "Gandhi - Block A", 2, "boys");
        blockStmt.finalize();

        // Seed Rooms
        const roomStmt = db.prepare("INSERT INTO rooms (block_id, room_number, capacity, room_type) VALUES (?, ?, ?, ?)");
        roomStmt.run(1, "A-101", 2, "ac");
        roomStmt.run(1, "A-102", 2, "ac");
        roomStmt.run(1, "A-103", 4, "non-ac");
        roomStmt.run(1, "A-104", 4, "non-ac");
        roomStmt.run(2, "B-101", 2, "ac");
        roomStmt.run(2, "B-102", 2, "ac");
        roomStmt.run(2, "B-103", 4, "non-ac");
        roomStmt.run(2, "B-104", 4, "non-ac");
        roomStmt.run(3, "A-101", 2, "ac");
        roomStmt.run(3, "A-102", 4, "non-ac");
        roomStmt.finalize();

        // Seed Dishes
        const dishStmt = db.prepare("INSERT INTO dishes (name, category, cuisine_type, is_veg, base_cost) VALUES (?, ?, ?, ?, ?)");
        dishStmt.run("Masala Dosa", "breakfast", "South Indian", true, 30);
        dishStmt.run("Idli Sambhar", "breakfast", "South Indian", true, 25);
        dishStmt.run("Paneer Butter Masala", "lunch", "North Indian", true, 80);
        dishStmt.run("Chicken Biryani", "lunch", "Hyderabadi", false, 120);
        dishStmt.run("Veg Noodles", "snacks", "Chinese", true, 50);
        dishStmt.run("Egg Curry", "lunch", "North Indian", false, 70);
        dishStmt.run("Dal Makhani", "lunch", "North Indian", true, 60);
        dishStmt.run("Poori Sabji", "breakfast", "North Indian", true, 35);
        dishStmt.run("Fried Rice", "dinner", "Chinese", true, 55);
        dishStmt.run("Ice Cream", "dinner", "Dessert", true, 30);
        dishStmt.finalize();

        // Seed Complaint Categories
        const catStmt = db.prepare("INSERT INTO complaint_categories (category_name, priority_level) VALUES (?, ?)");
        catStmt.run("Electrical", 2);
        catStmt.run("Plumbing", 1); // 1 is emergency
        catStmt.run("Cleaning", 3);
        catStmt.run("Ragging", 1);
        catStmt.run("Food Quality", 2);
        catStmt.run("Furniture", 3);
        catStmt.run("Pest Control", 2);
        catStmt.run("Other", 3);
        catStmt.finalize();
      }
    });
  });
}

// Wrapper for executing queries with promises
db.query = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.queryOne = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.execute = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

module.exports = db;
