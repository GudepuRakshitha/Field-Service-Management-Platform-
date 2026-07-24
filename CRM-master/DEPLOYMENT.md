# Project KEYSTONE Deployment Guide

This guide covers both **Local Docker Development** and **Cloud Deployment (Supabase DB + Vercel Frontend + Cloud Backend)**.

---

## 1. Local Docker Compose Setup (Kept 100% Intact)

To run the complete system locally with Docker (PostgreSQL + MailHog + Backend + Frontend):

```bash
# 1. Copy local environment variables
cp .env.example .env

# 2. Build and launch containers
docker-compose up --build
```

**Local Ports:**
- **Frontend SPA**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot REST API**: [http://localhost:8080](http://localhost:8080)
- **MailHog Local Inbox**: [http://localhost:8025](http://localhost:8025)
- **PostgreSQL Database**: `localhost:5432`

---

## 2. Cloud Deployment (Supabase + Vercel)

### Architecture
```
[ Supabase PostgreSQL ] <--- (JDBC SSL) ---> [ Spring Boot Backend (Render/Koyeb) ] <--- (REST API) ---> [ Vercel Frontend SPA ]
```

---

### Step A: Supabase Database Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database**.
3. Under **Connection string**, copy the **JDBC** parameters:
   ```text
   Host: db.[YOUR-PROJECT-REF].supabase.co
   Port: 5432
   Database Name: postgres
   User: postgres
   Password: [YOUR-SUPABASE-PASSWORD]
   ```

---

### Step B: Backend Deployment (Render / Koyeb / Railway)
1. Push your repository to GitHub / GitLab.
2. Create a **Web Service** on [Render.com](https://render.com) (or Koyeb).
3. Set **Root Directory** to `backend` and runtime to **Docker** (using `backend/Dockerfile`).
4. Add Environment Variables:

   ```env
   # NOTE: Render/Koyeb are IPv4-only. Use Supabase Connection Pooler (port 6543) instead of direct host (5432).
   SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres?sslmode=require
   DB_USER=postgres.[YOUR-PROJECT-REF]
   DB_PASSWORD=[YOUR-SUPABASE-PASSWORD]
   KEYSTONE_JWT_SECRET=v9y$B&E)H@MbQeThWmZq4t7w!z%C*F-JaNdRfUjXn2r5u8x/A?D(G+KbPeShVkYp
   ```

5. Click **Deploy**. Flyway will automatically run database migrations (`V1`, `V2`, `V3`) on startup to provision tables and seed initial demo accounts!

---

### Step C: Vercel Frontend Deployment
1. Log in to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository and set the **Root Directory** to `frontend`.
3. Vercel will automatically detect `frontend/vercel.json` and Vite.
4. Under **Environment Variables**, set:
   ```env
   VITE_API_BASE_URL=https://[YOUR-BACKEND-NAME].onrender.com/api
   ```
5. Click **Deploy**. Your application is now live on Vercel with a free SSL certificate!
