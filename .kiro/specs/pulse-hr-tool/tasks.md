# Implementation Plan: Pulse HR Tool

## Overview

This implementation plan converts the Pulse HR Tool design into discrete coding tasks. The system is a zero-dependency HR management prototype built with Node.js backend (using only built-in `http`, `fs`, `path` modules) and vanilla JavaScript frontend. All data is stored in JSON files under `backend/data/`. The implementation follows a layered approach: database utilities → backend API → frontend UI → testing.

## Tasks

- [x] 1. Set up core project structure and database layer
  - [x] 1.1 Create database utilities module (`backend/db.js`)
    - Implement `readCollection(collection)` to read JSON files, return empty array if missing
    - Implement `writeCollection(collection, data)` to write pretty-printed JSON with 2-space indent
    - Implement `nextId(collection, prefix)` to generate sequential IDs (E001, L042, etc.)
    - Implement `filePath(collection)` to resolve absolute paths to `backend/data/{collection}.json`
    - _Requirements: Foundation for all data operations_

  - [x] 1.2 Write property test for ID generation
    - **Property 2: ID Immutability in Updates**
    - **Validates: Requirements 4.4**
    - Test that employee updates preserve original ID regardless of request payload

  - [x] 1.3 Create initial JSON data files structure
    - Create `backend/data/` directory if not exists
    - Initialize empty arrays in: `employees.json`, `leaves.json`, `attendance.json`, `salaries.json`, `payslips.json`, `reviewCycles.json`, `reviews.json`, `onboarding.json`
    - _Requirements: 2.1, 3.1, 7.1, 10.1, 12.1, 13.1, 15.1, 16.1_

- [x] 2. Implement HTTP server and core routing (`backend/server.js`)
  - [x] 2.1 Create HTTP server with request dispatcher
    - Implement `startServer(port)` using Node.js `http` module
    - Implement `handleRequest(req, res)` to route by URL path and method
    - Implement `readBody(req)` to parse JSON from request stream
    - Implement `sendJSON(res, statusCode, data)` to send JSON responses
    - Implement `serveStatic(req, res, urlPath)` to serve frontend files
    - Default port to 4000, handle CORS headers for development
    - _Requirements: Foundation for all API endpoints_

  - [x] 2.2 Write unit tests for HTTP utilities
    - Test `readBody` with valid and invalid JSON
    - Test `sendJSON` produces correct headers and status codes
    - Test static file serving for HTML/CSS/JS files

- [x] 3. Implement employee management endpoints
  - [x] 3.1 Create employee CRUD operations in `server.js`
    - Implement `GET /api/employees` - list all employees
    - Implement `GET /api/employees/:id` - get single employee by ID
    - Implement `POST /api/employees` - create new employee with validation
    - Implement `PUT /api/employees/:id` - update employee (preserve ID field)
    - Implement `DELETE /api/employees/:id` - remove employee, retain related records
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 4.1, 4.3, 4.4, 5.1, 5.3_

  - [x] 3.2 Add employee validation functions
    - Implement `validateEmployee(data)` - check required fields (name, email, department, designation)
    - Implement `isEmailUnique(email, excludeId)` - verify email uniqueness
    - Validate email format with regex, return HTTP 400 for missing/invalid fields
    - Validate managerId references existing employee or is null, return HTTP 400 if invalid
    - _Requirements: 3.2, 3.3, 3.7, 4.3_

  - [x] 3.3 Write property test for record retention on deletion
    - **Property 3: Record Retention on Employee Deletion**
    - **Validates: Requirements 5.3**
    - Test that deleting an employee preserves all Leave_Requests, Attendance_Records, Payslips, and Reviews

  - [x] 3.4 Implement manager hierarchy resolution
    - Implement `resolveManagerName(managerId)` - return manager name, "—" if null, "Manager not found" if dangling
    - Implement `getDirectReports(managerId)` - return all employees with matching managerId
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Implement onboarding checklist functionality
  - [x] 4.1 Create onboarding endpoints in `server.js`
    - Implement `GET /api/onboarding/:employeeId` - retrieve checklist
    - Implement `PUT /api/onboarding/:employeeId` - update item completion state
    - Auto-create checklist with 4 standard items when new employee added
    - _Requirements: 3.4, 3.5_

  - [x] 4.2 Write unit tests for onboarding workflow
    - Test checklist creation with standard items
    - Test completion state persistence

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement leave management endpoints
  - [-] 6.1 Create leave request operations in `server.js`
    - Implement `POST /api/leaves` - create leave request with validation
    - Implement `GET /api/leaves?employeeId=X` - list leaves filtered by employee
    - Implement `PUT /api/leaves/:id` - update leave status (approve/reject)
    - Validate date range (fromDate <= toDate), leave type enum, employeeId exists
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 6.2 Implement leave balance tracking
    - Implement `calculateLeaveBalance(employeeId, leaveType, year)` - compute remaining days
    - Implement `calculateLeaveDays(fromDate, toDate)` - return (toDate - fromDate + 1)
    - Implement `hasLeaveBalance(employeeId, leaveType, fromDate, toDate)` - check sufficiency
    - Fixed entitlements: Casual 12, Sick 12, Earned 15 days per year
    - Return HTTP 422 if insufficient balance
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 6.3 Write property test for leave balance calculation
    - **Property 5: Leave Balance Calculation**
    - **Validates: Requirements 8.2**
    - Test balance = entitlement - sum of approved leave days in year

  - [ ] 6.4 Write property test for balance restoration on status change
    - **Property 6: Balance Restoration on Status Change**
    - **Validates: Requirements 8.4**
    - Test that changing status from Approved to Rejected/Pending restores days

  - [ ] 6.5 Implement leave approval workflow
    - Implement `isValidLeaveTransition(currentStatus, newStatus)` - allow only Pending→Approved/Rejected
    - Filter leaves by role: HR Admin sees all, Manager sees direct reports only
    - Return HTTP 409 if leave not in Pending status
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 6.6 Write property test for date range validation
    - **Property 4: Date Range Validation**
    - **Validates: Requirements 7.3, 15.2**
    - Test that fromDate > toDate returns HTTP 400

