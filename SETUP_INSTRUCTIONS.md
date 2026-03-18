# CareConnect - Full Stack Healthcare Management System

A complete healthcare management system with authentication, PostgreSQL, and role-based dashboards.

## Prerequisites

- Node.js 16+ (https://nodejs.org/)
- PostgreSQL 12+ (https://www.postgresql.org/download/)
- npm or yarn package manager

## Quick Start Setup

### 1. Database Setup

First, create the PostgreSQL database:

```bash
# On Windows, use pgAdmin or psql command line
# Open Command Prompt or PowerShell as Administrator

# If PostgreSQL is installed, you can use:
psql -U postgres

# Then in psql:
CREATE DATABASE careconnect;
```

Or use PgAdmin (GUI) to create database named `careconnect`.

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
Copy-Item .env.example .env

# Edit .env and update DATABASE_URL if needed
# Default: postgresql://postgres:password@localhost:5432/careconnect
# Update 'password' to your PostgreSQL password

# Start backend server
npm run dev
# Server should run on http://localhost:5000
```

### 3. Frontend Setup

```bash
# In new terminal, navigate to root directory
cd ..

# Install dependencies (if not already done)
npm install

# .env.local already created with VITE_API_URL

# Start frontend dev server
npm run dev
# Frontend should run on http://localhost:5173
```

## Demo Login Credentials

All demo accounts use password: `password`

| Role | Email | Access |
|------|-------|--------|
| Admin | admin@careconnect.com | System administration |
| Doctor | doctor@careconnect.com | Doctor dashboard |
| Receptionist | reception@careconnect.com | Reception dashboard |
| Patient | patient@careconnect.com | Patient portal |

## Features Implemented

✅ **Authentication**
- User registration and login
- JWT token-based authentication
- Role-based access control
- Secure logout with token invalidation

✅ **Database**
- PostgreSQL with comprehensive schema
- Tables for users, doctors, patients, appointments, medical records
- Proper foreign keys and indexes

✅ **API Endpoints**
- Auth endpoints (login, register, logout, refresh)
- Doctor management endpoints
- Patient management endpoints
- Appointment booking and management
- Admin dashboard data endpoints

✅ **Frontend Features**
- Protected routes with role-based access
- User authentication context
- API client utility for requests
- Responsive dashboards for each role
- Logout functionality
- Toast notifications

✅ **Security**
- Password hashing with bcryptjs
- JWT token expiration
- Refresh token mechanism
- CORS enabled for frontend requests
- Environment variable configuration

## Project Structure

```
CareConnect/
├── backend/                    # Node.js Express server
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   ├── config/            # Database config
│   │   └── server.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
├── src/                        # React frontend
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   ├── contexts/              # Auth context
│   ├── lib/                   # Utilities & API client
│   ├── App.tsx                # Main app with routing
│   └── main.tsx               # Entry point
├── .env.local                 # Frontend env vars
└── package.json
```

## Key Technologies

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Shadcn UI components
- React Router for navigation
- TanStack Query for data fetching
- Tailwind CSS for styling

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL + node-pg
- JWT for authentication
- bcryptjs for password hashing

## Running the Application

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend (from root):
```bash
npm run dev
```

Visit http://localhost:5173 in your browser.

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/user/logout` - Logout user
- `POST /api/user/refresh` - Refresh token
- `GET /api/user/me` - Get current user

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/profile` - Get doctor profile
- `GET /api/doctors/appointments` - Get doctor's appointments
- `PATCH /api/doctors/appointments/:id/status` - Update appointment status

### Patient Endpoints
- `GET /api/patients` - Get all patients
- `GET /api/patients/profile` - Get patient profile
- `PATCH /api/patients/profile` - Update patient profile
- `GET /api/patients/appointments` - Get patient's appointments
- `POST /api/patients/appointments` - Book appointment

### Admin Endpoints
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/appointments` - Get all appointments

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database name in .env matches created database
- Check NODE_ENV is not set to production locally

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check VITE_API_URL in .env.local is correct
- Clear browser cache and restart dev server

### Database errors
- Make sure PostgreSQL is running
- Verify connection string in backend/.env
- Check database exists: `psql -l | grep careconnect`

## Production Deployment

Before deploying to production:

1. Change JWT_SECRET in backend/.env to a strong random string
2. Update DATABASE_URL to production database
3. Set NODE_ENV=production
4. Set BCRYPT_ROUNDS to at least 12
5. Enable HTTPS/SSL
6. Set up proper CORS origin whitelist
7. Use environment-specific configuration for API URLs

## License

MIT

## Support

For issues or questions, contact the development team.
