# 🚀 Clear Cache and Test Guide

## ⚠️ CRITICAL: Clear Browser Cache First!

All recent features have been implemented, but your browser is showing **cached/old versions** of the files. You MUST clear your browser cache to see the changes.

---

## 🔧 Step 1: Clear Browser Cache

### Method 1: Hard Refresh (Recommended - Quick)
1. Open the Pulse HR Tool in your browser
2. Press: **`Ctrl + Shift + R`** (Windows)
3. Or: **`Ctrl + F5`** (Windows alternative)

### Method 2: Clear Cache via DevTools (If Method 1 doesn't work)
1. Open DevTools: Press **`F12`**
2. Right-click the **refresh button** in the browser
3. Select **"Empty Cache and Hard Reload"**

### Method 3: Manual Cache Clear (Most thorough)
1. Open browser settings
2. Search for "Clear browsing data" or "Clear cache"
3. Select **"Cached images and files"**
4. Time range: **"All time"**
5. Click **"Clear data"**
6. Close and reopen browser

---

## 🎯 Step 2: Start the Server

### Start Backend Server
```cmd
cd c:\Users\adity\Downloads\Pulse-HR-Tool-Prototype\hr-tool\backend
node server.js
```

✅ You should see: `Pulse HR Tool server running at http://localhost:4000`

---

## 🧪 Step 3: Test All Features

### 1. **Admin Password Login** 🔐
- Open: http://localhost:4000
- Click **"🔐 Admin Access"** link at the bottom
- Password modal should appear
- Enter: `admin123`
- ✅ **Expected**: You should login as HR Admin

❌ **If not working**: Clear cache again using Method 2 or 3 above

---

### 2. **Department Filtering** 📊
- After logging in as Admin
- Go to **Dashboard**
- You should see department chips: Engineering, Sales, HR, IT, etc.
- **Click any department chip** (e.g., "Engineering")
- ✅ **Expected**: 
  - Navigates to Employee Directory
  - Shows only employees from that department
  - Header shows: "Showing employees in Engineering department"
  - "✕ Show all" button appears
- Click **"✕ Show all"** to clear filter

❌ **If chips not clickable**: Clear cache - you're still seeing old CSS

---

### 3. **Add Employee with Photo** 📸

#### Test A: Webcam Capture
- Click **"+ Add Employee"**
- Fill in details:
  - Name: `John Smith`
  - Email: `john.smith@test.com`
  - Department: `Engineering`
  - Designation: `Senior Developer`
- Click **"📷 Capture from Camera"**
- Allow camera access
- Take photo by clicking **"Capture Photo"**
- ✅ **Expected**: Photo preview appears
- Click **"Add Employee"**
- ✅ **Expected**: 
  - Success toast message
  - Employee appears in table with photo
  - Photo file saved in `backend/uploads/` folder

#### Test B: Upload Photo
- Click **"+ Add Employee"**
- Fill in details
- Click **"📤 Upload Photo"**
- Select an image file (JPG/PNG)
- ✅ **Expected**: Photo preview appears
- Click **"Add Employee"**

---

### 4. **Edit Employee** ✏️
- Find any employee in the table
- Click **"Edit"** button
- ✅ **Expected**: Edit modal opens with all fields pre-filled
- Change name to: `Updated Name`
- Click **"Update Employee"**
- ✅ **Expected**: Employee updated, table refreshes

#### Test Edit with Photo Update
- Click **"Edit"** on any employee
- Click **"📷 Capture from Camera"** or **"📤 Upload Photo"**
- Capture/upload new photo
- Click **"Update Employee"**
- ✅ **Expected**: 
  - Photo updates in table
  - Old photo file deleted from `backend/uploads/`
  - New photo file saved

#### Test Remove Photo
- Click **"Edit"** on employee with photo
- Click **"🗑️ Remove Photo"**
- Click **"Update Employee"**
- ✅ **Expected**: Photo removed, shows initials instead

---

### 5. **Leave Management** 📅

#### Apply for Leave (Employee)
- Click **"Switch Role"** (if logged in as admin)
- Login as **Employee** (select any employee)
- Go to **"Leave Management"** tab
- Click **"Apply for Leave"**
- Fill in:
  - Type: `Casual Leave`
  - From: `2026-07-25`
  - To: `2026-07-27`
  - Reason: `Personal work`
