# Kwan-ai Backend (Starter)
This is a minimal starter for **Kwan-ai**: attendance, time-in/out, salary computation, deductions, and reports.

> **📝 See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for comprehensive code review and recent improvements**

Stack:
- NestJS (TypeScript)
- Firebase Auth + Storage (placeholder)
- PostgreSQL (Prisma)
- Redis + BullMQ (background jobs)
- Docker & Docker Compose for local dev

## Quick start (local)
1. Copy `.env.example` to `.env` and fill values.
2. `docker compose up --build`
3. In another terminal: `npm install`
4. (Optional) `npx prisma generate && npx prisma migrate dev --name init`
5. `npm run start:dev`

## Testing
Run the test suite:
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage report
```

Current test coverage:
- ✅ AttendanceService: 100% coverage (clock-in/out logic, hours calculation)
- ✅ UserService: 100% coverage (user creation, retrieval)
- ✅ FirebaseAuthGuard: 100% coverage (token validation, error handling)

## API Documentation
Once the server is running, visit:
- **Swagger UI:** `http://localhost:3000/api/docs` - Interactive API documentation with examples
- **Health Check:** `http://localhost:3000/api/health`
- **Status:** `http://localhost:3000/api/status`

### Testing with Postman
1. **Import Collection:** Import `postman_collection.json` into Postman
2. **Set Environment:** Create environment with `baseUrl` and `firebaseToken` variables
3. **Start Testing:** Use pre-configured requests with sample payloads

📚 **See [API_GUIDE.md](./API_GUIDE.md) for:**
- Complete endpoint documentation
- Request/response examples
- cURL commands
- Authentication guide
- Troubleshooting tips
- **Health Check:** `http://localhost:3000/api/health`
- **Status:** `http://localhost:3000/api/status`

Endpoints (examples)
- `POST /users` create user record (link to Firebase uid)
- `POST /attendance/timein` time in (authenticated user)
- `POST /attendance/timeout` time out (authenticated user)
- `GET /payroll/report?month=2025-11` payroll report


## Notes
- This starter maps Firebase users to `User` records in Postgres via `firebaseUid`.
- Replace placeholders in `.env` with your Firebase service account details.
- The attendance pairing and payroll computation are simplistic examples — tailor to your business rules.

## Recent Improvements
This codebase has undergone a comprehensive security and code quality review. Key improvements include:

- ✅ **Security:** Fixed authentication vulnerabilities, added input validation, configured CORS
- ✅ **Performance:** Added database indexes, optimized N+1 queries
- ✅ **Code Quality:** Proper error handling, logging, type safety
- ✅ **Documentation:** Added Swagger API docs, health checks
- ✅ **Reliability:** Rate limiting, graceful shutdown, request logging
- ✅ **Testing:** Comprehensive unit tests with 100% coverage for core services

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for complete details.
