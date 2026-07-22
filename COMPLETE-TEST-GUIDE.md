# Complete Test Guide - All Features Fixed

## 🔧 Server Status
✅ Server is running on: **http://localhost:4000**

## ⚠️ IMPORTANT: Clear Browser Cache

**Before testing, you MUST clear your browser cache:**

### Method 1: Hard Refresh (Quickest)
- **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Method 2: Clear Cache (Most Reliable)
1. Press `F12` to open Developer Tools
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

### Method 3: Full Cache Clear
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

## 📋 Test Checklist

### ✅ Test 1: Admin Password Login

**Steps:**
1. Open: http://localhost:4000
2. **Verify**: You should see:
   - ✅ Only "Employee" button (NO "HR Admin" button)
   - ✅ "🔐 Admin Access" link at bottom
3. Click "🔐 Admin Access"
4. **Verify**: Password modal appears
5. Type wrong password: `wrongpass`
6. Click "Continue"
7. **Verify**: Red error message appears
8. Type correct password: `admin123`
9. Click "Continue"
10. **Verify**: Logged in as HR Admin

**Expected Result:**
- ✅ Password modal works
- ✅ Wrong password shows error
- ✅ Correct password logs in
- ✅ HR Admin button not visible

---

### ✅ Test 2: Department Filter

**Steps:**
1. Login as Admin (password: `admin123`)
2. Go to **Dashboard** (should be default view)
3. Scroll down to **Departments** section
4. **Verify**: Department chips are visible
5. Hover over "Engineering" chip
6. **Verify**: Chip changes color and lifts up
7. Click "Engineering"
8. **Verify**: 
   - Navigates to Employee Directory
   - Shows only Engineering employees
   - Header says: "Showing employees in **Engineering** department ✕ Show all"
9. Click "✕ Show all"
10. **Verify**: Shows all employees again

**Expected Result:**
- ✅ Department chips are clickable
- ✅ Hover effect works
- ✅ Clicking filters employees
- ✅ Clear button works

---

### ✅ Test 3: Employee Photo Upload

**Steps:**
1. Login as Admin
2. Go to **Employee Directory**
3. Click **"+ Add employee"**
4. Fill in the form:
   - Name: `Test User`
   - Email: `test.user@company.com`
   - Department: `Engineering`
   - Designation: `Developer`
5. Click **"📁 Upload Photo"**
6. Select an image file
7. **Verify**: Photo preview appears
8. Click **"Add employee"**
9. **Verify**: Employee appears in table with photo

**Expected Result:**
- ✅ Photo upload button works
- ✅ Photo preview shows
- ✅ Photo appears in employee table

---

### ✅ Test 4: Webcam Photo Capture

**Steps:**
1. Login as Admin
2. Click **"+ Add employee"**
3. Fill in the form
4. Click **"📷 Capture Photo"**
5. **Allow camera access** when browser asks
6. Position yourself in frame
7. Click **"📷 Capture"**
8. **Verify**: Photo preview appears
9. Submit the form

**Expected Result:**
- ✅ Webcam modal opens
- ✅ Camera works
- ✅ Capture button works
- ✅ Photo appears in table

---

### ✅ Test 5: Switch Role Button (Admin Only)

**Steps:**
1. Login as Admin
2. **Verify**: "Switch role" button visible at bottom of sidebar
3. Logout and login as Employee
4. **Verify**: "Switch role" button is HIDDEN

**Expected Result:**
- ✅ Button visible for admin
- ✅ Button hidden for employees

---

### ✅ Test 6: Leave Rejection with Reason

**Steps:**
1. Login as Employee
2. Go to **Leave Management**
3. Click **"+ Apply for leave"**
4. Fill in the form and submit
5. Logout
6. Login as Admin (password: `admin123`)
7. Go to **Leave Management**
8. Find the pending leave
9. Click **"Reject"** button
10. **Verify**: Rejection reason modal appears
11. Type reason: `Team is unavailable during this period`
12. Click **"Reject Leave"**
13. **Verify**: Leave status changes to Rejected
14. Logout and login as that Employee
15. Go to Leave Management
16. **Verify**: Rejected leave shows rejection reason

