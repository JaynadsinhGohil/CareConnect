# CareConnect - Healthcare Management System

A modern, full-stack healthcare management system with role-based access control, appointments, prescriptions, medical records, and comprehensive patient management.

## ✨ Features

### 🏥 Core Features
- **Role-Based Access Control** - Admin, Doctor, Receptionist, Patient
- **User Authentication** - JWT-based secure authentication
- **Appointment Management** - Schedule, track, and update appointments
- **Medical Records** - Comprehensive patient medical history
- **Prescriptions** - Digital prescription management
- **Patient Profiles** - Detailed patient information and health data
- **Dashboard Analytics** - Real-time system statistics

### 👥 Role-Specific Features

#### Patient Dashboard
- View upcoming and past appointments
- Access medical records and reports
- View active prescriptions and medication details
- Manage personal health profile
- Track health metrics

#### Doctor Dashboard
- Daily appointment schedule
- Quick access to patient records
- Create and manage medical records
- Issue prescriptions
- Update appointment statuses

#### Admin Dashboard
- System-wide overview and statistics
- Staff management capabilities
- Patient management
- Appointment monitoring
- System health indicators

#### Receptionist Dashboard
- Patient appointment management
- Check-in functionality
- Patient search and registration
- Waiting room management
- Advanced patient management tools

### 🎨 User Interface
- Professional, modern design
- Responsive layouts for desktop, tablet, and mobile
- Intuitive navigation
- Real-time data updates
- Dark mode support (TailwindCSS theme)

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/UI** - Component library
- **React Router** - Client-side routing
- **React Query** - API data fetching
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 13+** - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js

### 2. Environment Setup

**Backend (.env):**
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/careconnect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
BCRYPT_ROUNDS=10
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from root)
npm install
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Runs on: `http://localhost:5173`

## 📊 Demo Accounts

All demo accounts use password: **`password`**

| Role | Email | Access |
|------|-------|--------|
| Admin | admin@careconnect.com | Full system access |
| Doctor | doctor@careconnect.com | Clinical features |
| Doctor 2 | doctor2@careconnect.com | Clinical features |
| Doctor 3 | doctor3@careconnect.com | Clinical features |
| Receptionist | reception@careconnect.com | Reception features |
| Patient | patient@careconnect.com | Patient portal |
| Patient 2 | patient2@careconnect.com | Patient portal |
| Patient 3 | patient3@careconnect.com | Patient portal |
| Patient 4 | patient4@careconnect.com | Patient portal |

## 📁 Project Structure

```
careconnect/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── dashboard/       # Dashboard layouts
│   │   │   ├── landing/         # Landing page components
│   │   │   └── ui/              # Shadcn components
│   │   ├── contexts/            # React contexts (Auth)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   └── dashboard/       # Dashboard pages
│   │   └── lib/                 # Utilities
│   │       └── api.ts           # API client
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── config/              # Configuration
│   │   └── server.ts            # Entry point
│   └── package.json
│
├── PRODUCTION_SETUP.md          # Production deployment guide
├── TESTING_GUIDE.md             # QA testing checklist
├── DEPLOYMENT_READINESS.md      # Pre-launch checklist
└── README.md                    # This file
```

## 🔄 Data Flow

```
Frontend (React) 
    ↓
API Client (React Query)
    ↓
Express.js Backend
    ↓
PostgreSQL Database
    ↓
Models (User, Doctor, Patient, etc.)
```

## 🔐 Security Features

- **Password Security**: Bcrypt hashing with 10+ rounds
- **Token Management**: JWT with secure refresh tokens
- **Role-Based Access**: Middleware-based authorization
- **Input Validation**: Server-side validation on all endpoints
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Properly configured CORS headers
- **Environment Variables**: Sensitive data in .env files

## 🗄 Database Schema

The system includes comprehensive database tables:

