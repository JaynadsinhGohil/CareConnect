# 🚀 CareConnect - Quick Start Guide

## ✅ What's Been Built

Your complete healthcare management system is ready! Here's what's included:

### Backend (Node.js + Express + PostgreSQL)
- ✅ Express server with CORS support
- ✅ PostgreSQL database with complete schema
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control
- ✅ 5 API route groups (Auth, Doctors, Patients, Admin, User)
- ✅ Proper error handling and validation
- ✅ Database initialization and seeding

### Frontend (React + TypeScript + Vite)
- ✅ AuthContext for global state management
- ✅ Protected routes with role checking
- ✅ API client with request utilities
- ✅ Login page with demo credentials auto-fill
- ✅ Role-specific dashboards (Admin, Doctor, Receptionist, Patient)
- ✅ Logout functionality
- ✅ Toast notifications (Sonner)
- ✅ Responsive design with Shadcn UI

### Database (PostgreSQL)
- ✅ Users table with role support
- ✅ Doctors & Patients profile tables
- ✅ Appointments scheduling table
- ✅ Medical records table
- ✅ Prescriptions table
- ✅ Refresh tokens for session management
- ✅ Proper indexes and foreign keys
- ✅ Auto initialization on startup

---

## 🏃 Getting Started (5 Minutes)

### Step 1: Create Database
```bash
# Open PostgreSQL command line or PgAdmin
psql -U postgres

# Create database
CREATE DATABASE careconnect;
```

### Step 2: Update Backend Config
Edit `backend/.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/careconnect
JWT_SECRET=your_secret_key_here
```

### Step 3: Start Backend
```bash
cd backend
npm install
npm run dev
```
✓ Server runs on http://localhost:5000

### Step 4: Start Frontend  
```bash
# New terminal, from root directory
npm install
npm run dev
```
✓ App opens on http://localhost:5173

---

## 👥 Demo Logins (Password for All: `password`)

| Role | Email |
|------|-------|
| Admin | admin@careconnect.com |
| Doctor | doctor@careconnect.com |
| Reception | reception@careconnect.com |
| Patient | patient@careconnect.com |

Just click the role button and email/password will auto-fill!

---

## 🎯 Key Features to Try

1. **Login** - Select role, credentials auto-fill, click "Sign In"

2. **Admin Dashboard**
   - See total patients, doctors, appointments
   - View recent activity
   - Quick action buttons

3. **Patient Dashboard**
   - View appointments
   - Book new appointment
   - Manage profile

4. **Doctor Dashboard**
   - See patient appointments
   - Update appointment status

5. **Logout** - Click user menu → Sign Out

---

## 📁 Important Files

### Frontend
- `src/App.tsx` - Main app with routing
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/lib/api.ts` - API client
- `src/components/ProtectedRoute.tsx` - Route guards
- `.env.local` - Frontend config

### Backend
- `backend/src/server.ts` - Express server
- `backend/src/models/schema.ts` - Database schema
- `backend/src/controllers/auth.ts` - Auth logic
- `backend/src/routes/` - API routes
- `backend/.env` - Backend config

### Database
- Auto-created on first backend startup
- Demo users auto-seeded
- All tables have proper relationships

---

## 🔌 API Base Usage

### In Frontend Code
```typescript
import { patientApi, doctorApi, adminApi } from '@/lib/api';

// Get patient appointments
const { data: appointments } = await patientApi.getAppointments();

// Book appointment
await patientApi.bookAppointment({ doctorId, appointmentDate, reason });

// Get all doctors (admin)
const { data: doctors } = await adminApi.getDoctors();
```

### Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Logout
await logout();
```

---

## 🧪 Test Checklist

- [ ] Can login with each role
- [ ] Role-specific dashboard displays
- [ ] Cannot access other role dashboards (redirects)
- [ ] Statistics load from database
- [ ] Can logout successfully
- [ ] Browser localStorage cleared after logout
- [ ] API calls show in Network tab (DevTools - F12)
- [ ] No console errors

---

## 🐛 If Something Doesn't Work

### Common Issues

**"Cannot connect to database"**
- Verify PostgreSQL running
- Check DATABASE_URL in backend/.env
- Ensure careconnect database exists

**"Cannot connect to backend"**
- Is `npm run dev` running in backend folder?
- Is VITE_API_URL correct in .env.local?
- Check Network tab in DevTools (F12)

**"Cannot login"**
- Verify database exists and has users
- Check backend console for error message
- Try exact credentials from list above
- Clear browser cache (Ctrl+Shift+Delete)

**Port already in use**
```bash
# Kill process using port 5000 or 5173
# Windows: netstat -ano | find ":5000"
# macOS/Linux: lsof -i :5000
```

---

## 📚 Documentation Files

1. **SETUP_INSTRUCTIONS.md** - Detailed setup guide
2. **README.md** - Full documentation  
3. **This file** - Quick reference

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- Tokens expire after 7 days
- Refresh tokens stored in database  
- CORS enabled for localhost:5173
- SQL injection protected with parameterized queries
- All API calls require authentication (except login/register)

---

## 📞 Need Help?

1. Check browser console: `F12` → Console tab
2. Check server terminal for error logs
3. Verify database with PgAdmin or `psql`
4. Review README.md for detailed docs
5. Check SETUP_INSTRUCTIONS.md for more details

---

## 🎉 You're All Set!

Your complete healthcare management system is ready to use. All features work end-to-end with real database integration!

**Next Steps:**
1. Explore the admin dashboard
2. Create more test users (use registration page)
3. Book appointments as patient
4. View appointments as doctor
5. Customize to your needs (colors, fields, etc.)

**Happy coding! 🚀**
