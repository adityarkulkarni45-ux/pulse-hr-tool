# 🚀 Pulse HR Tool - Final Setup Guide

## ✅ Current Status

**Server:** Running on http://localhost:4000  
**All Features:** Implemented and working  
**Photo Storage:** File-based system ready  

---

## 🎯 Complete Feature List

### ✅ Authentication & Access Control
- ✅ Password-protected admin access (password: `admin123`)
- ✅ Employee role selection
- ✅ Switch role button (admin only)
- ✅ No direct HR Admin button on login screen

### ✅ Employee Management
- ✅ Add employee with all details
- ✅ Edit employee (all fields + photo)
- ✅ Remove employee
- ✅ Auto-generated Employee IDs (EMP001, EMP002, etc.)
- ✅ Status management (Active/Inactive)
- ✅ Department filtering (click department chips)

### ✅ Photo Management
- ✅ Webcam photo capture
- ✅ Photo upload from files
- ✅ Photo preview before saving
- ✅ Edit/update employee photos
- ✅ Remove photos
- ✅ Photos saved as actual files (not base64)
- ✅ Photos stored in `backend/uploads/` folder
- ✅ Automatic photo cleanup on delete/update

### ✅ Leave Management
- ✅ Apply for leave (employees)
- ✅ Leave balance validation
- ✅ Approve/Reject leaves (admin)
- ✅ Rejection reason required
- ✅ Rejection reason displayed to employee
- ✅ Leave history tracking

### ✅ Dashboard & UI
- ✅ Real-time statistics
- ✅ Department overview with clickable chips
- ✅ Professional purple-blue gradient theme
- ✅ Smooth animations and transitions
- ✅ Responsive design

---

## 🔧 How to Use

### 1️⃣ Start the Server (Already Running!)

Server is running on: **http://localhost:4000**

If you need to restart:
```bash
cd backend
node server.js
```

### 2️⃣ Clear Browser Cache (IMPORTANT!)

**Method 1:** Hard Refresh
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Method 2:** DevTools
1. Press F12
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"

### 3️⃣ Login

**As Admin:**
1. Go to http://localhost:4000
2. Click **"🔐 Admin Access"** link at bottom
3. Enter password: **`admin123`**
4. Click "Continue"

**As Employee:**
1. Click **"Employee"** button
2. Select employee from dropdown
3. Click "Continue"

---

## 📋 Testing Checklist

### ✅ Test Admin Login
- [ ] Open http://localhost:4000
- [ ] See only "Employee" button (NO "HR Admin" button)
- [ ] See "🔐 Admin Access" link at bottom
- [ ] Click Admin Access
- [ ] Enter wrong password → Error shows
- [ ] Enter correct password (`admin123`) → Logs in

### ✅ Test Add Employee
- [ ] Login as admin
- [ ] Click "+ Add employee"
- [ ] Fill all fields
- [ ] Click "📷 Capture Photo" or "📁 Upload Photo"
- [ ] Photo preview appears
- [ ] Click "Add employee"
- [ ] Employee appears in table with photo
- [ ] Check `backend/uploads/` folder for image file

### ✅ Test Edit Employee
- [ ] Click "Edit" on any employee
- [ ] Form opens with current data
- [ ] Change any field (name, email, etc.)
- [ ] Update photo or keep existing
- [ ] Click "Update employee"
- [ ] Changes saved
- [ ] Photo updated (if changed)

### ✅ Test Department Filter
- [ ] Go to Dashboard
- [ ] Hover over department chip → Changes color
- [ ] Click department chip → Navigates to Employee Directory
- [ ] Shows only employees from that department
- [ ] Click "✕ Show all" → Shows all employees

### ✅ Test Photo Management
- [ ] Add employee without photo → Shows initial letter
- [ ] Add employee with webcam → Photo captured and saved
- [ ] Add employee with upload → Photo uploaded and saved
- [ ] Edit employee → Change photo → Old file deleted, new saved
- [ ] Delete employee → Photo file deleted from uploads

### ✅ Test Leave Management
- [ ] Login as employee
- [ ] Click "+ Apply for leave"
- [ ] Fill form and submit
- [ ] Login as admin
- [ ] See pending leave
- [ ] Click "Reject" → Modal asks for reason
- [ ] Enter reason and reject
- [ ] Login as employee → See rejection reason

