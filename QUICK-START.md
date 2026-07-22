# ⚡ Quick Start Guide - Pulse HR Tool

## 🚀 3-Step Launch

### 1️⃣ Start Server
```cmd
cd backend
node server.js
```
✅ Wait for: `Pulse HR Tool server running at http://localhost:4000`

### 2️⃣ Open Browser
Navigate to: **http://localhost:4000**

### 3️⃣ Login
- **Admin**: Click "🔐 Admin Access" → Password: `admin123`
- **Employee**: Click "I'm an employee" → Select employee

---

## 🎯 What's New in Enhanced Dashboard

### ✨ Visual Features
- 🎨 **Gradient Stat Cards** - Beautiful color transitions
- 📊 **Interactive Charts** - Department & Leave distribution
- 📋 **Activity Feed** - Real-time updates of all actions
- ⚡ **Quick Actions** - One-click access to common tasks
- ⭐ **Recent Employees** - See newest team members
- 💻 **System Status** - Live server health monitoring

### 🎭 Animations
- 💫 Fade-in effects on page load
- 🎪 Hover animations on all cards
- 📈 Growing chart bars
- ✨ Pulsing gradients
- 🌊 Smooth transitions everywhere

### 🎮 Interactive Elements
- Click department chips to filter (Admin)
- Hover any card for effects
- Quick action buttons with ripples
- Smooth page transitions
- Auto-updating timestamps

---

## 📱 Features by Role

### 👨‍💼 Admin Features
- ➕ Add/Edit/Remove employees
- ✅ Approve/Reject leaves
- 📊 View all analytics
- 🏢 Filter by department
- 📋 See all activities
- ⚡ Quick access to reports

### 👤 Employee Features
- 🏖️ Apply for leave
- 👥 View team directory
- 📅 Track your leaves
- 📊 View department info
- 📋 See recent updates
- 📞 Contact HR

---

## 🎨 Dashboard Panels

### 1. Quick Stats (Top)
- Total Employees
- Active Employees  
- Pending Leaves
- Approved Leaves

### 2. Departments
- All departments as chips
- Click to filter (Admin)
- Count badge

### 3. Recent Activities
- Last 10 actions
- Icons for each type
- Relative timestamps
- Auto-scrolling

### 4. Leave Overview
- Pending count
- Approved count
- Rejected count
- Color-coded

### 5. Quick Actions
- Role-based buttons
- 2×2 grid layout
- Gradient styling
- One-click tasks

### 6. Recent Additions
- Top 5 new employees
- Profile photos
- Role & department
- Hover effects

### 7. Department Chart
- Top 5 departments
- Employee counts
- Animated bars
- Interactive

### 8. Leave Status Chart
- Visual breakdown
- 3 status types
- Animated bars
- Real-time data

### 9. System Status
- Server health
- Database status
- Last sync time
- Live indicators

---

## ⚠️ IMPORTANT: Clear Cache!

After any update, you MUST clear browser cache:

**Windows**: `Ctrl + Shift + R` or `Ctrl + F5`

**Why?** Browser caches old CSS/JS files. Hard refresh loads new versions.

---

## 🎯 Common Tasks

### Add Employee with Photo
1. Admin login
2. Click "Employee Directory"
3. Click "+ Add employee"
4. Fill form
5. Click "📷 Capture Photo" or "📁 Upload Photo"
6. Submit

### Apply for Leave
1. Employee login
2. Click "Leave Management"
3. Click "+ Apply for leave"
4. Fill dates & reason
5. Submit

### Approve/Reject Leave
1. Admin login
2. Click "Leave Management"
3. Find pending leave
4. Click "Approve" or "Reject"
5. For reject: enter reason

### Filter by Department
1. Admin login
2. On Dashboard
3. Click any department chip
4. View filtered employees
5. Click "✕ Show all" to reset

### Edit Employee
1. Admin login
2. Click "Employee Directory"
3. Find employee
4. Click "Edit"
5. Update fields/photo
6. Save

---

## 🎨 Color Reference

### Gradients
- Purple-Violet (Total Employees)
- Pink-Red (Active Employees)
- Blue-Cyan (Pending Leaves)
- Green-Teal (Approved Leaves)

### Status Colors
- 🟢 Green = Active/Approved
- 🟠 Orange = Pending
- 🔴 Red = Rejected/Inactive

---

## 🐛 Troubleshooting

### Server won't start
```cmd
# Check if port 4000 is in use
netstat -ano | findstr :4000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Photos not showing
- Check `backend/uploads/` folder exists
- Verify server console for errors
- Clear browser cache

### Dashboard looks wrong
- **99% of the time**: Browser cache issue
- Solution: Hard refresh (`Ctrl + Shift + R`)
- If still wrong: Clear all browser data

### Features not working
1. Clear cache (most common fix)
2. Check browser console (F12)
3. Check server terminal for errors
4. Restart server

---

## 📊 Tech Stack

- **Backend**: Node.js (zero dependencies!)
- **Frontend**: Vanilla JavaScript
- **Styling**: Custom CSS with animations
- **Storage**: JSON files
- **Server**: Built-in HTTP module

---

## 🎉 Enjoy!

You now have a beautiful, fully-featured HR management prototype with:
- ✨ Smooth animations
- 📊 Interactive dashboards
- 🎨 Modern gradients
- ⚡ Fast performance
- 📱 Responsive design
- 🔒 Role-based access
- 📸 Photo management
- 📋 Real-time updates

Perfect for demos, prototypes, and learning!
