# HostelHub API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### `POST /api/auth/register`
- **Desc**: Register a new user
- **Body**: `{ name, email, password, role, phone, batch_year }`
- **Returns**: `{ success: true, token, user }`

### `POST /api/auth/login`
- **Desc**: Login user
- **Body**: `{ email, password }`
- **Returns**: `{ success: true, token, user }`

### `GET /api/auth/profile`
- **Desc**: Get current user
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success: true, data: user }`

## Hostel Management

### `POST /api/hostel/apply`
- **Desc**: Submit hostel application (Student)
- **Body**: `{ preferred_hostel_id, preferred_room_type, preferred_roommate_name, notes }`

### `GET /api/hostel/my-application`
- **Desc**: Get current user's application (Student)

### `GET /api/hostel/my-allotment`
- **Desc**: Get current user's room allotment (Student)

### `GET /api/hostel/pending-applications`
- **Desc**: List all pending applications (Warden/Admin)

### `POST /api/hostel/auto-allot/:appId`
- **Desc**: Auto-assign best available room to an application (Warden/Admin)

### `GET /api/hostel/vacant-rooms`
- **Desc**: View all available rooms (Warden/Admin)

### `POST /api/hostel`
- **Desc**: Create a new hostel (Admin)
- **Body**: `{ name, address, warden_id, total_blocks }`

## Mess Management

### `GET /api/mess/current-week`
- **Desc**: Get menu for the current week

### `POST /api/mess/feedback`
- **Desc**: Submit food feedback (Student)
- **Body**: `{ dish_id, meal_date, meal_type, taste_rating, quantity_rating, hygiene_rating, comment }`

### `GET /api/mess/dish-performance`
- **Desc**: View dish ratings and waste data (Mess Staff/Admin)

### `POST /api/mess/waste/log`
- **Desc**: Log leftover quantity and calculate estimated loss (Mess Staff/Admin)
- **Body**: `{ menu_plan_id, meal_date, meal_type, leftover_quantity_kg, notes }`

### `GET /api/mess/dishes/all`
- **Desc**: Get all dishes from the library

### `POST /api/mess/dishes`
- **Desc**: Add a new dish to the library (Admin)
- **Body**: `{ name, category, cuisine_type, is_veg, base_cost, nutrition_info }`

## Complaint Management

### `POST /api/complaints`
- **Desc**: Raise a new complaint (Student)
- **Body**: `{ category_id, priority, title, description }`

### `GET /api/complaints/my-complaints`
- **Desc**: Get complaints raised by the logged-in user (Student)

### `GET /api/complaints/pending`
- **Desc**: Get unassigned/in-progress complaints (Warden/Admin)

### `PUT /api/complaints/:id/status`
- **Desc**: Update complaint status (Warden/Admin)
- **Body**: `{ status, resolution_notes }`

### `GET /api/complaints/categories`
- **Desc**: Get all complaint categories

### `GET /api/complaints/analytics`
- **Desc**: Get analytics on complaints by category (Admin)