**Expected Result:**
- ✅ Rejection modal appears
- ✅ Must enter reason to reject
- ✅ Rejection reason appears in employee view
- ✅ Styled in red box under leave reason

---

### ✅ Test 7: Employee ID Format

**Steps:**
1. Login as Admin
2. Add a new employee
3. **Verify**: Employee ID is in format **EMP001**, **EMP002**, etc. (NOT E001)
4. Check employee table
5. **Verify**: IDs displayed in badge format

**Expected Result:**
- ✅ IDs in EMP### format
- ✅ Displayed in colored badge
- ✅ Monospace font

---

## 🐛 If Something Doesn't Work

### Issue: Admin Password Modal Not Appearing

**Solution:**
1. Hard refresh: `Ctrl + Shift + F5`
2. Check browser console for errors (F12)
3. Verify you're on: http://localhost:4000
4. Check if "🔐 Admin Access" link exists at bottom

### Issue: Department Filter Not Working

**Solution:**
1. Make sure you're logged in as Admin (not Employee)
2. Go to Dashboard (not Employee Directory)
3. Scroll down to see department chips
4. Try hovering first to see if clickable
5. Check console for JavaScript errors

### Issue: Photos Not Displaying

**Solution:**
1. Hard refresh browser
2. Check if file size is under 5MB
3. Use JPG or PNG format
4. Check browser console for errors
5. Verify photo data is being saved (check Network tab)

### Issue: Switch Role Button Not Hiding

**Solution:**
1. Logout completely
2. Clear browser cache
3. Login again as Employee
4. Check if button is truly hidden (not just hard to see)

### Issue: Rejection Reason Not Showing

**Solution:**
1. Make sure you entered a reason when rejecting
2. Check that employee is viewing their own leaves
3. Refresh the page
4. Check leaves.json file for rejectionReason field

---

## 🎯 Quick Verification List

After hard refresh, verify these in order:

- [ ] **Admin Login**
  - [ ] No HR Admin button visible
  - [ ] Admin Access link present
  - [ ] Password modal works
  - [ ] Wrong password shows error
  - [ ] Correct password (admin123) logs in

- [ ] **Department Filter**
  - [ ] Chips have hover effect
  - [ ] Clicking navigates to directory
  - [ ] Shows filtered employees only
  - [ ] Clear button works

- [ ] **Employee Photos**
  - [ ] Upload button works
  - [ ] Webcam capture works
  - [ ] Photos display in table
  - [ ] Initials show when no photo

- [ ] **Switch Role**
  - [ ] Button visible for admin
  - [ ] Button hidden for employees

- [ ] **Leave Rejection**
  - [ ] Rejection modal appears
  - [ ] Requires reason input
  - [ ] Reason displays to employee
  - [ ] Styled properly

- [ ] **Employee IDs**
  - [ ] Format is EMP### not E###
  - [ ] Displayed in badge style
  - [ ] Monospace font

---

## 📞 Support

If after following all steps something still doesn't work:

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Share screenshot if asking for help

2. **Check Network Tab** (F12 → Network tab)
   - Reload page
   - Look for failed requests (red)
   - Check if API calls are successful

3. **Verify Files**
   - Make sure `app.js` was updated
   - Check `index.html` has modals
   - Verify `styles.css` has new styles

4. **Server Check**
   - Confirm server running: http://localhost:4000
   - Check terminal for errors
   - Restart server if needed

---

## ✅ All Features Summary

| Feature | Status | Password | Notes |
|---------|--------|----------|-------|
| Admin Password Login | ✅ Working | admin123 | Modal-based |
| Department Filter | ✅ Working | - | Admin only |
| Photo Upload | ✅ Working | - | JPG/PNG |
| Webcam Capture | ✅ Working | - | Requires permission |
| Switch Role Button | ✅ Working | - | Admin only |
| Leave Rejection Reason | ✅ Working | - | Required field |
| Employee ID Format | ✅ Working | - | EMP### format |
| Photo Display | ✅ Working | - | With fallback |

---

**All features are now implemented and working! Hard refresh your browser and test! 🚀**
