# CareConnect - Production Setup Guide

## Overview
CareConnect is a comprehensive healthcare management system with a React frontend and Node.js/PostgreSQL backend. This guide will help you set up and deploy the application.

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Git

## System Architecture

### Frontend
- **Technology**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/UI Components with TailwindCSS
- **State Management**: React Context for Auth, React Query for API caching
- **Port**: 5173 (development), 3000 (production)

### Backend
- **Technology**: Express.js + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (Access + Refresh tokens)
- **Port**: 5000 (development)

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create `.env` file in the `backend` folder:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:database@localhost:5432/careconnect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
BCRYPT_ROUNDS=10
```

### 3. Database Setup

1. Create PostgreSQL database:
```bash
createdb careconnect
```

2. Run migrations (automatically on first server start):
```bash
npm run dev
```

The server will automatically:
- Create all required tables
- Seed demo data with test accounts

### 4. Frontend Setup

```bash
npm install
```

Create `.env.local` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the app at: `http://localhost:5173`

## Demo Accounts

All demo accounts use password: `password`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@careconnect.com | password |
| Doctor | doctor@careconnect.com | password |
| Receptionist | reception@careconnect.com | password |
| Patient | patient@careconnect.com | password |

Additional demo accounts:
- **Doctors**: doctor2@careconnect.com, doctor3@careconnect.com
- **Patients**: patient2@careconnect.com, patient3@careconnect.com, patient4@careconnect.com

## Features

### Admin Dashboard
- System overview with statistics
- Staff management
- Patient management
- Appointment monitoring
- System health monitoring

### Doctor Dashboard
- Daily appointment schedule
- Patient list with quick access
- Medical record creation
- Prescription management
- Appointment status updates

### Patient Dashboard
- Upcoming appointments
- Medical records and reports
- Current prescriptions
- Health profile
- Appointment booking

### Receptionist Dashboard
- Patient check-in management
- Appointment scheduling
- Patient search and registration
- Waiting room management

### Landing Page
- Professional design with hero section
- Service descriptions
- Role-based feature overview
- Call-to-action buttons

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/profile` - Get doctor profile
- `GET /api/doctors/appointments` - Get doctor's appointments
- `PATCH /api/doctors/appointments/:id/status` - Update appointment status
- `POST /api/doctors/medical-records` - Create medical record
- `POST /api/doctors/prescriptions` - Create prescription

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/profile` - Get patient profile
- `PATCH /api/patients/profile` - Update patient profile
- `GET /api/patients/appointments` - Get patient's appointments
- `POST /api/patients/appointments` - Book appointment
- `GET /api/patients/medical-records` - Get medical records
- `GET /api/patients/prescriptions` - Get prescriptions

### Admin
- `GET /api/admin/doctors` - List all doctors
- `GET /api/admin/patients` - List all patients
- `GET /api/admin/appointments` - List all appointments
- `GET /api/admin/medical-records` - List medical records
- `GET /api/admin/prescriptions` - List prescriptions

## Security Features

1. **Authentication**
   - JWT-based authentication
   - Secure refresh token rotation
   - Password hashing with bcrypt

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes per user role
   - Middleware-based permission checks

3. **Database**
   - SQL injection prevention
   - HIPAA compliance ready
   - Encrypted sensitive data

## Production Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend
heroku create your-app-name
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
npm run build
vercel deploy
```

Set environment variables in deployment platform:
```
VITE_API_URL=https://your-api-domain.com/api
```

## Build Commands

### Frontend
```bash
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run tests
```

### Backend
```bash
npm run build      # Compile TypeScript
npm start          # Start production server
npm run dev        # Start development server
```

## Troubleshooting

### Database Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database name matches

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### CORS Errors
- Check VITE_API_URL matches backend port
- Verify backend CORS configuration

### Session/Token Issues
- Clear browser localStorage
- Check JWT_SECRET is consistent
- Verify token expiration settings

## Testing

### API Testing with curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@careconnect.com","password":"password"}'

# Get user profile (use token from login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### Core Tables
- **users** - User accounts with roles
- **doctors** - Doctor profiles and specializations
- **patients** - Patient profiles and medical info
- **appointments** - Appointment records
- **medical_records** - Medical history
- **prescriptions** - Drug prescriptions
- **refresh_tokens** - Session management

## Performance Optimization

1. **Frontend**
   - Code splitting with React.lazy()
   - Image optimization
   - API response caching with React Query
   - Debounced search inputs

2. **Backend**
   - Database indexing on frequently queried columns
   - Connection pooling
   - Query optimization
   - Caching for static data

## Monitoring

Monitor your deployment with:
- Database query logs
- API response times
- Error tracking (Sentry)
- Uptime monitoring (StatusPage)

## Support & Documentation

For more information:
- Check README.md for project overview
- Review individual component documentation
- Check TypeScript type definitions for API contracts

## License

This project is licensed under the MIT License.

---

**Last Updated**: February 11, 2026
**Version**: 1.0.0
