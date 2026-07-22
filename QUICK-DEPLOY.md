# ⚡ Quick Deployment Guide

## 🚀 Deploy in 10 Minutes!

---

## Step 1: Push to GitHub (if not done)

```bash
cd c:\Users\adity\Downloads\Pulse-HR-Tool-Prototype\hr-tool
git add .
git commit -m "Ready for deployment"
git push
```

---

## Step 2: Deploy Backend (Render) - 5 minutes

### 2.1 Create Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2.2 Create Web Service
- Click "New +" → "Web Service"
- Connect `pulse-hr-tool` repository
- Configuration:
  ```
  Name: pulse-hr-backend
  Build Command: (empty)
  Start Command: node backend/server.js
  Instance: Free
  ```
- Click "Create Web Service"

### 2.3 Copy URL
- Wait for deployment (2-3 min)
- Copy URL: `https://pulse-hr-backend.onrender.com`

---

## Step 3: Update Frontend API URL - 1 minute

### 3.1 Edit app.js
Open `frontend/app.js` and find this line:
```javascript
const API = window.location.hostname === 'localhost' 
  ? "/api" 
  : "https://pulse-hr-backend.onrender.com/api";
```

### 3.2 Replace with YOUR Render URL
```javascript
const API = window.location.hostname === 'localhost' 
  ? "/api" 
  : "https://YOUR-BACKEND-URL.onrender.com/api";
```

### 3.3 Push Changes
```bash
git add frontend/app.js
git commit -m "Update API URL for production"
git push
```

---

## Step 4: Deploy Frontend (Vercel) - 4 minutes

### 4.1 Create Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

### 4.2 Import Project
- Click "Add New..." → "Project"
- Select `pulse-hr-tool`
- Click "Import"

### 4.3 Configure
```
Framework: Other
Root Directory: ./
Output Directory: frontend
```

### 4.4 Deploy
- Click "Deploy"
- Wait 1-2 minutes
- Copy URL: `https://pulse-hr-tool.vercel.app`

---

## Step 5: Test! - 2 minutes

### 5.1 Open Frontend URL
```
https://pulse-hr-tool.vercel.app
```

### 5.2 Test Features
- ✓ Login as admin (password: admin123)
- ✓ View dashboard
- ✓ Check if data loads
- ✓ Try adding employee

---

## ✅ Done!

**Your URLs**:
- 🌐 Frontend: `https://pulse-hr-tool.vercel.app`
- 🔧 Backend: `https://pulse-hr-backend.onrender.com`

**Share it**:
```
Live Demo: https://pulse-hr-tool.vercel.app
GitHub: https://github.com/adityarkulkarni45-ux/pulse-hr-tool
```

---

## 🐛 Common Issues

### Issue 1: "Cannot connect to backend"
**Fix**: Check if backend URL in app.js matches your Render URL

### Issue 2: "502 Bad Gateway" 
**Fix**: Wait 30 seconds - Render free tier has cold starts

### Issue 3: "Data not loading"
**Fix**: Open browser console (F12) to see exact error

---

## 📱 Share in Email

```
Dear [HR Manager],

I'm pleased to share the live deployment of the Pulse HR Tool:

🌐 Live Demo: https://pulse-hr-tool.vercel.app

Login Credentials:
• Admin: Click "🔐 Admin Access" → Password: admin123
• Employee: Select from employee list

The application is fully deployed with:
✓ Interactive dashboard with analytics
✓ Employee management with photo capture
✓ Leave management system
✓ Role-based access control
✓ Mobile responsive design

Technical Details:
• Frontend: Vercel (CDN deployed)
• Backend: Render (Node.js REST API)
• Source: https://github.com/adityarkulkarni45-ux/pulse-hr-tool

The application is production-ready and accessible 24/7.

Best regards,
Aditya Kulkarni
```

---

## 🎉 Congratulations!

Your app is live and accessible worldwide! 🌍