- [ ] 7. Implement attendance tracking endpoints
  - [ ] 7.1 Create attendance clock-in/out operations in `server.js`
    - Implement `POST /api/attendance/clock-in` - create record with current date/time
    - Implement `POST /api/attendance/clock-out` - update record with clockOut time
    - Implement `GET /api/attendance?employeeId=X&fromDate=Y&toDate=Z` - list records with filters
    - Prevent duplicate clock-in for same date (return HTTP 409)
    - Validate open clock-in exists before clock-out (return HTTP 409 if not)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 7.2 Implement attendance summary calculations
    - Implement `calculateAttendanceSummary(employeeId, month, year)` - compute present/absent/incomplete days
    - Present days: count records where clockIn is not null
    - Absent days: count weekdays (Mon-Fri) with no record
    - Incomplete days: count records where clockIn exists but clockOut is null
    - _Requirements: 11.4, 11.5_

  - [ ] 7.3 Write property test for attendance summary calculation
    - **Property 7: Attendance Summary Calculation**
    - **Validates: Requirements 11.5**
    - Test present/absent/incomplete day counts match actual records

- [ ] 8. Implement payroll management endpoints
  - [ ] 8.1 Create salary record operations in `server.js`
    - Implement `POST /api/salaries` - create salary record with validation
    - Implement `PUT /api/salaries/:id` - update existing salary record
    - Implement `GET /api/salaries?employeeId=X` - list salary records for employee
    - Validate baseSalary >= 0, allowances >= 0
    - Validate deductions <= baseSalary + allowances (return HTTP 400 if exceeded)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 8.2 Write property test for salary deductions validation
    - **Property 8: Salary Deductions Validation**
    - **Validates: Requirements 12.4**
    - Test that deductions > gross pay returns HTTP 400

  - [ ] 8.3 Implement payslip generation
    - Implement `POST /api/payslips/generate` - generate single payslip
    - Implement `POST /api/payslips/bulk-generate` - generate for all active employees
    - Implement `GET /api/payslips?employeeId=X` - list payslips for employee
    - Implement `getActiveSalary(employeeId, asOfDate)` - find latest salary record <= date
    - Implement `calculateNetPay(baseSalary, allowances, deductions)` - compute net pay
    - Return HTTP 409 if payslip already exists for period
    - Return HTTP 422 if no salary record found
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 8.4 Write property test for net pay calculation
    - **Property 9: Net Pay Calculation**
    - **Validates: Requirements 13.1**
    - Test netPay = baseSalary + allowances - deductions for all valid inputs

- [ ] 9. Implement performance review endpoints
  - [ ] 9.1 Create review cycle operations in `server.js`
    - Implement `POST /api/review-cycles` - create cycle with date validation
    - Implement `PUT /api/review-cycles/:id/close` - close cycle (status to "Closed")
    - Implement `GET /api/review-cycles` - list all cycles
    - Validate startDate <= endDate (return HTTP 400 if invalid)
    - Return HTTP 409 if closing already-closed cycle
    - Prevent review creation for closed cycles (return HTTP 409)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [ ] 9.2 Create review submission operations in `server.js`
    - Implement `POST /api/reviews/self-assessment` - employee submits self-assessment
    - Implement `PUT /api/reviews/:id/manager-rating` - manager submits rating
    - Implement `GET /api/reviews?cycleId=X&employeeId=Y` - list reviews with filters
    - Validate managerRating is integer 1-5 (return HTTP 400 if invalid)
    - Return HTTP 409 if self-assessment already submitted
    - Return HTTP 403 if manager rates non-direct-report
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 9.3 Write property test for average rating calculation
    - **Property 10: Average Rating Calculation**
    - **Validates: Requirements 18.2**
    - Test average = sum(ratings) / count for all completed reviews, rounded to 1 decimal