- **users** - User accounts with roles
- **doctors** - Doctor profiles with specializations
- **patients** - Patient information and health data
- **appointments** - Appointment scheduling
- **medical_records** - Patient medical history
- **prescriptions** - Medication prescriptions
- **refresh_tokens** - Session management

## 📡 API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Patients
- `GET /patients` - List all patients
- `GET /patients/profile` - Get patient profile
- `PATCH /patients/profile` - Update profile
- `GET /patients/appointments` - Get appointments
- `POST /patients/appointments` - Book appointment
- `GET /patients/medical-records` - Get records
- `GET /patients/prescriptions` - Get prescriptions

### Doctors
- `GET /doctors` - List all doctors
- `GET /doctors/profile` - Get doctor profile
- `GET /doctors/appointments` - Get appointments
- `PATCH /doctors/appointments/:id/status` - Update status
- `POST /doctors/medical-records` - Create record
- `POST /doctors/prescriptions` - Create prescription

### Admin
- `GET /admin/doctors` - List doctors
- `GET /admin/patients` - List patients
- `GET /admin/appointments` - List appointments
- `GET /admin/medical-records` - List records
- `GET /admin/prescriptions` - List prescriptions

## 🚢 Deployment

### Production Deployment

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed setup instructions.

**Quick deployment with Vercel (Frontend) + Heroku (Backend):**

```bash
# Frontend
vercel deploy

# Backend
heroku create your-app-name
heroku addons:create heroku-postgresql
git push heroku main
```

## 📝 Documentation

- [Production Setup Guide](./PRODUCTION_SETUP.md) - Deploy to production
- [Testing Guide](./TESTING_GUIDE.md) - Complete testing checklist
- [Deployment Readiness](./DEPLOYMENT_READINESS.md) - Pre-launch checklist
- [Setup Instructions](./SETUP_INSTRUCTIONS.md) - Detailed setup steps

## 🧪 Testing

### Frontend Tests
```bash
npm run test              # Run tests
npm run test:watch       # Watch mode
```

### Backend Tests
```bash
cd backend
npm run test
```

## 🐛 Troubleshooting

### Database Connection Failed
```
Check DATABASE_URL in backend/.env
Ensure PostgreSQL is running
Verify database name is correct
```

### API Not Responding
```
Check backend is running on port 5000
Check VITE_API_URL in frontend/.env.local
Check network connection
Review browser console for CORS errors
```

### Authentication Issues
```
Clear browser localStorage
Restart both frontend and backend
Check JWT_SECRET is consistent
Verify tokens are stored correctly
```

### Database Reset
```bash
# Drop and recreate database
cd backend
npm run migrate
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Update tests
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 💬 Support

For issues and questions:
1. Check documentation files
2. Review GitHub issues
3. Contact support team

## 🎯 Roadmap

### Version 1.0 (Current)
- ✅ Authentication & Authorization
- ✅ Role-based dashboards
- ✅ Appointment management
- ✅ Medical records
- ✅ Prescription management

### Version 1.1
- [ ] Video consultation integration
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Advanced reporting

### Version 2.0
- [ ] Mobile app
- [ ] Telemedicine
- [ ] AI-powered diagnosis support
- [ ] Analytics dashboard

## 📞 Contact

- Lead Developer: [Your Name]
- Email: support@careconnect.com
- Website: careconnect.example.com

---

**Last Updated**: February 11, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Runs on: `http://localhost:5173`

## 📋 Demo Credentials

All demo accounts use password: **`password`**

| Role | Email | Access |
|------|-------|--------|
| **Administrator** | admin@careconnect.com | Full system access |
| **Doctor** | doctor@careconnect.com | Patient management |
| **Receptionist** | reception@careconnect.com | Appointment scheduling |
| **Patient** | patient@careconnect.com | Self-service portal |

## ✨ Features

### ✅ Fully Implemented

**Authentication & Security**
- User registration and login with JWT tokens
- Role-based access control (RBAC) for 4 roles
- Secure password hashing with bcryptjs
- Token refresh mechanism
- Automatic session management
- Logout functionality with token invalidation

