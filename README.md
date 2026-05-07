# HostelHub - Hostel & Mess Management System

## Quick Start (5 minutes)

### Prerequisites
- Node.js (v18 or higher) - Download from https://nodejs.org
- Any modern browser (Chrome/Firefox/Edge)

### Installation Steps

1. **Open two terminal windows** from the project root (`/Users/agarwal/Documents/Development/FullStackProject`)

2. **Terminal 1 - Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *You should see: Server running on http://localhost:5000*
   *The SQLite database will be automatically created and seeded on the first run.*

3. **Terminal 2 - Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *You should see: VITE ready in XXX ms*

4. **Open your browser to: http://localhost:3000**

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@hostelhub.com | password123 |
| Warden | warden@hostelhub.com | password123 |
| Mess Staff | mess@hostelhub.com | password123 |
| Student | student@hostelhub.com | password123 |

*(Note: The login page also has quick-fill buttons for these demo credentials!)*

## What You Can Test

### As Student:
- Apply for hostel accommodation
- View allotted room
- View weekly mess menu and give food ratings (taste/quantity/hygiene)
- Raise maintenance complaints

### As Warden:
- Approve student applications
- Auto-allot rooms (system automatically finds best match based on preferences)
- View occupancy dashboard and vacant rooms
- Assign and manage complaints

### As Mess Staff:
- Plan weekly menu
- View dish ratings and dish performance (ratings & waste)
- Log food wastage (calculates financial loss based on leftovers)

### As Admin:
- Add new hostels
- Manage dish library
- View full system analytics (occupancy, food satisfaction, complaints by category)

## Troubleshooting

- **Port already in use?**
  - Backend: Change PORT in `backend/.env` to 5001 and update `vite.config.js` target
  - Frontend: Change port in `vite.config.js` to 3001
- **SQLite database not created?**
  - The backend automatically creates `hostelhub.db` in `backend/src/db/`. Check write permissions if it fails.
- **API not connecting?**
  - Verify backend is running on port 5000 and check the browser console for CORS errors.

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Axios, Chart.js
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: SQLite3 (file-based, zero configuration)

## Features Included
✅ 4 User Roles with Role-Based JWT Auth
✅ 40+ REST API endpoints
✅ SQLite database with 15 tables automatically seeded
✅ Responsive React frontend with 5 specialized dashboards
✅ Real-time data visualization with Chart.js
