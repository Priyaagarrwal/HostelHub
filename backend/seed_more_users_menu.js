const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'src/db/hostelhub.db');
const db = new sqlite3.Database(dbPath);

const passwordHash = bcrypt.hashSync('password123', 10);

db.serialize(() => {
  // 1. Add 4 new student users
  const users = [
    { name: "Rahul Kumar", email: "student1@hostelhub.com" },
    { name: "Priya Singh", email: "student2@hostelhub.com" },
    { name: "Amit Patel", email: "student3@hostelhub.com" },
    { name: "Neha Sharma", email: "student4@hostelhub.com" }
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'student')");
  for (let u of users) {
    stmt.run(u.name, u.email, passwordHash);
  }
  stmt.finalize();

  // 2. Add some weekly menu plans so the student can see the weekly menu
  // We will insert some items for this week.
  // We'll use the beginning of the week.
  
  const days = [1, 2, 3, 4, 5, 6, 7];
  
  const menuStmt = db.prepare(`
    INSERT INTO menu_plans (dish_id, meal_type, day_of_week, week_start_date, created_by) 
    VALUES (?, ?, ?, date('now', 'weekday 0', '-6 days'), 3)
  `); // created_by = 3 (Mess Staff)

  days.forEach(day => {
    // Breakfast
    menuStmt.run(day % 2 === 0 ? 1 : 2, 'breakfast', day); // Masala Dosa or Idli
    // Lunch
    menuStmt.run(day % 3 === 0 ? 3 : (day % 3 === 1 ? 6 : 7), 'lunch', day); // Paneer, Egg, or Dal
    // Snacks
    menuStmt.run(5, 'snacks', day); // Veg Noodles
    // Dinner
    menuStmt.run(9, 'dinner', day); // Fried Rice
  });
  menuStmt.finalize();
  
});

console.log("Added 4 students and weekly menu data.");
db.close();