**Admin Dashboard**
- System overview with real-time statistics
- Patient and staff management
- Appointment monitoring and analytics
- Activity logs and system reports
- User management and authorization

**Doctor Dashboard**
- Patient list management
- View and manage appointments
- Prescription management
- Medical records access
- Schedule management

**Patient Portal**
- View upcoming appointments
- Book appointments with doctors
- Medical history access
- Prescription tracking
- Lab reports and documents
- Profile management and updates

**Receptionist Dashboard**
- Appointment scheduling and management
- Patient check-in/check-out
- Staff coordination tools
- Call logging and tracking
- Report generation

## 🏗️ Architecture

### Frontend Stack
```
React 18 + TypeScript + Vite
├── Components (Shadcn UI)
├── Pages (React Router v6)  
├── Contexts (AuthContext)
├── Custom Hooks (useFetch)
├── API Client (lib/api.ts)
└── Styling (Tailwind CSS)
```

### Backend Stack
```
Node.js + Express + TypeScript
├── Controllers (Business Logic)
├── Models (Database ORM)
├── Routes (API Endpoints)
├── Middleware (Auth, Validation)
└── Config (Database Connection)
```

### Database
```
PostgreSQL with Complete Schema
├── users (core user data)
├── doctors (doctor profiles & specialization)
├── patients (patient profiles & medical info)
├── appointments (scheduling & status)
├── medical_records (patient history)
├── prescriptions (medication tracking)
└── refresh_tokens (session management)
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Create new account
POST   /api/auth/login             - Login user
POST   /api/user/logout            - Logout & invalidate tokens
POST   /api/user/refresh           - Get new access token
GET    /api/user/me                - Get current user profile
```

### Doctors
```
GET    /api/doctors                - List all doctors
GET    /api/doctors/profile        - Get logged-in doctor's profile
GET    /api/doctors/appointments   - Get doctor's appointments
PATCH  /api/doctors/appointments/:id/status - Update appointment status
```

### Patients
```
GET    /api/patients               - List all patients
GET    /api/patients/profile       - Get patient profile
PATCH  /api/patients/profile       - Update patient profile
GET    /api/patients/appointments  - Get patient's appointments
POST   /api/patients/appointments  - Book new appointment
```

### Admin
```
GET    /api/admin/doctors          - List all doctors
GET    /api/admin/patients         - List all patients
GET    /api/admin/appointments     - List all appointments
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication with expiration
- ✅ Refresh token mechanism in database
- ✅ CORS configured for frontend domain
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (parameterized queries)
- ✅ Soft delete support for data recovery
- ✅ Audit logging ready

## 📁 Project Structure

```
CareConnect/
├── backend/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/database.ts       # Database connection
│   │   ├── controllers/
│   │   │   ├── auth.ts              # Authentication logic
│   │   │   └── index.ts             # Doctors, patients, appointments
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT & role verification
│   │   ├── models/
│   │   │   ├── index.ts             # Database models
│   │   │   └── schema.ts            # Database initialization
│   │   ├── routes/
│   │   │   ├── auth.ts              # /api/auth routes
│   │   │   ├── doctors.ts           # /api/doctors routes
│   │   │   ├── patients.ts          # /api/patients routes
│   │   │   ├── admin.ts             # /api/admin routes
│   │   │   └── user.ts              # /api/user routes
│   │   └── server.ts                # Express app entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── src/                             # React frontend
│   ├── components/
│   │   ├── dashboard/               # Dashboard layouts
│   │   ├── landing/                 # Landing page
│   │   ├── ui/                      # Shadcn components
│   │   └── ProtectedRoute.tsx       # Route guard
│   ├── contexts/
│   │   └── AuthContext.tsx          # Global auth state
│   ├── hooks/
│   │   ├── useFetch.ts              # Data fetching
│   │   └── use-mobile.tsx           # Mobile detection
│   ├── lib/
│   │   ├── api.ts                   # API client & endpoints
│   │   └── utils.ts                 # Helper functions
│   ├── pages/
│   │   ├── Index.tsx                # Home page
│   │   ├── Login.tsx                # Login page
│   │   ├── Landing.tsx              # Landing page
│   │   ├── dashboard/               # Role dashboards
│   │   └── NotFound.tsx             # 404 page
│   ├── App.tsx                      # Main app & routing
│   ├── main.tsx                     # React entry
│   └── index.css                    # Global styles
│
├── .env.local                       # Frontend config
├── .gitignore
├── eslint.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
├── setup.bat                        # Windows setup
├── setup.sh                         # Unix setup
├── SETUP_INSTRUCTIONS.md            # Detailed guide
└── README.md                        # This file
```

## 🐛 Troubleshooting

### Backend Problems

**PostgreSQL Connection Error**
```bash
# Check if PostgreSQL is running
# Windows: Services app or "postgresql-14-x64" in Task Manager
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Verify database exists
psql -U postgres -l | grep careconnect

