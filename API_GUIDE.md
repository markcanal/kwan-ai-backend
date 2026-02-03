# API Usage Guide

Complete guide for testing the Kwan-AI Backend API with Postman and cURL.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Postman Setup](#postman-setup)
4. [API Endpoints](#api-endpoints)
5. [cURL Examples](#curl-examples)

---

## Quick Start

### Prerequisites
- Backend running on `http://localhost:3000`
- Firebase authentication token (for protected endpoints)
- Postman or cURL installed

### Testing Flow
1. **Check health**: `GET /api/health`
2. **Create user**: `POST /users` (requires Firebase token)
3. **Clock in**: `POST /attendance/timein`
4. **Clock out**: `POST /attendance/timeout`
5. **Check hours**: `GET /attendance/hours`
6. **Compute payroll**: `POST /payroll/compute`

---

## Authentication

### Firebase Token
Most endpoints require Firebase authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

### Getting a Firebase Token

#### Option 1: Firebase Console (for testing)
1. Go to Firebase Console
2. Authentication → Users
3. Use Firebase Auth REST API to get ID token

#### Option 2: Firebase SDK
```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
```

#### Option 3: For Testing (Mock Token)
For local development without Firebase, you can modify the auth guard temporarily or use environment variables to bypass authentication.

---

## Postman Setup

### 1. Import Collection

**Download and import the Postman collection:**
- File: `postman_collection.json` (in repository root)
- In Postman: Click **Import** → Select file

### 2. Set Environment Variables

Create a new environment in Postman with these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:3000` | API base URL |
| `firebaseToken` | `YOUR_TOKEN_HERE` | Firebase ID token |

**To set variables:**
1. Click ⚙️ (gear icon) → Environments
2. Click **+** to create new environment
3. Name it "Kwan-AI Local"
4. Add variables above
5. Click **Save**
6. Select the environment from dropdown

### 3. Using the Collection

The collection is organized into folders:
- **Health** - System health checks
- **Authentication** - User sync
- **Users** - User management
- **Attendance** - Clock in/out
- **Payroll** - Salary computation

Each request includes:
- Example request body
- Sample responses
- Descriptions

---

## API Endpoints

### Health Endpoints

#### GET /api/status
Check if API is online (no auth required)

**Response:**
```json
{
  "ok": true,
  "status": "online"
}
```

#### GET /api/health
Check API and database health (no auth required)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-03T10:00:00.000Z",
  "services": {
    "database": "healthy",
    "api": "healthy"
  }
}
```

---

### Authentication

#### POST /auth/sync
Sync user from Firebase to database (requires auth)

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

**Response:**
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

---

### Users

#### POST /users
Create user profile (requires auth)

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Juan Dela Cruz",
  "email": "juan.delacruz@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "firebaseUid": "firebase_abc123",
  "email": "juan.delacruz@example.com",
  "name": "Juan Dela Cruz",
  "avatarUrl": null,
  "role": "user",
  "createdAt": "2024-02-03T10:00:00.000Z",
  "hireDate": "2024-02-03T10:00:00.000Z",
  "baseSalary": 0,
  "yearlyBonus": 0,
  "clientCount": 1,
  "clientBonus": 0
}
```

#### GET /users
List all users (no auth required)

**Response:**
```json
[
  {
    "id": 1,
    "firebaseUid": "firebase_abc123",
    "email": "juan.delacruz@example.com",
    "name": "Juan Dela Cruz",
    "role": "user",
    "baseSalary": 30000,
    "yearlyBonus": 12000
  }
]
```

---

### Attendance

#### POST /attendance/timein
Clock in (requires auth)

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json
```

**Request Body:**
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

**Error (Already Clocked In):**
```json
{
  "statusCode": 400,
  "message": "User already clocked in. Please clock out first."
}
```

#### POST /attendance/timeout
Clock out (requires auth)

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json
```

**Request Body:**
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

**Error (Not Clocked In):**
```json
{
  "statusCode": 400,
  "message": "Cannot clock out without clocking in first."
}
```

#### GET /attendance/hours?date=YYYY-MM-DD
Get hours worked for a date (requires auth)

**Headers:**
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "hours": 8.0
}
```

---

### Payroll

#### POST /payroll/compute
Compute monthly payroll (no auth required)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": 1,
  "month": "2024-02"
}
```

**Response:**
```json
{
  "payroll": {
    "id": 1,
    "userId": 1,
    "month": "2024-02",
    "totalHours": 176,
    "overtimeHours": 0,
    "nightHours": 0,
    "gross": 30000,
    "deductions": 2500,
    "net": 27500,
    "sss": 1125,
    "philhealth": 875,
    "pagibig": 500,
    "createdAt": "2024-02-03T10:00:00.000Z"
  },
  "summary": {
    "user": "Juan Dela Cruz",
    "month": "2024-02",
    "totalHours": 176,
    "dailyRate": 1363.64,
    "hourlyRate": 170.45,
    "gross": 30000,
    "deductions": 2500,
    "net": 27500
  }
}
```

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": [
    "Month format must be YYYY-MM"
  ],
  "error": "Bad Request"
}
```

#### GET /payroll/report?month=YYYY-MM
Get payroll report for all users (no auth required)

**Query Parameters:**
- `month`: Month in YYYY-MM format

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "month": "2024-02",
    "totalHours": 176,
    "gross": 30000,
    "deductions": 2500,
    "net": 27500,
    "createdAt": "2024-02-03T10:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Juan Dela Cruz",
      "email": "juan.delacruz@example.com"
    }
  }
]
```

---

## cURL Examples

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@example.com"
  }'
```

