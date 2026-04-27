# How to Run — EduCollab Project Management System Backend

## Prerequisites

### 1. Database
The project currently uses a cloud database hosted on Neon Tech (PostgreSQL) and MongoDB.
Check your `backend/.env` file to ensure the connection strings (`DATABASE_URL`, `MONGO_URI`) are correct.

---

## Start the Backend Application

**Terminal:**
```powershell
cd "C:\Users\jainh\Desktop\New folder\backend"
node src/server.js
```

**Alternatively, use the start script:**
```powershell
cd "C:\Users\jainh\Desktop\New folder"
.\start.ps1
```

The backend API will run on **http://localhost:5000**.

## Start the Frontend Application

The frontend is a modern Next.js application built with the Stitch-by-Google design system.

**Terminal:**
```powershell
cd "C:\Users\jainh\Desktop\New folder\frontend"
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**.

---

## Backend API Endpoints

| Resource | Base Route |
|------|-----|
| Auth | /api/auth |
| Users | /api/users |
| Projects | /api/projects |
| Tasks | /api/tasks |
| Updates | /api/updates |
| Meetings | /api/meetings |
| Files | /api/files |
| Notifications | /api/notifications |
| Health Check | http://localhost:5000/api/health |

*Note: The frontend has been rebuilt using Next.js 16 and Tailwind CSS v4, featuring role-based dashboards and a mobile-first design.*