# Or use PgAdmin GUI
```

**Port 5000 Already in Use**
```bash
# Windows
netstat -ano | find ":5000"
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Module Dependencies Failed**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend Problems

**Cannot Connect to API**
- ✓ Backend running on port 5000? (`npm run dev` in `/backend`)
- ✓ VITE_API_URL correct in `.env.local`? (`http://localhost:5000/api`)
- ✓ Check Network tab in DevTools (F12)
- ✓ Clear browser cache (Ctrl+Shift+Delete)

**Login Not Working**
- ✓ Try demo credentials exactly as shown
- ✓ Check backend console for errors
- ✓ Verify database has users table
- ✓ Try logging from incognito window

**Style/Component Issues**
```bash
# Rebuild
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🚀 Production Deployment

### Before Going Live

1. **Generate Strong Secrets**
   ```bash
   # Generate 32-byte random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update .env**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<generated-secret>
   DATABASE_URL=<production-database>
   CORS_ORIGIN=<your-domain>
   BCRYPT_ROUNDS=12
   ```

3. **Build Frontend**
   ```bash
   npm run build
   # Output: dist/ folder
   ```

4. **Deployment Options**
   - **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
   - **Backend**: Heroku, AWS EC2, DigitalOcean, Railway
   - **Database**: AWS RDS, Azure Database, Heroku Postgres

## 📊 Database Initialization

The backend automatically:
1. Creates all tables on first run
2. Creates necessary indexes
3. Initializes demo users (see credentials above)

To reset database:
```bash
# Via psql
DROP DATABASE careconnect;
CREATE DATABASE careconnect;

# Restart backend server
npm run dev
```

## 🧪 Testing Demo

1. Open `http://localhost:5173`
2. Click "Get Started"
3. Try login with any demo credentials
4. Explore role-specific dashboards
5. Test appointment booking (as patient)
6. Update user profiles
7. View appointments across roles

All features are fully functional and connected to database!

## 📞 Getting Help

1. **Check console errors**: F12 → Console tab
2. **Check server logs**: Terminal running `npm run dev`
3. **Review Setup Guide**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
4. **Check Database**: Use PgAdmin or `psql` command

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📜 License

MIT License - Feel free to use for personal or commercial projects

## ✅ Checklist

- [x] Frontend with React + TypeScript
- [x] Backend with Node.js + Express
- [x] PostgreSQL database integration
- [x] JWT authentication
- [x] Role-based access control
- [x] Patient management
- [x] Doctor management
- [x] Appointment scheduling
- [x] API endpoints
- [x] Protected routes
- [x] Logout functionality
- [x] Demo data seeding
- [x] Responsive design
- [x] Error handling
- [x] Toast notifications

---

**Made with ❤️ for Healthcare**  
**Version 1.0.0** | **Status: Production Ready** ✅


