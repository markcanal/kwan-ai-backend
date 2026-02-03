# Visual Guide: Using the API Documentation

This guide shows you exactly what to expect when using the improved API documentation.

## 🎯 Quick Start

### 1. Swagger UI (Interactive Documentation)

**URL:** http://localhost:3000/api/docs

#### What You'll See:

```
┌─────────────────────────────────────────────────────────────┐
│  Kwan-AI Backend API                                        │
│  Attendance & Payroll System - Version 0.1.0               │
└─────────────────────────────────────────────────────────────┘

📂 Health
   GET  /api/status     - API status
   GET  /api/health     - Health check

📂 Authentication  
   POST /auth/sync      - Sync user from Firebase

📂 Users
   POST /users          - Create user profile         🔒
   GET  /users          - List all users

📂 Attendance
   POST /attendance/timein    - Clock in             🔒
   POST /attendance/timeout   - Clock out            🔒
   GET  /attendance/hours     - Get hours worked     🔒

📂 Payroll
   POST /payroll/compute      - Compute monthly payroll
   GET  /payroll/report       - Get payroll report

🔒 = Requires Authorization
```

---

### 2. Postman Collection

**File:** `postman_collection.json`

#### Import Steps:
1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json`
4. Done!

#### What You Get:
```
Kwan-AI Backend API/
├── 📁 Health
│   ├── API Status
│   └── Health Check
├── 📁 Authentication
│   └── Sync User from Firebase
├── 📁 Users
│   ├── Create User Profile
│   └── List All Users
├── 📁 Attendance
│   ├── Clock In
│   ├── Clock Out
│   └── Get Hours Worked
└── 📁 Payroll
    ├── Compute Monthly Payroll
    └── Get Payroll Report
```

---

## 📖 Example: Testing Attendance

### Scenario: Clock In → Work → Clock Out → Check Hours

#### Step 1: Create User (First Time Only)

**Swagger UI:**
1. Expand "Users" section
2. Click POST `/users`
3. Click "Try it out"
4. See pre-filled example:
   ```json
   {
     "name": "Juan Dela Cruz",
     "email": "juan.delacruz@example.com"
   }
   ```
5. Add your Firebase token in Authorization
6. Click "Execute"
7. See response:
   ```json
   {
     "id": 1,
     "firebaseUid": "firebase_abc123",
     "email": "juan.delacruz@example.com",
     "name": "Juan Dela Cruz",
     "role": "user",
     "createdAt": "2024-02-03T10:00:00.000Z"
   }
   ```

**Postman:**
1. Select "Create User Profile" request
2. Body is pre-filled with example
3. Update Authorization token
4. Click "Send"

**cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@example.com"
  }'
```

---

#### Step 2: Clock In

**Request:**
```json
{
  "note": "Starting work for the day"
}
```

**Response:**
```json
{
  "id": 123,
  "userId": 1,
  "type": "in",
  "timestamp": "2024-02-03T09:00:00.000Z",
  "note": "Starting work for the day",
  "holidayId": null
}
```

---

#### Step 3: Clock Out (After Work)

**Request:**
```json
{
  "note": "End of workday"
}
```

**Response:**
```json
{
  "id": 124,
  "userId": 1,
  "type": "out",
  "timestamp": "2024-02-03T17:00:00.000Z",
  "note": "End of workday",
  "holidayId": null
}
```

---

#### Step 4: Check Hours Worked

**Request:**
```
GET /attendance/hours?date=2024-02-03
```

**Response:**
```json
{
  "hours": 8.0
}
```

---

## 🎨 Swagger UI Features

### Request Body Example
When you click "Try it out" on POST endpoints, you'll see:

```json
{
  "note": "Starting work for the day"  ← Example value provided
}
```

### Response Schema
Each endpoint shows:
- ✅ Status codes (200, 201, 400, 401, 404)
- ✅ Response structure
- ✅ Example responses
- ✅ Field descriptions