- [ ] 10. Implement dashboard statistics endpoint
  - [ ] 10.1 Create dashboard summary in `server.js`
    - Implement `GET /api/dashboard?role=X&employeeId=Y` - return role-specific stats
    - HR Admin: total employees, pending leaves, attendance summary, payslips generated
    - Manager: direct reports count, pending approvals for direct reports
    - Employee: personal leave balance, attendance summary, latest payslip
    - _Requirements: Dashboard view for 1.5_

- [ ] 11. Checkpoint - Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement frontend structure and role selection
  - [ ] 12.1 Create HTML structure in `frontend/index.html`
    - Create role-selection gate with dropdown and Confirm button
    - Create main app container with sidebar navigation
    - Create view containers for: Dashboard, Employees, Leaves, Attendance, Payroll, Reviews
    - Create modals for: Add Employee, Apply Leave, Self-Assessment, Manager Rating
    - Create toast notification container
    - _Requirements: 1.1, 1.5_

  - [ ] 12.2 Implement role selection logic in `frontend/app.js`
    - Implement `enterApp()` - explicitly set current role (HR_ADMIN, MANAGER, or EMPLOYEE) in session, set identity (employeeId and name) in session object, show main UI, load dashboard
    - Implement `switchRole()` - clear session, show role-selection gate, reset UI
    - Populate HR Admin option with no identity dropdown
    - Populate Manager dropdown with employees whose designation contains "Manager" or appear as managerId
    - Populate Employee dropdown with all active employees
    - Show appropriate message if no options available
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 12.3 Create API wrapper and session management
    - Implement `api(path, options)` - fetch wrapper with error handling
    - Implement `showToast(message)` - display temporary notification (auto-hide after 2.2s)
    - Store session state: role, employeeId, employeeName
    - _Requirements: Foundation for all frontend operations_

- [ ] 13. Implement employee directory view
  - [ ] 13.1 Create employee table and search/filter UI
    - Implement `loadEmployees()` - fetch all employees, render table
    - Implement `renderEmployees()` - build table rows with name, email, department, designation, manager, joining date, status
    - Implement search filter (case-insensitive on name/email/department/designation)
    - Implement department filter dropdown
    - Show loading state if search takes >300ms
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 13.2 Add employee table sorting
    - Implement column header click handlers for sort
    - Toggle ascending/descending on repeated clicks
    - Default to ascending by name on initial load
    - _Requirements: 2.5_

  - [ ] 13.3 Write property test for sorting preserves elements
    - **Property 1: Sorting Preserves Elements and Order**
    - **Validates: Requirements 2.5**
    - Test that sorted list contains same elements and maintains correct order

  - [ ] 13.3 Create add/edit employee forms
    - Implement modal form with fields: name, email, department, designation, managerId, joiningDate, status
    - Implement `submitEmployee(data)` - POST or PUT based on mode
    - Display validation errors from API responses
    - Refresh employee table on successful submission
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 4.1, 4.2_

  - [ ] 13.4 Add employee removal confirmation
    - Implement confirmation prompt showing employee name
    - Implement `removeEmployee(id)` - DELETE request
    - Refresh employee table on successful removal
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ] 13.5 Display manager hierarchy in employee profile
    - Resolve and display manager name for each employee
    - Display direct reports list for managers
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 14. Implement leave management view
  - [ ] 14.1 Create leave request table and apply form
    - Implement `loadLeaves()` - fetch leaves filtered by role/employeeId
    - Implement `renderLeaves()` - build table with employee name, type, dates, reason, status, applied date
    - Implement apply leave modal with fields: type dropdown, fromDate, toDate, reason
    - Display status badges (Pending/Approved/Rejected)
    - _Requirements: 7.1, 7.6, 9.4, 9.5_

  - [ ] 14.2 Display leave balance for employees
    - Fetch and display remaining balance for each leave type (Casual, Sick, Earned)
    - Show entitlement and consumed days
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 14.3 Implement leave approval actions
    - Add Approve/Reject buttons for HR Admin and Manager on pending leaves
    - Implement `updateLeaveStatus(id, status)` - PUT request
    - Show only direct report leaves for Manager role
    - Refresh leave table and dashboard after status change
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 15. Implement attendance tracking view
  - [ ] 15.1 Create clock-in/out controls
    - Implement `clockIn()` - POST request with current date/time
    - Implement `clockOut()` - POST request to update clockOut
    - Display today's status: not clocked in, clocked in (time), clocked out (both times)
    - Disable clock-in if already clocked in today
    - Disable clock-out if not clocked in today
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 15.2 Create attendance history table
    - Implement `loadAttendance()` - fetch records for employee or all (HR Admin)
    - Implement month selector and filter controls
    - Display summary: present days, absent days, incomplete days
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 16. Implement payroll view
  - [ ] 16.1 Create salary record management (HR Admin)
    - Implement salary form with fields: baseSalary, allowances, deductions, effectiveFrom
    - Display latest salary record per employee
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ] 16.2 Create payslip generation and view
    - Implement `generatePayslip(employeeId, month, year)` - POST request
    - Implement bulk generation trigger
    - Implement `loadPayslips()` - fetch and display payslip list
    - Display payslip detail view with all components (base, allowances, deductions, net pay)
    - Sort payslips by year/month descending
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.1, 14.2, 14.3_