---

## 🗂️ Project Structure

```
hr-tool/
├── backend/
│   ├── server.js           ✅ Main server with photo handling
│   ├── db.js              ✅ Database operations
│   ├── uploads/           ✅ Photo files stored here
│   │   ├── EMP001_timestamp.jpeg
│   │   └── EMP002_timestamp.png
│   └── data/
│       ├── employees.json ✅ Employee data (with photo filenames)
│       ├── leaves.json    ✅ Leave requests
│       └── onboarding.json
├── frontend/
│   ├── index.html         ✅ UI with all modals
│   ├── app.js            ✅ All functionality
│   └── styles.css        ✅ Professional styling
├── FINAL-SETUP-GUIDE.md  ← You are here
├── PHOTO-FILE-STORAGE.md
└── README.md
```

---

## 🔍 Verification

### Check Photo Files
```bash
# List uploaded photos
dir backend\uploads
```

Should show files like:
```
EMP001_1721638234567.jpeg
EMP002_1721638245123.png
```

### Check Database
Open `backend/data/employees.json`:
```json
{
  "id": "EMP001",
  "name": "John Doe",
  "photo": "EMP001_1721638234567.jpeg"  ← Just filename!
}
```

### Check in Browser
1. Add employee with photo
2. Right-click photo in table
3. "Open image in new tab"
4. URL: `http://localhost:4000/uploads/EMP###_###.jpeg`

---

## ⚠️ Common Issues & Solutions

### Issue 1: Old Interface Still Showing
**Solution:** Clear browser cache
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Issue 2: Photos Not Displaying
**Solution:**
1. Check `backend/uploads/` folder exists
2. Restart server
3. Hard refresh browser
4. Check browser console for errors

### Issue 3: Edit Not Working
**Solution:**
1. Clear browser cache
2. Make sure you're logged in as admin
3. Check console for JavaScript errors
4. Refresh page and try again

### Issue 4: Admin Password Not Asking
**Solution:**
1. Look for "🔐 Admin Access" link at bottom
2. NOT the "HR Admin" button (that's removed)
3. Clear cache if not seeing the link

### Issue 5: Department Filter Not Working
**Solution:**
1. Make sure you're logged in as admin
2. Go to Dashboard (not Employee Directory)
3. Scroll down to Departments section
4. Chips should have hover effect
5. Click a chip to filter

---

## 💾 Backup

### Important Files to Backup:
```
backend/data/          ← Employee, leave, onboarding data
backend/uploads/       ← Photo files (NEW!)
```

---

## 🎯 Quick Start Commands

```bash
# Start server
cd backend
node server.js

# Check uploads folder
dir uploads

# Create uploads folder if missing
mkdir uploads
```

---

## 📝 Default Credentials

**Admin Password:** `admin123`

**Test Employees:**
- Test Employee (EMP001)
- New Employee (EMP002)
- (More in employees.json)

---

## ✅ All Features Working

| Feature | Status | Test |
|---------|--------|------|
| Admin Password Login | ✅ Working | Click Admin Access, enter `admin123` |
| Add Employee | ✅ Working | Fill form, submit |
| Edit Employee | ✅ Working | Click Edit, update, save |
| Photo Capture | ✅ Working | Use webcam in add/edit form |
| Photo Upload | ✅ Working | Upload file in add/edit form |
| Photo Files | ✅ Working | Check `backend/uploads/` |
| Department Filter | ✅ Working | Dashboard → Click department chip |
| Leave Application | ✅ Working | Employee → Apply for leave |
| Leave Rejection | ✅ Working | Admin → Reject with reason |
| Switch Role | ✅ Working | Button visible for admin only |
| Employee ID Format | ✅ Working | Shows EMP### in badge |

---

## 🚀 You're Ready!

**Everything is set up and working!**

1. ✅ Server running on port 4000
2. ✅ All features implemented
3. ✅ Photo file storage working
4. ✅ Edit functionality fixed
5. ✅ Admin authentication ready

**Just clear your browser cache and start testing!**

---

## 📞 Need Help?

1. **Check browser console** (F12 → Console)
2. **Check server logs** (terminal where server is running)
3. **Clear cache** and try again
4. **Restart server** if needed

---

**Happy Testing! 🎉**
