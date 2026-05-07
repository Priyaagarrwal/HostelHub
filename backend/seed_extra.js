const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'src/db/hostelhub.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Add a pending application for student (id: 4)
  db.run(`INSERT INTO hostel_applications (student_id, preferred_hostel_id, preferred_room_type, status, notes) 
          VALUES (4, 1, 'ac', 'pending', 'Please assign a room with good ventilation.')`);
          
  // Add a couple of pending complaints
  db.run(`INSERT INTO complaints (student_id, category_id, priority, title, description, status)
          VALUES (4, 1, 'normal', 'Fan not working', 'The ceiling fan in my room makes a lot of noise.', 'raised')`);
          
  db.run(`INSERT INTO complaints (student_id, category_id, priority, title, description, status)
          VALUES (4, 2, 'emergency', 'Pipe leaking', 'Bathroom pipe is leaking continuously.', 'raised')`);
});

console.log("Added pending application and complaints successfully.");
db.close();