- [ ] 17. Implement performance review view
  - [ ] 17.1 Create review cycle management (HR Admin)
    - Implement cycle creation form with fields: title, startDate, endDate
    - Implement cycle close action
    - Display cycle list with status badges
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [ ] 17.2 Create self-assessment submission (Employee)
    - Implement self-assessment modal with text area
    - Implement `submitSelfAssessment(cycleId, assessment)` - POST request
    - Display employee's review records with status
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 17.3 Create manager rating submission (Manager)
    - Implement rating form with rating (1-5 dropdown) and comments text area
    - Filter reviews to show only direct reports
    - Implement `submitManagerRating(reviewId, rating, comments)` - PUT request
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 17.4 Display review summary and average rating
    - Show average rating for completed reviews in cycle
    - Display review status and self-assessment text
    - _Requirements: 18.1, 18.2, 18.3_

- [ ] 18. Implement dashboard view
  - [ ] 18.1 Create dashboard stat cards
    - Implement `loadDashboard()` - fetch role-specific statistics
    - Display stat cards with counts and summaries
    - HR Admin: total employees, pending leaves, attendance summary, payslips count
    - Manager: direct reports count, pending approvals
    - Employee: leave balance, attendance summary, latest payslip
    - _Requirements: 1.5, dashboard summary for all roles_

- [ ] 19. Implement styling and responsive layout
  - [ ] 19.1 Create CSS stylesheet (`frontend/styles.css`)
    - Style role-selection gate
    - Style sidebar navigation with tabs
    - Style table views with sortable headers
    - Style forms and modals
    - Style status badges (Pending/Approved/Rejected/Active/Closed)
    - Style toast notifications
    - Style stat cards for dashboard
    - Ensure responsive layout for desktop/tablet views
    - _Requirements: UI appearance for all views_

- [ ] 20. Final integration and testing
  - [ ] 20.1 Test complete user workflows end-to-end
    - Test role selection and switching
    - Test employee onboarding workflow (add → checklist)
    - Test leave application → approval workflow
    - Test attendance clock-in → clock-out workflow
    - Test salary creation → payslip generation workflow
    - Test review cycle creation → self-assessment → manager rating workflow
    - _Requirements: All integrated workflows_

  - [ ] 20.2 Run all property-based tests
    - Execute all property tests to validate correctness properties
    - Verify all properties hold across randomized inputs

  - [ ] 20.3 Verify error handling and edge cases
    - Test all validation error responses (HTTP 400)
    - Test all conflict responses (HTTP 409)
    - Test all not-found responses (HTTP 404)
    - Test business rule violations (HTTP 422)
    - Test unauthorized access (HTTP 403)
    - _Requirements: Error handling for all endpoints_

- [ ] 21. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation uses only Node.js built-in modules (no external dependencies)
- All data persistence uses JSON files in `backend/data/` directory
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout implementation
- The system requires Node.js v14+ to run

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2", "3.4"] },
    { "id": 3, "tasks": ["3.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "6.1", "6.2"] },
    { "id": 5, "tasks": ["6.3", "6.4", "6.5"] },
    { "id": 6, "tasks": ["6.6", "7.1", "7.2"] },
    { "id": 7, "tasks": ["7.3", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3"] },
    { "id": 9, "tasks": ["8.4", "9.1", "9.2"] },
    { "id": 10, "tasks": ["9.3", "10.1"] },
    { "id": 11, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 12, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5"] },
    { "id": 13, "tasks": ["13.3", "14.1", "14.2", "14.3"] },
    { "id": 14, "tasks": ["15.1", "15.2", "16.1", "16.2"] },
    { "id": 15, "tasks": ["17.1", "17.2", "17.3", "17.4"] },
    { "id": 16, "tasks": ["18.1", "19.1"] },
    { "id": 17, "tasks": ["20.1", "20.2", "20.3"] }
  ]
}
```