### Example View:
```
Responses

▼ 201 Created
  Description: Successfully clocked in
  
  Example Value:
  {
    "id": 123,
    "userId": 1,
    "type": "in",
    "timestamp": "2024-02-03T09:00:00.000Z",
    "note": "Starting work for the day"
  }

▼ 400 Bad Request
  Description: User already clocked in. Please clock out first.

▼ 401 Unauthorized
  Description: Invalid Firebase token or user not found
```

---

## 📱 Postman Features

### Pre-configured Authorization
Protected endpoints already have:
```
Authorization: Bearer {{firebaseToken}}
```

### Environment Variables
Set once, use everywhere:
- `{{baseUrl}}` - http://localhost:3000
- `{{firebaseToken}}` - Your Firebase token

### Example Responses
Each request includes saved example responses:
- ✅ Success responses
- ✅ Error responses
- ✅ Real data structure

---

## 🔧 Common Workflows

### Workflow 1: Daily Attendance
```
1. POST /users               → Create profile (first time)
2. POST /attendance/timein   → Clock in (9:00 AM)
3. POST /attendance/timeout  → Clock out (5:00 PM)
4. GET  /attendance/hours    → Verify 8 hours
```

### Workflow 2: Monthly Payroll
```
1. Employees clock in/out daily
2. POST /payroll/compute     → Calculate payroll
3. GET  /payroll/report      → Generate report
```

### Workflow 3: Admin Overview
```
1. GET  /users              → See all employees
2. GET  /payroll/report     → View payrolls
3. GET  /api/health         → Check system
```

---

## 📊 All Endpoints at a Glance

| Endpoint | Method | Auth | Request Body | Response |
|----------|--------|------|--------------|----------|
| `/api/status` | GET | ❌ | None | `{ ok: true }` |
| `/api/health` | GET | ❌ | None | System health |
| `/auth/sync` | POST | ✅ | None | User object |
| `/users` | POST | ✅ | User data | User created |
| `/users` | GET | ❌ | None | User list |
| `/attendance/timein` | POST | ✅ | Optional note | Attendance record |
| `/attendance/timeout` | POST | ✅ | Optional note | Attendance record |
| `/attendance/hours` | GET | ✅ | Optional date | Hours object |
| `/payroll/compute` | POST | ❌ | userId, month | Payroll object |
| `/payroll/report` | GET | ❌ | month query | Payroll array |

---

## 🚨 Error Responses

All endpoints now document their error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "User already clocked in. Please clock out first.",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID 1 not found",
  "error": "Not Found"
}
```

---

## 💡 Pro Tips

### Swagger UI Tips
1. **Try it out** - Test endpoints directly in browser
2. **Authorize** - Click 🔓 icon to set Bearer token once
3. **Download spec** - Export OpenAPI spec for tools
4. **Copy cURL** - Each request can be copied as cURL

### Postman Tips
1. **Use environments** - Switch between dev/staging/prod
2. **Save examples** - Save your own response examples
3. **Use tests** - Add assertions to verify responses
4. **Chain requests** - Use previous response in next request

### cURL Tips
1. **Pretty print** - Pipe to `jq` for formatted JSON
2. **Save token** - Export as environment variable
3. **Scripts** - Create shell scripts for workflows

---

## 📚 Additional Resources

- **README.md** - Setup and quick start
- **API_GUIDE.md** - Complete endpoint documentation
- **IMPROVEMENTS.md** - Recent code improvements
- **TESTING.md** - Unit test documentation

---

## 🎉 What's New

### Before This Update
- ❌ No request examples in Swagger
- ❌ No response examples
- ❌ No Postman collection
- ❌ Minimal documentation

### After This Update
- ✅ Complete request examples
- ✅ Success and error responses
- ✅ Ready-to-use Postman collection
- ✅ Comprehensive API guide
- ✅ cURL command examples
- ✅ Organized by feature tags

---

**Happy Testing! 🚀**