- Click **"Submit Leave Request"**
- ✅ **Expected**: Leave appears with "Pending" status

#### Approve Leave (Admin)
- Switch to **Admin** role
- Go to **"Leave Management"** tab
- Find pending leave
- Click **"Approve"**
- ✅ **Expected**: Status changes to "Approved"

#### Reject Leave with Reason (Admin)
- Find another pending leave
- Click **"Reject"**
- ✅ **Expected**: Rejection reason modal appears
- Enter reason: `Insufficient staffing`
- Click **"Reject Leave"**
- ✅ **Expected**: 
  - Status changes to "Rejected"
  - Rejection reason appears in red below the leave reason

---

## 🐛 Troubleshooting

### Problem: Admin password not asking
**Solution**: 
1. Clear cache using Method 2 or 3
2. Make sure you see "🔐 Admin Access" link at bottom, not "HR Admin" button

### Problem: Department chips not clickable
**Solution**: 
1. Clear cache - you're seeing old CSS
2. Verify you're logged in as Admin (chips only work for admin)

### Problem: Photo capture not working
**Solution**:
1. Check browser console (F12) for errors
2. Allow camera permissions when prompted
3. Clear cache and try again

### Problem: Photos not showing in table
**Solution**:
1. Check if `backend/uploads/` folder exists
2. Check server console for errors
3. Verify photo files are being created in `backend/uploads/`
4. Check if image URLs are like: `/uploads/EMP001_1234567890.jpeg`

### Problem: Edit employee "something went wrong"
**Solution**:
1. This was fixed in the latest code
2. Clear cache completely (Method 3)
3. Check browser console (F12) for JavaScript errors
4. Check server logs for API errors

---

## 📁 Verify File Storage

### Check Photo Files
```cmd
dir c:\Users\adity\Downloads\Pulse-HR-Tool-Prototype\hr-tool\backend\uploads
```

✅ **Expected**: You should see files like:
- `EMP001_1721654321000.jpeg`
- `EMP002_1721654322000.png`

### Check Employee Data
Open: `backend\data\employees.json`

✅ **Expected**: Employee records should have:
```json
{
  "id": "EMP001",
  "name": "John Smith",
  "photo": "EMP001_1721654321000.jpeg"
}
```

**NOT** this (old base64 format):
```json
{
  "photo": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

---

## ✅ Success Checklist

After clearing cache, you should be able to:
- ✅ See admin password modal when clicking "🔐 Admin Access"
- ✅ Login with password `admin123`
- ✅ Click department chips to filter employees
- ✅ See "✕ Show all" button to clear filter
- ✅ Add employee with webcam photo
- ✅ Add employee with uploaded photo
- ✅ Edit employee and update all fields
- ✅ Edit employee and change photo
- ✅ Edit employee and remove photo
- ✅ Apply for leave as employee
- ✅ Approve leave as admin
- ✅ Reject leave with reason as admin
- ✅ See rejection reason in red text

---

## 🎨 UI Features You Should See

After clearing cache, the interface should have:
- 🎨 Purple-blue gradient theme
- ✨ Smooth animations and transitions
- 📸 Photo preview boxes with rounded corners
- 🔐 Password modal with error handling
- 🏷️ Clickable department chips with hover effects
- ✨ Frosted glass modal backgrounds
- 🎯 Gradient buttons with hover effects
- 💫 Fade-in and slide-up animations

---

## 🆘 Still Not Working?

If after clearing cache (Method 3) things still don't work:

1. **Close browser completely** (all windows)
2. **Stop the server** (Ctrl+C in terminal)
3. **Delete node cache** (if you have node_modules):
   ```cmd
   rmdir /s /q node_modules
   ```
4. **Restart server**:
   ```cmd
   cd backend
   node server.js
   ```
5. **Open browser in incognito/private mode**
6. **Navigate to**: http://localhost:4000

---

## 📞 Report Issues

If problems persist after all the above steps, check:
1. **Browser Console** (F12 → Console tab) - any errors?
2. **Server Logs** (in the terminal running node server.js) - any errors?
3. **Network Tab** (F12 → Network tab) - are API calls succeeding?

Share any error messages you see!
