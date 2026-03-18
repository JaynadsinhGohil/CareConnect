# Vercel Deployment Guide for CareConnect with Supabase

## Summary
You have:
- **Frontend**: Vite React app (ready for Vercel)
- **Backend**: Node.js Express server (deploy to Render/Railway instead, or convert to Vercel Serverless Functions)
- **Database**: Supabase PostgreSQL

Your Supabase credentials:
- **Project URL**: `https://jsucvnqdjbkydkgwmdrc.supabase.co`
- **Publishable Key**: `sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4`

---

## Step 1: Get Supabase Database Connection String

Go to your Supabase project:
1. **Settings** → **Database** → **Connection Pooling** (or **Direct connection**)
2. Copy the connection string (looks like: `postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres`)
3. Replace `[PASSWORD]` with your Supabase database password (the one you set when creating the project)
4. **Save this as `DB_CONNECTION_STRING` — you'll need it for backend deployment**

---

## Step 2: Local Testing with Supabase

### Test Backend
In `backend/.env`, set:
```
PORT=5000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
BCRYPT_ROUNDS=10
```

Run:
```bash
cd backend
npm install
npm run dev
```

Test: Open `http://localhost:5000/api` (or your API endpoint) — it should work.

### Test Frontend
Your `.env.local` is already set:
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://jsucvnqdjbkydkgwmdrc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4
```

Run:
```bash
npm install
npm run dev
```

Open `http://localhost:8080` — test login, signup, and database operations.

---

## Step 3: Deploy Frontend to Vercel

### 3a. Push code to GitHub
```bash
git add .
git commit -m "Add Supabase env vars for Vercel deployment"
git push origin main
```

### 3b. Create Vercel Project
1. Go to **vercel.com** → **Dashboard** → **Add New Project**
2. **Import Git Repo** → select your CareConnect repo
3. **Framework**: Vite
4. **Root Directory**: `.` (or leave empty — Vercel auto-detects)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click **Deploy** (initial build may fail — that's okay, we'll set env vars next)

### 3c. Set Environment Variables
In Vercel project:
1. **Settings** → **Environment Variables**
2. Add three variables:

   | Name | Value | Scope |
   |------|-------|-------|
   | `VITE_API_URL` | `https://your-backend-url.com/api`* | Production, Preview, Development |
   | `VITE_SUPABASE_URL` | `https://jsucvnqdjbkydkgwmdrc.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4` | Production, Preview, Development |

   *After deploying backend, replace with actual backend URL (e.g., `https://careconnect-api.railway.app/api`)

3. Click **Save**
4. Trigger a redeploy: **Deployments** → **Redeploy** (or push a git commit)

---

## Step 4: Deploy Backend to Render (Recommended)

### Option A: Use Render.com (easiest)

1. Go to **render.com** → Sign up → **New** → **Web Service**
2. **Connect GitHub repo** (or paste GitHub URL)
3. Fill in:
   - **Name**: `careconnect-api`
   - **Environment**: `Node`
   - **Build command**: `cd backend && npm install && npm run build`
   - **Start command**: `cd backend && node dist/server.js`
   - **Plan**: Free tier (starts slow, but free)

4. Click **Create Web Service**
5. Go to **Environment** tab and add variables:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres` |
   | `JWT_SECRET` | `your-super-secret-key-here` |
   | `JWT_EXPIRE` | `7d` |
   | `NODE_ENV` | `production` |
   | `BCRYPT_ROUNDS` | `10` |

6. Save — Render auto-redeploys
7. Once deployment is live (green), copy the service URL (e.g., `https://careconnect-api.onrender.com`)
8. Go back to **Vercel** → **Settings** → **Environment Variables** → update `VITE_API_URL` to `https://careconnect-api.onrender.com/api` → **Redeploy**

### Option B: Use Railway.app (also easy)
Similar steps: create new project → connect GitHub → set `DATABASE_URL` and other env vars → deploy.
URL format: `https://your-service-name-prod.up.railway.app`

---

## Step 5: Verify Everything Works

1. Visit your Vercel frontend URL: `https://your-project.vercel.app`
2. Test **Login / Signup** — should work with Supabase auth
3. Test **Create/Read records** — check Supabase Studio to confirm data is saved
4. Check **Render/Railway logs** for errors
5. Check **Vercel logs** for frontend errors

---

## Troubleshooting

### Backend can't connect to Supabase
- Check `DATABASE_URL` format: `postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres`
- Verify password is correct
- Ensure Supabase project is active (check Supabase dashboard)

### Frontend shows CORS errors
- Add your Vercel domain to backend CORS (in `backend/src/server.ts`):
  ```javascript
  cors({
    origin: ['https://your-project.vercel.app', 'http://localhost:8080'],
  })
  ```
- Redeploy backend

### Vercel shows build errors
- Check **Vercel → Deployments → Build Logs**
- Ensure all dependencies are in `package.json`
- Make sure `.env.local` is in `.gitignore` (it's a local file)

---

## Summary of All Env Vars

### Frontend (Vercel → Environment Variables)
```
VITE_API_URL=https://careconnect-api.onrender.com/api
VITE_SUPABASE_URL=https://jsucvnqdjbkydkgwmdrc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_T1uC3Fyucu5MAtUADzP4kg_vcWio7I4
```

### Backend (Render → Environment)
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.jsucvnqdjbkydkgwmdrc.supabase.co:5432/postgres
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=production
BCRYPT_ROUNDS=10
```

### Local Dev
- `.env.local` (frontend) — already set
- `backend/.env` — update `DATABASE_URL` to Supabase before testing

---

**Next**: Follow Steps 1–5 in order. Let me know if you hit any errors!
