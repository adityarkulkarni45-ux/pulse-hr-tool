# 🔐 Environment Variables Guide

## Complete Guide for Render and Vercel Environment Variables

---

## 🔧 RENDER (Backend) - Environment Variables

When deploying to Render, add these environment variables:

### Required Variables:

```
PORT = 4000
NODE_ENV = production
```

### How to Add in Render:

1. **During Initial Setup**:
   - While creating Web Service
   - Scroll to "Advanced" section
   - Click "Add Environment Variable"
   - Add each variable

2. **After Deployment**:
   - Go to your service dashboard
   - Click "Environment" tab (left sidebar)
   - Click "Add Environment Variable"
   - Add each variable
   - Click "Save Changes"
   - Service will auto-redeploy

### Visual Guide for Render:

```
┌─────────────────────────────────────┐
│ Environment Variables               │
├─────────────────────────────────────┤
│ Key         │ Value                 │
├─────────────┼───────────────────────┤
│ PORT        │ 4000                  │
│ NODE_ENV    │ production            │
└─────────────────────────────────────┘
```

### Optional Variables for Render:

```
# Admin Password (if you want to change it)
ADMIN_PASSWORD = your-secure-password-here

# CORS Origins (if you want to restrict access)
ALLOWED_ORIGINS = https://pulse-hr-tool.vercel.app

# Database URL (if you add external database later)
DATABASE_URL = mongodb://...
```

---

## 🎨 VERCEL (Frontend) - Environment Variables

For Vercel, you typically **DON'T NEED** environment variables because:
- API URL is already set in `frontend/app.js`
- Everything else is hardcoded in frontend

### Optional Variables for Vercel:

If you want to use environment variables in frontend:

```
VITE_API_URL = https://pulse-hr-backend.onrender.com
NEXT_PUBLIC_API_URL = https://pulse-hr-backend.onrender.com
```

### How to Add in Vercel:

1. **During Deployment**:
   - In project configuration screen
   - Scroll to "Environment Variables"
   - Add variables

2. **After Deployment**:
   - Go to your project
   - Click "Settings" tab
   - Click "Environment Variables"
   - Add variable
   - Click "Save"
   - Redeploy (Deployments → Click ⋯ → Redeploy)

---

## 📝 STEP-BY-STEP: Adding Variables

### RENDER Backend Setup:

#### Step 1: Create Web Service
```
1. Go to Render dashboard
2. Click "New +" → "Web Service"
3. Connect repository
4. Fill basic details
```

#### Step 2: Add Environment Variables
```
5. Scroll to "Environment Variables" section
6. Click "Add Environment Variable"
7. Add first variable:
   Key: PORT
   Value: 4000
8. Click "Add Environment Variable" again
9. Add second variable:
   Key: NODE_ENV
   Value: production
```

#### Step 3: Deploy
```
10. Click "Create Web Service"
11. Wait for deployment
```

### VERCEL Frontend Setup:

#### For Your Project (No Variables Needed!):
```
1. Import project from GitHub
2. Framework: Other
3. Output Directory: frontend
4. Skip environment variables section
5. Click Deploy
```

**Why no variables?** 
The API URL is already configured in your `frontend/app.js`:
```javascript
const API = window.location.hostname === 'localhost' 
  ? "/api" 
  : "https://pulse-hr-backend.onrender.com/api";
```

---

## 🎯 COMPLETE CONFIGURATION

### Render (Backend) - Minimum Configuration:

```
┌─────────────────────────────────────────────────┐
│ RENDER WEB SERVICE                              │
├─────────────────────────────────────────────────┤
│ Name:           pulse-hr-backend                │
│ Region:         Oregon (US West)                │
│ Branch:         main                            │
│ Runtime:        Node                            │
│ Build Command:  (empty)                         │
│ Start Command:  node backend/server.js          │
│ Instance Type:  Free                            │
│                                                 │
│ Environment Variables:                          │
│   PORT = 4000                                   │
│   NODE_ENV = production                         │
└─────────────────────────────────────────────────┘
```

### Vercel (Frontend) - Minimum Configuration:

```
┌─────────────────────────────────────────────────┐
│ VERCEL PROJECT                                  │
├─────────────────────────────────────────────────┤
│ Framework:        Other                         │
│ Root Directory:   ./                            │
│ Build Command:    (empty)                       │
│ Output Directory: frontend                      │
│ Install Command:  (empty)                       │
│                                                 │
│ Environment Variables:                          │
│   (None needed - API URL is in code)            │
└─────────────────────────────────────────────────┘
```

---

## ❓ FAQ

### Q: Do I need to add environment variables in Vercel?
**A**: **NO** - For your project, the API URL is already configured in `frontend/app.js`. No environment variables needed!

### Q: What if I want to change admin password?
**A**: Two options:
1. **Easy**: Edit `frontend/app.js` line with `ADMIN_PASSWORD = "admin123"` and push to GitHub
2. **Advanced**: Add `ADMIN_PASSWORD` env variable in Render and update backend code

### Q: My backend URL is different, what do I do?
**A**: Update `frontend/app.js`:
```javascript
const API = window.location.hostname === 'localhost' 
  ? "/api" 
  : "https://YOUR-ACTUAL-RENDER-URL.onrender.com/api";
```

### Q: Can I use .env files?
**A**: 
- **Locally**: Yes, create `.env` file (already in `.gitignore`)
- **Production**: Use platform environment variables (Render/Vercel UI)

### Q: What about database credentials?
**A**: Currently using JSON files. If you add database later:
- Add `DATABASE_URL` in Render environment variables
- Update backend code to use it

---

## 🔒 Security Best Practices

### DO:
✅ Use environment variables for secrets
✅ Keep `.env` in `.gitignore`
✅ Use different passwords for production
✅ Rotate tokens regularly

### DON'T:
❌ Commit `.env` file to Git
❌ Share environment variable values publicly
❌ Use same password everywhere
❌ Hardcode secrets in code

---

## 🎯 QUICK REFERENCE

### Render - Required Variables:
```bash
PORT=4000
NODE_ENV=production
```

### Vercel - Required Variables:
```bash
# None needed for this project!
# API URL is already in frontend/app.js
```

---

## 📸 Screenshot Guide

### Adding Variables in Render:

```
1. Click "Environment" tab
   ↓
2. Click "Add Environment Variable"
   ↓
3. Enter Key: PORT
4. Enter Value: 4000
   ↓
5. Click "Add Environment Variable"
   ↓
6. Enter Key: NODE_ENV
7. Enter Value: production
   ↓
8. Click "Save Changes"
```

### Adding Variables in Vercel (if needed):

```
1. Go to Project Settings
   ↓
2. Click "Environment Variables"
   ↓
3. Enter Key: VITE_API_URL
4. Enter Value: https://your-backend.onrender.com
5. Select Environment: Production
   ↓
6. Click "Save"
   ↓
7. Go to Deployments → Redeploy
```

---

## ✅ CHECKLIST

### Render Backend:
- [ ] PORT = 4000 (Added)
- [ ] NODE_ENV = production (Added)
- [ ] Saved changes
- [ ] Service redeployed

### Vercel Frontend:
- [ ] No variables needed ✓
- [ ] API URL correct in app.js
- [ ] Deployed successfully

---

## 🚨 TROUBLESHOOTING

### Issue: "PORT already in use"
**Solution**: Don't worry! Render automatically assigns the port. Your `PORT=4000` is just a fallback.

### Issue: "Cannot connect to backend"
**Solution**: Check that API URL in `frontend/app.js` matches your actual Render URL.

### Issue: "Environment variable not found"
**Solution**: 
1. Check variable name spelling (case-sensitive)
2. Click "Save Changes" in Render
3. Wait for auto-redeploy

---

## 🎉 SUMMARY

For your Pulse HR Tool:

### ✅ Render (Backend):
- **PORT**: `4000`
- **NODE_ENV**: `production`

### ✅ Vercel (Frontend):
- **None needed!** Everything is configured in code.

**That's it!** Simple and straightforward. 🚀

---

## 💡 Next Steps

1. Add the 2 variables in Render
2. Deploy backend
3. Copy backend URL
4. Update `frontend/app.js` with backend URL
5. Push to GitHub
6. Deploy frontend on Vercel
7. Done! ✅

---

**Questions?** Check the DEPLOYMENT-GUIDE.md for visual walkthroughs!
