# How to Run — EduCollab Project Management System

## Prerequisites

### 1. Install MongoDB Community Server
MongoDB is required for the backend database.

**Download:** https://www.mongodb.com/try/download/community

- Choose **Windows**, Version **7.0**, Package **MSI**
- Install with default settings (includes MongoDB as a Windows service)
- After installing, MongoDB runs automatically on `localhost:27017`

**Alternatively, use MongoDB Atlas (Cloud):**
1. Sign up at https://cloud.mongodb.com
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/projectmgmt
   ```

---

## Start the Application

### Option A: Run manually in two terminals

**Terminal 1 — Backend:**
```powershell
cd "C:\Users\jainh\Desktop\New folder\backend"
node src/server.js
```

**Terminal 2 — Frontend:**
```powershell
cd "C:\Users\jainh\Desktop\New folder\frontend"
npm run dev
```

Then open: **http://localhost:3000**

---

### Option B: Use the start script

```powershell
cd "C:\Users\jainh\Desktop\New folder"
.\start.ps1
```

---

## Test Accounts (Register these)

Sign up at **http://localhost:3000/signup** with these roles:

| Role | What they can do |
|------|-----------------|
| **Guide** | Create projects, assign leaders/members, review updates, view all analytics |
| **Group Leader** | Assign tasks, monitor team, schedule meetings, add GitHub/Drive links |
| **Member** | View tasks, submit daily updates, join meetings |

## Application URLs

| Page | URL |
|------|-----|
| Login | http://localhost:3000/login |
| Signup | http://localhost:3000/signup |
| Dashboard | http://localhost:3000/dashboard |
| Projects | http://localhost:3000/projects |
| Tasks Board | http://localhost:3000/tasks |
| Daily Updates | http://localhost:3000/updates |
| Meetings | http://localhost:3000/meetings |
| Files | http://localhost:3000/files |
| Notifications | http://localhost:3000/notifications |
| Backend API Health | http://localhost:5000/api/health |
