# CareConnect - Deployment Guide (Supabase + Vercel + Render)

## Quick Overview

**Project Stack:**
- **Frontend**: React + Vite (Deploy to Vercel)
- **Backend**: Node.js + Express (Deploy to Render)
- **Database**: Supabase PostgreSQL
- **Auth**: JWT-based authentication

**Current Supabase Credentials:**
- Project URL: `https://jsucvnqdjbkydkgwmdrc.supabase.co`
- Publishable Key: `sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4`

---

## Step 1: Local Testing

### Prerequisites
- Node.js 18+ installed
- Supabase account with project created
- PostgreSQL tools (optional, for exporting local DB)

### Setup Backend

```bash
# Navigate to backend
cd backend

# Copy .env from .env.example and update DATABASE_URL
cp .env.example .env

# Get Supabase connection string from: 
# Supabase Dashboard → Settings → Database → Connection String
# Paste it in .env as DATABASE_URL

# Install dependencies
npm install

# Run development server
npm run dev
```

Server will start at `http://localhost:5000`. Test health check:
```bash
curl http://localhost:5000/api/health
```

### Setup Frontend

```bash
# Navigate to project root
cd ..

# Dependencies are already in .env.local (set during initial setup)
# If not, create .env.local with:
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://jsucvnqdjbkydkgwmdrc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4
EOF

# Install and run
npm install
npm run dev
```

Frontend will start at `http://localhost:8080`.

### Test Application

1. Open `http://localhost:8080`
2. **Register** a new account
3. **Login** with the created account
4. Test creating/viewing data
5. Verify data appears in **Supabase Studio** → your project → Tables

If all work → you're ready to deploy to production!

---

## Step 2: Export Local Database to Supabase

If you have existing data in a local PostgreSQL database:

### Export from Local
```powershell
# Windows PowerShell
$env:PGPASSWORD='your_local_db_password'; pg_dump -h localhost -U postgres -f backup.sql your_local_db_name
```

### Import to Supabase
Get Supabase connection details:
- Go to Supabase Dashboard → Settings → Database → Connection String
- Copy the connection string

```powershell
# Windows PowerShell
$env:PGPASSWORD='your_supabase_db_password'
psql "postgresql://postgres@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres" -f backup.sql
```

---

## Step 3: Deploy Backend to Render

### Sign Up & Create Service
1. Go to https://render.com
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. **Connect GitHub account** and select your CareConnect repository
5. Fill in:
   - **Name**: `careconnect-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && node dist/server.js`
   - **Plan**: Free tier (sufficient for dev/testing)
6. Click **Create Web Service**

### Set Environment Variables
1. After service creates, go to **Environment** tab
2. **Add Environment Variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres` |
| `JWT_SECRET` | Generate a strong 32+ character secret (use `openssl rand -base64 32` on Mac/Linux or PowerShell) |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `BCRYPT_ROUNDS` | `10` |
| `FRONTEND_URL` | `https://your-project.vercel.app` (set after deploying frontend) |

3. Click **Save** — Render auto-redeploys

### Get Backend URL
Once deployed (green status), your backend URL will be:
```
https://careconnect-api.onrender.com
```

(Or whatever name you chose on Render)

---

## Step 4: Deploy Frontend to Vercel

### Sign Up & Import Project
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. **Import Git Repository** → select your CareConnect repo
5. **Framework**: Vite (auto-detected)
6. **Root Directory**: `.` (leave as-is)
7. **Build Command**: `npm run build`
8. **Output Directory**: `dist`
9. Click **Deploy** (will start building)

### Set Environment Variables
1. Go to **Settings** → **Environment Variables**
2. **Add the following variables** (for all environments: Production, Preview, Development):

| Name | Value | Scope |
|------|-------|-------|
| `VITE_API_URL` | `https://careconnect-api.onrender.com/api` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://jsucvnqdjbkydkgwmdrc.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4` | Production, Preview, Development |

3. Click **Save**
4. Go to **Deployments** → **Redeploy** (to apply new vars)

### Your Live Site
Once deployed, your frontend URL:
```
https://your-project.vercel.app
```

Vercel will generate a unique project name if not specified.

---

## Step 5: Update Backend for Frontend CORS

Now that frontend is deployed, update backend CORS:

### On Render Dashboard:
1. Go to your `careconnect-api` service
2. **Environment** tab
3. **Edit** the `FRONTEND_URL` environment variable:
   - Set to: `https://your-project.vercel.app`
4. **Save** (auto-redeploys)

---

## Step 6: Verification Checklist

- [ ] Local backend connects to Supabase and runs (`npm run dev` in backend/)
- [ ] Local frontend starts and shows login page (`npm run dev` at root)
- [ ] Local test: Register → Login → Create/View data → See it in Supabase
- [ ] Backend deployed to Render with health checks passing
- [ ] Frontend deployed to Vercel
- [ ] Live site (https://your-project.vercel.app) loads without errors
- [ ] Live site: Register → Login → Create data
- [ ] Supabase Studio shows new data from live site
- [ ] No CORS errors in browser console (F12 → Console)
- [ ] Render logs show successful DB connections

---

## Troubleshooting

### Backend won't connect to Supabase
1. Verify `DATABASE_URL` format: `postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres`
2. Check password is correct (Supabase Dashboard → Settings → Database)
3. Ensure Supabase project is active
4. View Render logs: **Logs** tab

### Frontend shows CORS errors (Network errors)
1. Check `VITE_API_URL` points to deployed backend (Render URL)
2. Ensure backend has correct `FRONTEND_URL` env var
3. Clear browser cache (Ctrl+Shift+Delete on Windows)
4. Check browser console (F12 → Console) for full error

### Can't register/login
1. Check backend is running (Render logs)
2. Check user is being created in Supabase Studio → Tables → users
3. Verify JWT_SECRET matches between local and Render

### Data not saving
1. Check Supabase Studio to see if tables exist
2. If tables are missing, you may need to migrate schema (see Step 2)
3. Check Render logs for database errors
4. Verify DATABASE_URL is correct

---

## Project Structure
```
CareConnect/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express app setup, CORS config
│   │   ├── config/
│   │   │   └── database.ts    # PostgreSQL connection (uses env var)
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database schemas
│   │   └── middleware/        # Auth middleware, etc.
│   ├── .env                   # KEEP SECRET (gitignored) - Local dev
│   ├── .env.example           # Template - commit to git
│   └── package.json
├── src/
│   ├── pages/                 # React page components
│   ├── components/            # Reusable components
│   ├── contexts/              # AuthContext for state
│   ├── lib/                   # Utilities (api.ts, etc.)
│   └── App.tsx                # Main routing
├── .env.local                 # KEEP SECRET (gitignored) - Frontend local dev
├── .env.example               # Template - commit to git
├── .gitignore                 # Includes .env, .env.local, etc.
├── package.json               # Frontend dependencies
└── vercel.json                # Vercel config (optional)
```

---

## Important Notes

1. **Never commit `.env` or `.env.local`** — use `.env.example` as template
2. **JWT_SECRET must be different in production** — generate a new strong secret
3. **FRONTEND_URL in backend** — must match your Vercel domain after deployment
4. **Supabase credentials (anon key) are public** — safe to include in frontend
5. **Database password is secret** — never share DATABASE_URL

---

## Next Steps
- Monitor Render and Vercel logs regularly
- Set up error tracking (Sentry, LogRocket, etc.) for production
- Configure custom domain if needed
- Set up automated backups in Supabase
- Plan database scaling strategy

For questions, refer to official docs:
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