### Clock In
```bash
curl -X POST http://localhost:3000/attendance/timein \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Starting work for the day"
  }'
```

### Clock Out
```bash
curl -X POST http://localhost:3000/attendance/timeout \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "End of workday"
  }'
```

### Get Hours Worked
```bash
curl http://localhost:3000/attendance/hours?date=2024-02-03 \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Compute Payroll
```bash
curl -X POST http://localhost:3000/payroll/compute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "month": "2024-02"
  }'
```

### Get Payroll Report
```bash
curl "http://localhost:3000/payroll/report?month=2024-02"
```

---

## Testing Without Firebase

For local testing without Firebase authentication:

### Option 1: Modify Environment
Set environment variable to bypass auth:
```bash
DISABLE_AUTH=true npm run start:dev
```

### Option 2: Use Mock Token
Create a test endpoint that generates mock tokens for development.

### Option 3: Direct Database Testing
Use the public endpoints (users list, payroll report, health checks) that don't require authentication.

---

## Common Issues

### 401 Unauthorized
**Problem:** Invalid or missing Firebase token

**Solution:**
- Verify token is valid and not expired
- Check Authorization header format: `Bearer TOKEN`
- Ensure user exists in database (use POST /users first)

### 400 Bad Request (Already Clocked In)
**Problem:** Trying to clock in when already clocked in

**Solution:**
- Clock out first using POST /attendance/timeout
- Check current state with GET /attendance/hours

### 404 User Not Found
**Problem:** User doesn't exist in database

**Solution:**
- Create user profile first with POST /users
- Or sync user with POST /auth/sync

### Invalid Month Format
**Problem:** Month not in YYYY-MM format

**Solution:**
- Use format: "2024-02" (not "02-2024" or "2024-2")
- Ensure it's a string in JSON

---

## Swagger UI

Access the interactive API documentation at:
```
http://localhost:3000/api/docs
```

Features:
- Try out endpoints directly
- View request/response schemas
- See example payloads
- Download OpenAPI spec

---

## Need Help?

- Check [README.md](./README.md) for setup instructions
- View [IMPROVEMENTS.md](./IMPROVEMENTS.md) for recent changes
- See [TESTING.md](./TESTING.md) for unit tests
- Open an issue on GitHub

---

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |
