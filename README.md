# Kwan-ai Backend (Starter)
This is a minimal starter for **Kwan-ai**: attendance, time-in/out, salary computation, deductions, and reports.

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

Endpoints (examples)
- `POST /users` create user record (link to Firebase uid)
- `POST /attendance/timein` time in (body: { userId })
- `POST /attendance/timeout` time out (body: { userId })
- `GET /payroll/report?month=2025-11` payroll report


## Notes
- This starter maps Firebase users to `User` records in Postgres via `firebaseUid`.
- Replace placeholders in `.env` with your Firebase service account details.
- The attendance pairing and payroll computation are simplistic examples — tailor to your business rules.
