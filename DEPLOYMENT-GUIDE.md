# 🚀 Deployment Guide - Render + Vercel

## Complete Guide to Deploy Pulse HR Tool

**Backend**: Render (Free tier)
**Frontend**: Vercel (Free tier)

---

## 📋 Prerequisites

1. ✅ GitHub account with your project pushed
2. ✅ [Render.com](https://render.com) account (sign up free)
3. ✅ [Vercel.com](https://vercel.com) account (sign up free)

---

## 🎯 Deployment Overview

```
GitHub Repository
       ↓
   ┌───┴───┐
   ↓       ↓
Render   Vercel
(Backend)(Frontend)
   ↓       ↓
   └───┬───┘
       ↓
  Live App!
```

---

## 🔧 PART 1: Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. **Sign up with GitHub** (easiest option)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service

1. **Click "New +"** (top right)
2. Select **"Web Service"**
3. **Connect Repository**:
   - If first time: Click "Configure account" → Select repositories
   - Find: `pulse-hr-tool`
   - Click **"Connect"**

### Step 3: Configure Web Service

```
Name: pulse-hr-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: (leave empty)
Runtime: Node

Build Command: (leave empty or "echo 'No build needed'")
Start Command: node backend/server.js

Instance Type: Free
```

### Step 4: Environment Variables

Click **"Advanced"** → Add Environment Variables:

```
PORT = 4000
NODE_ENV = production
```

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://pulse-hr-backend.onrender.com`
4. **Save this URL** - you'll need it!

### Step 6: Test Backend

```
Visit: https://pulse-hr-backend.onrender.com/api/dashboard

Should return JSON with stats
```

---

## 🎨 PART 2: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. **Sign up with GitHub** (recommended)
4. Authorize Vercel

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository**:
   - Find: `pulse-hr-tool`
   - Click **"Import"**

### Step 3: Configure Project

```
Framework Preset: Other
Root Directory: ./
Build Command: (leave empty)
Output Directory: frontend
Install Command: (leave empty)
```

### Step 4: Environment Variables

Add environment variable:

```
Name: VITE_API_URL
Value: https://pulse-hr-backend.onrender.com
```

*(Replace with your actual Render URL from Part 1)*

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. You'll get a URL like: `https://pulse-hr-tool.vercel.app`
4. Visit your deployed app!

---

## 🔗 Update API URL in Frontend

After getting your Render backend URL, update `frontend/app.js`:

```javascript
const API = window.location.hostname === 'localhost' 
  ? "/api" 
  : "https://YOUR-BACKEND-URL.onrender.com/api";
```

Replace `YOUR-BACKEND-URL` with your actual Render URL.

Then push changes to GitHub:

```bash
git add frontend/app.js
git commit -m "Update: API URL for production"
git push
```

Vercel will auto-deploy the update!

---

## ✅ Verify Deployment

### Test Backend
```
✓ https://pulse-hr-backend.onrender.com/api/dashboard
✓ https://pulse-hr-backend.onrender.com/api/employees
```

### Test Frontend
```
✓ https://pulse-hr-tool.vercel.app
✓ Login as admin
✓ Try adding employee
✓ Check if data loads
```

---

## 🎯 Your Live URLs

```
🌐 Frontend: https://pulse-hr-tool.vercel.app
🔧 Backend:  https://pulse-hr-backend.onrender.com
📊 API:      https://pulse-hr-backend.onrender.com/api
```

---

## 🔄 Continuous Deployment

Both platforms auto-deploy when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Feature: New enhancement"
git push

# Vercel redeploys frontend automatically
# Render redeploys backend automatically
```

---

## ⚡ Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

### For Render (Backend):
1. Go to your service → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: 502 Bad Gateway
```
Solution: Check Render logs
- Go to your service
- Click "Logs" tab
- Look for errors
```

**Problem**: Data not persisting
```
Solution: Render free tier resets on inactivity
- Upgrade to paid tier for persistent storage
- Or use external database (MongoDB Atlas)
```

**Problem**: Cold starts (slow first load)
```
Solution: Render free tier sleeps after 15 min inactivity
- First request wakes it up (takes 30-60 seconds)
- Upgrade to keep-alive or use cron job to ping
```

### Frontend Issues

**Problem**: Cannot connect to backend
```
Solution: Check CORS and API URL
- Verify API URL in app.js
- Check Render logs for CORS errors
- Make sure backend is running
```

**Problem**: 404 on routes
```
Solution: Add vercel.json configuration
- Already created in your project
- Push to GitHub and redeploy
```

**Problem**: Images not loading
```
Solution: Update image paths
- Use relative paths
- Or upload to cloud storage (Cloudinary, AWS S3)
```

---

## 📊 Free Tier Limitations

### Render Free Tier:
- ✅ 512 MB RAM
- ✅ Auto-sleep after 15 min inactivity
- ✅ Shared CPU
- ✅ 750 hours/month
- ❌ No persistent disk (data resets)

### Vercel Free Tier:
- ✅ 100 GB bandwidth
- ✅ Serverless functions
- ✅ Automatic SSL
- ✅ Fast CDN
- ✅ Unlimited deployments

---

## 💡 Upgrade Options

### Keep Backend Always On:
```
Option 1: Upgrade Render to $7/month
Option 2: Use Railway.app (similar, different pricing)
Option 3: Use Heroku (if you have credits)
```

### Add Database:
```
Option 1: MongoDB Atlas (free tier)
Option 2: PostgreSQL on Render
Option 3: Supabase (free tier)
```

---

## 🔒 Security for Production

### Backend:
1. **Change admin password** in `frontend/app.js`
2. **Add rate limiting** to prevent abuse
3. **Use environment variables** for secrets
4. **Enable HTTPS** (automatic on Render)

### Frontend:
1. **Remove test data** before deploying
2. **Minify code** (optional, for performance)
3. **Add error tracking** (Sentry, LogRocket)

---

## 📧 Share Your Deployed App

### In Email to HR:

```
Live Demo: https://pulse-hr-tool.vercel.app

Admin Login:
- Click "🔐 Admin Access"
- Password: admin123

The application is fully deployed and ready for testing.
All features are live and functional.

Backend API: https://pulse-hr-backend.onrender.com
Source Code: https://github.com/adityarkulkarni45-ux/pulse-hr-tool
```

---

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] API URL updated in frontend
- [ ] Admin login works
- [ ] Can add employees
- [ ] Can apply/approve leaves
- [ ] Photos upload correctly
- [ ] Dashboard loads all data
- [ ] Mobile responsive works
- [ ] HTTPS enabled (automatic)
- [ ] Custom domain added (optional)

---

## 📱 Test on Mobile

```
1. Open Vercel URL on phone
2. Test all features
3. Check responsive design
4. Try photo capture (if camera available)
```

---

## 🚀 You're Live!

Your HR tool is now accessible worldwide! 🌍

**Share it**:
- Resume
- LinkedIn
- Portfolio
- Job applications
- Social media

**Monitor it**:
- Render dashboard (backend logs)
- Vercel analytics (visitor stats)
- GitHub (for updates)

---

## 📞 Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)

---

**Congratulations on deploying your app! 🎊**
