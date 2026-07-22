# Requirements Document

## Introduction

Pulse is a zero-dependency HR Management Tool prototype built for a technical assessment. It runs entirely on Node.js's built-in `http` module with JSON files as the datastore, served from a single `node server.js` command on port 4000. The frontend is plain HTML/CSS/JavaScript with no build step.

This document specifies the full set of requirements covering five core HR workflows: Employee Directory & Onboarding, Leave Management, Attendance Tracking, Payroll Basics, and Performance Reviews. The system supports three roles — HR Admin, Manager, and Employee — selected via a UI role switch (no authentication).

---

## Glossary

- **System**: The Pulse HR Management Tool as a whole
- **Server**: The Node.js HTTP backend (`server.js`) that handles all API routes and serves static frontend files
- **DB**: The JSON file datastore managed by `db.js`, consisting of collection files under `backend/data/`
- **HR_Admin**: A user operating in the HR Admin role; has full read/write access to all modules
- **Manager**: A user operating in the Manager role; can approve leaves and submit performance ratings for their direct reports
- **Employee**: A user operating in the Employee role; can view their own data, clock in/out, apply for leave, view payslips, and submit self-assessments
- **Employee_Record**: A single employee object stored in `employees.json` with fields: `id`, `name`, `email`, `department`, `designation`, `managerId`, `joiningDate`, `status`
- **Leave_Request**: A single leave object stored in `leaves.json` with fields: `id`, `employeeId`, `employeeName`, `type`, `fromDate`, `toDate`, `reason`, `status`, `appliedOn`
- **Attendance_Record**: A single attendance object stored in `attendance.json` with fields: `id`, `employeeId`, `date`, `clockIn`, `clockOut`, `status`
- **Salary_Record**: A single salary configuration object stored in `salaries.json` with fields: `id`, `employeeId`, `baseSalary`, `allowances`, `deductions`, `effectiveFrom`
- **Payslip**: A computed monthly payslip object stored in `payslips.json` with fields: `id`, `employeeId`, `month`, `year`, `baseSalary`, `allowances`, `deductions`, `netPay`, `generatedOn`
- **Review_Cycle**: A performance review cycle object stored in `reviewCycles.json` with fields: `id`, `title`, `startDate`, `endDate`, `status`
- **Review**: An individual performance review object stored in `reviews.json` with fields: `id`, `cycleId`, `employeeId`, `reviewerId`, `selfAssessment`, `managerRating`, `managerComments`, `status`
- **Onboarding_Checklist**: A set of standard tasks an HR Admin marks complete when adding a new employee
- **Direct_Report**: An employee whose `managerId` field matches the currently logged-in Manager's employee ID
- **Net_Pay**: `baseSalary + allowances - deductions` for a given month
- **Leave_Balance**: The number of remaining leave days an employee may take in a calendar year, per leave type

---

## Requirements

### Requirement 1: Role Selection

**User Story:** As a user, I want to select my role (HR Admin, Manager, or Employee) at startup, so that the UI and available actions match my responsibilities.

#### Acceptance Criteria

1. THE System SHALL present a role-selection screen on initial page load before showing any application view; the role-selection screen SHALL remain visible until the user activates an explicit "Confirm" button after selecting a role and identity.
2. WHEN a user selects the HR Admin role and activates "Confirm", THE System SHALL set the current role to HR_ADMIN, enter the application with full access to all modules without requiring an employee identity.
3. WHEN a user selects the Manager role, THE System SHALL display a dropdown listing all employees whose `designation` contains "Manager" or who appear as a `managerId` in any Employee_Record with `status` `"Active"`; IF no such employees exist in the DB, THE System SHALL display an empty dropdown with a message indicating no manager accounts are available.
4. WHEN a user selects the Employee role, THE System SHALL display a dropdown listing all employees with `status` `"Active"`; IF no active employees exist in the DB, THE System SHALL display an empty dropdown with a message indicating no employee accounts are available.
5. WHEN a role and identity are confirmed via the "Confirm" button, THE System SHALL explicitly set the current role in the session, display the sidebar navigation, set the session to the selected role and identity, and default the visible view to the Dashboard.
6. WHEN a user activates the "Switch role" control in the sidebar, THE System SHALL clear the current session (role and identity), hide the application view, and display the role-selection screen.

---

### Requirement 2: Employee Directory

**User Story:** As an HR Admin, I want to view, search, and filter the full employee directory, so that I can quickly find and review any employee's information.

#### Acceptance Criteria

1. THE System SHALL display a table of all Employee_Records containing name, email, department, designation, manager name (resolved from `managerId`; display "—" if `managerId` is null or references a non-existent employee), joining date, and status.
2. WHEN a search term is entered in the directory search field, THE System SHALL filter the displayed rows to those where the name, email, department, or designation contains the search term (case-insensitive) within 300ms of the last keystroke; IF the filter cannot complete within 300ms, THE System SHALL display a loading state until results are ready; IF no rows match the search term, THE System SHALL display an empty-state message in the table body.
3. WHEN a department filter is selected from the filter dropdown, THE System SHALL display only employees belonging to that department; WHEN the department filter is cleared (reset to "All"), THE System SHALL display all employees without a department constraint.
4. WHEN both a search term and a department filter are active, THE System SHALL apply both filters simultaneously, showing only rows that satisfy both conditions.
5. WHEN the directory is sorted by a column header, THE System SHALL re-render the table rows in ascending order on the first click and descending order on the second click of the same header; THE System SHALL default the initial sort to ascending order by employee name when the directory first loads.

---

### Requirement 3: Employee Onboarding

**User Story:** As an HR Admin, I want to add new employees and complete an onboarding checklist, so that new hires are set up correctly from day one.

#### Acceptance Criteria

1. WHEN the HR_Admin submits the Add Employee form with valid values for `name`, `email` (format: local-part@domain), `department`, `designation`, and `joiningDate` (ISO 8601 YYYY-MM-DD format), THE Server SHALL create a new Employee_Record with a unique `id` (format `E###`), `status` set to `"Active"`, and persist it to the DB.
2. IF the Add Employee form is submitted without `name`, `email`, `department`, or `designation`, THEN THE Server SHALL return HTTP 400 with an error message listing the missing fields, and SHALL NOT create an Employee_Record.
3. IF the Add Employee form is submitted with an `email` that already exists in the DB, THEN THE Server SHALL return HTTP 409 with the message `"Email already in use"` and SHALL NOT create a duplicate Employee_Record.
4. WHEN a new Employee_Record is created, THE System SHALL display an onboarding checklist specifically for that employee containing exactly: "Send welcome email", "Set up workstation", "Assign system access", "Schedule orientation".
5. WHEN an HR_Admin marks an onboarding checklist item as complete, THE System SHALL persist the completion state of that item against the employee record and render the item with a checked checkbox or strikethrough label visually distinct from incomplete items.
6. WHEN the HR_Admin opens the Add Employee form, THE System SHALL display a `managerId` dropdown populated with all existing Employee_Records; the field SHALL be optional and submission with no `managerId` selected SHALL set `managerId` to `null`.
7. IF the Add Employee form is submitted with a `managerId` value that does not match any existing employee `id` in the DB, THEN THE Server SHALL return HTTP 400 with an error message indicating the manager was not found, and SHALL NOT create an Employee_Record.

---

### Requirement 4: Employee Profile Editing

**User Story:** As an HR Admin, I want to edit an existing employee's profile, so that records stay accurate when roles, departments, or contact details change.

#### Acceptance Criteria

1. WHEN the HR_Admin submits a profile edit for a valid employee `id` with one or more updated fields from the set (`name`, `email`, `department`, `designation`, `managerId`, `joiningDate`, `status`), THE Server SHALL merge the provided fields into the existing Employee_Record and persist the updated record to the DB.
2. IF an edit request is submitted for an `id` that does not exist in the DB, THEN THE Server SHALL return HTTP 404 with the message `"Employee not found"` regardless of the format or content of the provided `id`.
3. IF an edit request attempts to blank a required field (`name`, `email`, `department`, or `designation`), THEN THE Server SHALL return HTTP 400 with an error message identifying the field, and SHALL NOT update the Employee_Record.
4. THE System SHALL prevent the `id` field from being changed via both the edit form and the API endpoint; IF an `id` field is included in the request body, THE Server SHALL ignore it and preserve the original `id`.
5. WHEN the `status` field is changed to `"Inactive"` for a valid employee, THE Server SHALL persist the change and THE System SHALL reflect the updated status badge in the directory table without requiring a full page reload.
6. IF the employee `id` is invalid when a status change is submitted, THE Server SHALL return HTTP 404 and SHALL NOT update any record.
7. WHEN the `managerId` field is updated to a valid employee `id`, THE System SHALL re-render the manager hierarchy display for the affected employee without requiring a full page reload.
8. IF an edit request is submitted with a `managerId` value that does not match any existing employee `id` in the DB, THEN THE Server SHALL return HTTP 400 with an error message indicating the manager was not found, and SHALL NOT update the Employee_Record.

---

### Requirement 5: Employee Offboarding

**User Story:** As an HR Admin, I want to remove or deactivate employees, so that the system reflects the current workforce accurately.

#### Acceptance Criteria

1. WHEN the HR_Admin confirms removal of an employee, THE Server SHALL delete the Employee_Record from the DB and return HTTP 200 with a success message indicating the employee was removed.
2. IF a removal request is submitted for an `id` that does not exist, THEN THE Server SHALL return HTTP 404 with an error message indicating the employee was not found regardless of whether the deletion confirmation was provided.
3. WHEN an employee is removed, THE System SHALL retain all Leave_Requests, Attendance_Records, Payslips, and Reviews for that `employeeId` in the DB so they remain retrievable by `employeeId` after deletion.
4. WHEN the HR_Admin initiates removal of an employee, THE System SHALL display a confirmation prompt showing the employee's name and requiring explicit confirmation before executing the deletion; WHEN the HR_Admin cancels the prompt, THE System SHALL suppress the deletion and leave the Employee_Record unchanged.
5. IF the Server encounters a write failure while attempting to delete the Employee_Record, THEN THE Server SHALL return HTTP 500 with an error message and leave the Employee_Record unchanged in the DB.

---

### Requirement 6: Manager Hierarchy View

**User Story:** As an HR Admin or Employee, I want to see a manager hierarchy, so that reporting relationships are clear.

#### Acceptance Criteria

1. WHEN an employee profile is viewed, THE System SHALL display the employee's manager name in the hierarchy section, resolved by looking up the Employee_Record whose `id` matches the viewed employee's `managerId`.
2. IF the `managerId` of an employee references an `id` that does not exist in the DB (dangling reference), THEN THE System SHALL display "Manager not found" in the manager name area of the hierarchy section.
3. WHEN a manager's profile is viewed, THE System SHALL display a list of that manager's direct reports derived from all Employee_Records where `managerId` matches the manager's `id`; each entry in the list SHALL show the direct report's name and designation.
4. IF an employee has no `managerId` set (null), THEN THE System SHALL display "No manager assigned" in the manager name area of the hierarchy section.

---

### Requirement 7: Leave Application

**User Story:** As an Employee, I want to apply for leave, so that my time-off requests are formally recorded and routed for approval.

#### Acceptance Criteria

1. WHEN an Employee submits a leave application with valid `employeeId`, `type` (one of: "Casual Leave", "Sick Leave", "Earned Leave"), `fromDate` (YYYY-MM-DD), and `toDate` (YYYY-MM-DD), THE Server SHALL create a new Leave_Request with `status` set to `"Pending"` and `appliedOn` set to the current date, persist it to the DB, and return HTTP 201; a valid application SHALL never trigger a validation error response.
2. IF a leave application is submitted without `type`, `fromDate`, or `toDate`, THEN THE Server SHALL return HTTP 400 with an error message identifying the missing fields, and the HTTP 400 response SHALL always include an error message body.
3. IF `fromDate` is later than `toDate` in a submitted leave application, THEN THE Server SHALL return HTTP 400 with the message `"fromDate must not be later than toDate"`.
4. IF a leave application is submitted with a `type` value not in the set `{"Casual Leave", "Sick Leave", "Earned Leave"}`, THEN THE Server SHALL return HTTP 400 with an error message indicating the invalid leave type.
5. IF a leave application is submitted with an `employeeId` that does not match any Employee_Record in the DB, THEN THE Server SHALL return HTTP 400 with the message `"Invalid employeeId"`.
6. WHEN an Employee views their leave requests, THE System SHALL display only the Leave_Requests where `employeeId` matches their session identity, where "session identity" is the `employeeId` selected at role-selection time.

---

### Requirement 8: Leave Balance Tracking

**User Story:** As an Employee, I want to see my remaining leave balance per type, so that I know how many days I can still take.

#### Acceptance Criteria

1. THE System SHALL track a fixed annual leave entitlement per employee per leave type for each calendar year regardless of joining date: 12 days Casual Leave, 12 days Sick Leave, and 15 days Earned Leave.
2. WHEN an Employee views the Leave Management screen, THE System SHALL display the remaining balance for each leave type, calculated as entitlement minus the sum of `(toDate − fromDate + 1)` across all Leave_Requests for that employee and leave type where `status` is `"Approved"` and the leave falls within the current calendar year.
3. IF an Employee submits a leave application where `(toDate − fromDate + 1)` exceeds the remaining balance for that leave type (counting both Approved and Pending requests for that type in the current year), THEN THE Server SHALL return HTTP 422 with an error message indicating insufficient leave balance for the specified type; THE Server SHALL also reject the application and return HTTP 422 with an error message when the remaining balance is zero.
4. WHEN a Leave_Request status transitions away from `"Approved"` (e.g., changed to `"Rejected"`), THE System SHALL restore the corresponding `(toDate − fromDate + 1)` days to the employee's balance for that leave type.

---

### Requirement 9: Leave Approval Workflow

**User Story:** As an HR Admin or Manager, I want to approve or reject leave requests, so that workforce availability is managed appropriately.

#### Acceptance Criteria

1. WHEN an HR_Admin or Manager submits an approval decision (`"Approved"` or `"Rejected"`) for a Leave_Request in `"Pending"` status, THE Server SHALL update the `status` field of that Leave_Request, persist it to the DB, and return HTTP 200 with the updated Leave_Request.
2. IF an approval decision is submitted for a Leave_Request `id` that does not exist in the DB, THEN THE Server SHALL return HTTP 404 with an error message indicating the leave request was not found.
3. IF an approval decision is submitted for a Leave_Request not in `"Pending"` status, THEN THE Server SHALL return HTTP 409 with an error message indicating the request is not in Pending status, including when the same decision that was previously applied is resubmitted.
4. WHEN a Manager views the Leave Management screen, THE System SHALL display only the Leave_Requests where the `employeeId` matches an Employee_Record whose `managerId` equals the Manager's session `employeeId`; THE System SHALL filter by employee reporting relationship only without requiring additional authorization checks.
5. WHEN an HR_Admin views the Leave Management screen, THE System SHALL display all Leave_Requests across all employees.
6. IF a status value other than `"Approved"`, `"Rejected"`, or `"Pending"` is submitted in a leave status update, THEN THE Server SHALL return HTTP 400 with an error message indicating the valid status values.

---

### Requirement 10: Attendance Tracking — Clock In / Clock Out

**User Story:** As an Employee, I want to clock in and clock out each day, so that my attendance is recorded accurately.

#### Acceptance Criteria

1. WHEN an Employee clocks in, THE Server SHALL create a new Attendance_Record with `employeeId`, `date` set to the current date (YYYY-MM-DD), `clockIn` set to the current time (HH:MM), `clockOut` set to `null`, and `status` set to `"Present"`, persist it to the DB, and return HTTP 201 with the created Attendance_Record.
2. IF an Employee attempts to clock in when an Attendance_Record for the same `employeeId` and current `date` already exists, THEN THE Server SHALL return HTTP 409 with the message `"Already clocked in for today"`.
3. WHILE an open Attendance_Record (where `clockOut` is `null`) exists for the Employee's `employeeId` and the current `date`, WHEN the Employee clocks out, THE Server SHALL update that record by setting `clockOut` to the current time (HH:MM) and persist the update to the DB.
4. IF an Employee attempts to clock out when no open Attendance_Record (where `clockOut` is `null`) exists for the same `employeeId` and current `date`, THEN THE Server SHALL return HTTP 409 with the message `"No open clock-in found for today"`.
5. WHEN an Employee views the Attendance view and an Attendance_Record exists for today's date, THE System SHALL display their `clockIn` time and, if `clockOut` is not null, their `clockOut` time; if `clockOut` is null, THE System SHALL display the clock-in time with an indicator that the employee has not yet clocked out.
6. WHEN an Employee views the Attendance view, THE System SHALL always display attendance information regardless of whether an Attendance_Record exists for today's date; IF no Attendance_Record exists for today's date, THE System SHALL display a message indicating the employee has not clocked in today.
7. WHEN an Employee clocks out successfully, THE Server SHALL return HTTP 200 with the updated Attendance_Record.

---

### Requirement 11: Attendance Records View

**User Story:** As an Employee or HR Admin, I want to view attendance history, so that past attendance can be reviewed and discrepancies identified.

#### Acceptance Criteria

1. WHEN an Employee views their attendance history, THE System SHALL display all Attendance_Records for that `employeeId` ordered by `date` descending.
2. WHEN an HR_Admin views the attendance admin panel, THE System SHALL display all Attendance_Records for all employees, including the employee name resolved by looking up the Employee_Record matching each `employeeId`.
3. WHEN an HR_Admin filters attendance by employee or by date range, THE System SHALL return only the Attendance_Records matching all specified filter criteria; IF a date range filter is submitted where `fromDate` is later than `toDate`, THE Server SHALL return HTTP 400 with an error message indicating the invalid date range for all user roles including HR_Admin.
4. WHEN an HR_Admin selects a month to view in the attendance admin panel, THE System SHALL display a summary per employee showing: total present days (records where `clockIn` is not null), total absent days (count of Monday–Friday working days in the selected month with no Attendance_Record for that employee), and total incomplete days (records where `clockIn` is not null and `clockOut` is null).
5. WHEN an Employee selects a month to view in their attendance history, THE System SHALL display a personal summary showing: total present days, total absent days (Monday–Friday working days in the selected month with no Attendance_Record), and total incomplete days for their `employeeId`.

---

### Requirement 12: Salary Records Management

**User Story:** As an HR Admin, I want to create and update salary records per employee, so that payroll calculations are based on current compensation data.

#### Acceptance Criteria

1. WHEN an HR_Admin submits a salary record for an employee with valid `employeeId`, `baseSalary` (numeric, ≥ 0), `allowances` (numeric, ≥ 0), `deductions`, and `effectiveFrom` (in `YYYY-MM-DD` format), THE Server SHALL create a new Salary_Record with a unique `id` (format `S###`) and persist it to the DB.
2. IF a salary record is submitted for an `employeeId` that does not exist in the DB, THEN THE Server SHALL return HTTP 400 with the message `"Invalid employeeId"`.
3. IF `baseSalary` is submitted as a value less than 0, OR `allowances` is submitted as a value less than 0, THEN THE Server SHALL reject the request and return HTTP 400 with an error message indicating the offending field must be a non-negative number; THE Server SHALL reject when either field is negative.
4. IF `deductions` is submitted as a value greater than `baseSalary + allowances`, THEN THE Server SHALL return HTTP 400 with the message `"deductions must not exceed gross pay"`.
5. WHEN an HR_Admin submits an update for an existing Salary_Record identified by its `id`, THE Server SHALL merge the provided fields (`baseSalary`, `allowances`, `deductions`, `effectiveFrom`) into the record and persist it, preserving the original `id` and `employeeId`.
6. IF an HR_Admin submits an update for a Salary_Record `id` that does not exist in the DB, THEN THE Server SHALL return HTTP 404 with an error message indicating the salary record was not found.
7. WHEN an HR_Admin views the salary configuration panel, THE System SHALL display, for each employee, the Salary_Record with the latest `effectiveFrom` date; if two records share the same `effectiveFrom` date, THE System SHALL display the one with the highest `id` value.

---

### Requirement 13: Payslip Generation

**User Story:** As an HR Admin, I want to generate monthly payslips for employees, so that each employee has a formal record of their monthly compensation.

#### Acceptance Criteria

1. WHEN an HR_Admin triggers payslip generation for a given `employeeId`, `month` (integer 1–12), and `year` (4-digit integer), THE Server SHALL compute `netPay` as `baseSalary + allowances - deductions` (treating absent `allowances` or `deductions` as 0) using the most recent Salary_Record whose `effectiveFrom` is on or before the last day of that month, create a Payslip record with `generatedOn` set to the current date in YYYY-MM-DD format, and persist it to the DB.
2. IF payslip generation is triggered for a `month`/`year` for which a Payslip already exists for that `employeeId`, THEN THE Server SHALL return HTTP 409 with the message `"Payslip already generated for this period"`.
3. IF no Salary_Record exists for the employee with an `effectiveFrom` on or before the last day of the requested month, THEN THE Server SHALL return HTTP 422 with the message `"No salary record found for the requested period"`.
4. IF payslip generation is triggered for an `employeeId` that does not exist in the DB, THEN THE Server SHALL return HTTP 404 with an error message indicating the employee was not found.
5. WHEN the HR_Admin triggers bulk payslip generation for a given `month` and `year`, THE Server SHALL attempt to generate Payslips for all active employees; for each employee, THE Server SHALL skip those who already have a Payslip for that period or have no valid Salary_Record; THE Server SHALL return a summary containing: count of successfully generated payslips, count skipped due to duplicate, count skipped due to missing salary record.
6. WHEN the bulk payslip generation encounters a write failure for an individual employee, THE Server SHALL continue processing remaining employees, record the failure in the summary, and return the summary with all counts at the end.

---

### Requirement 14: Payslip View

**User Story:** As an Employee, I want to view my payslips, so that I have a clear record of my monthly compensation.

#### Acceptance Criteria

1. WHEN an Employee views the Payroll section, THE System SHALL display a list of all Payslips for that `employeeId` ordered by `year` descending, then `month` descending; IF no Payslips exist for that `employeeId`, THE System SHALL display an empty-state message indicating no payslips are available.
2. WHEN an Employee selects a payslip from the list, THE System SHALL display a payslip detail view showing: employee name, month, year, base salary, total allowances, total deductions, and net pay calculated as `baseSalary + allowances − deductions`.
3. WHEN an HR_Admin selects a month and year in the payroll admin panel, THE System SHALL display a summary table of all Payslips for that period with one row per employee showing name, department, and net pay; IF no Payslips exist for the selected period, THE System SHALL display an empty-state message in the table.

---

### Requirement 15: Performance Review Cycle Management

**User Story:** As an HR Admin, I want to create and manage performance review cycles, so that reviews are conducted in structured, time-boxed periods.

#### Acceptance Criteria

1. WHEN an HR_Admin submits a new Review_Cycle with valid `title`, `startDate` (YYYY-MM-DD), and `endDate` (YYYY-MM-DD), THE Server SHALL create a new Review_Cycle with a unique `id` (format `RC###`), `status` set to `"Active"`, and persist it to the DB.
2. IF a Review_Cycle is submitted with `startDate` later than `endDate`, THEN THE Server SHALL return HTTP 400 with the message `"startDate must not be later than endDate"`.
3. IF a Review_Cycle is submitted with a missing or empty `title`, `startDate`, or `endDate`, THEN THE Server SHALL return HTTP 400 with an error message identifying the missing fields and SHALL NOT create a Review_Cycle.
4. WHEN an HR_Admin closes a Review_Cycle by submitting a close action for an existing `id`, THE Server SHALL update its `status` to `"Closed"` and persist the change to the DB.
5. IF the close action is submitted for a Review_Cycle `id` that does not exist in the DB, THEN THE Server SHALL return HTTP 404 with an error message indicating the review cycle was not found.
6. IF the close action is submitted for a Review_Cycle whose `status` is already `"Closed"`, THEN THE Server SHALL return HTTP 409 with an error message indicating the review cycle is already closed.
7. IF an HR_Admin attempts to create a new Review for a Review_Cycle whose `status` in the DB is `"Closed"`, THEN THE Server SHALL return HTTP 409 with the message `"Review cycle is closed"`.
8. WHEN an HR_Admin views the Performance Reviews section, THE System SHALL display all Review_Cycles ordered by `startDate` descending, with their `title`, `startDate`, `endDate`, and `status`.

---

### Requirement 16: Self-Assessment Submission

**User Story:** As an Employee, I want to submit a self-assessment for an active review cycle, so that my perspective is included in my performance review.

#### Acceptance Criteria

1. WHEN an Employee submits a self-assessment for a valid `cycleId` and their own `employeeId` with non-empty `selfAssessment` text, THE Server SHALL create a new Review record with `status` set to `"Self-Assessment Submitted"` and persist it to the DB.
2. IF an Employee submits a self-assessment for a `cycleId` whose Review_Cycle in the DB has `status` `"Closed"`, THEN THE Server SHALL allow other criteria to create reviews even for closed cycles; submission SHALL be permitted.
3. IF an Employee submits a self-assessment when a Review record for the same `employeeId` and `cycleId` already exists, THEN THE Server SHALL return HTTP 409 with the message `"Self-assessment already submitted for this cycle"`.
4. WHEN an Employee views the Performance Reviews section, THE System SHALL display all Review records for their `employeeId` including `cycleId`, cycle title, `status`, and `selfAssessment` text.

---

### Requirement 17: Manager Rating Submission

**User Story:** As a Manager, I want to submit performance ratings and comments for my direct reports, so that employee evaluations are formally recorded.

#### Acceptance Criteria

1. WHEN a Manager submits a rating for a Review record where the `employeeId` belongs to one of their Direct_Reports and the Review's `status` is `"Self-Assessment Submitted"`, THE Server SHALL update the Review with `reviewerId` set to the Manager's employee `id`, `managerRating` set to the provided integer value (1–5), `managerComments` set to the provided text, `status` set to `"Review Complete"`, and persist the update to the DB.
2. IF the submitted `managerRating` is not an integer in the range 1–5 inclusive, THEN THE Server SHALL return HTTP 400 with the message `"managerRating must be an integer between 1 and 5"`; THE Server SHALL accept all integers 1, 2, 3, 4, and 5 inclusive as valid values.
3. IF a Manager attempts to submit a rating for an employee who is not one of their Direct_Reports, THEN THE Server SHALL return HTTP 403 with the message `"Access denied: employee is not a direct report"`.
4. IF a Manager attempts to submit a rating for a Review not in `"Self-Assessment Submitted"` status, THEN THE Server SHALL return HTTP 409 with the message `"Review is not in Self-Assessment Submitted status"`.
5. WHEN any validation check fails (invalid rating range, unauthorized access, or incorrect status), THE Server SHALL prevent all database updates to the Review record.

---

### Requirement 18: HR Performance Review Summary

**User Story:** As an HR Admin, I want to view a summary of all performance reviews across all cycles, so that I can assess overall employee performance.

#### Acceptance Criteria

1. WHEN an HR_Admin views the performance review summary for a selected Review_Cycle, THE System SHALL display a table of all Reviews for that cycle, including employee name, self-assessment text, manager name, manager rating, manager comments, and review status.
2. WHEN an HR_Admin views the performance review summary, THE System SHALL display the average `managerRating` across all `"Review Complete"` Reviews in that cycle rounded to one decimal place.
3. IF a Review_Cycle has no `"Review Complete"` Reviews, THEN THE System SHALL display the table structure with column headers but no data rows alongside a `"No completed reviews"` message in place of the average rating.

---

### Requirement 19: Dashboard Summary

**User Story:** As an HR Admin, I want a dashboard with key workforce metrics, so that I can get a quick overview of the organisation's status.

#### Acceptance Criteria

1. WHEN the Dashboard view is loaded by an HR_Admin, THE Server SHALL return a summary containing: total employees, active employees, pending leave requests, approved leaves for the current calendar month, list of distinct departments, total clock-ins for today, and count of active employees without a payslip for the current month; THE System SHALL check the user's role and show this HR Admin summary only when the session role is HR_Admin.
2. THE System SHALL display each summary metric in a distinct stat card on the Dashboard.
3. WHEN the Dashboard is loaded as an Employee, THE System SHALL display only that employee's own stats: leave balance summary, today's clock-in status (and clock-out status if available), and their most recent payslip net pay; THE System SHALL require all employee stats including clock-in status to be available before displaying any stats.

---

### Requirement 20: System Persistence and Startup

**User Story:** As a developer, I want the system to start with a single command and persist all data across restarts, so that the prototype is easy to run and data is not lost between sessions.

#### Acceptance Criteria

1. THE Server SHALL start and serve all API routes and frontend static files on port 4000 by running `node server.js` from the `backend/` directory without installing any external npm packages.
2. THE DB SHALL persist all collections as human-readable JSON files under `backend/data/`, creating collection files that do not exist on first write.
3. WHEN the Server is restarted after a previous session, THE DB SHALL reload all collection data from the JSON files on disk, restoring the application state as it was before the restart; on a first-time startup where no data directory or JSON files exist, THE DB SHALL start with empty collections; state restoration SHALL occur only through JSON file reloading.
4. IF a JSON collection file is malformed, empty, or unreadable due to file system permission issues, THEN THE DB SHALL return an empty array for that collection without crashing the Server, without logging any messages, and without displaying error messages.
5. THE System SHALL serve all frontend files (`index.html`, `styles.css`, `app.js`) as static assets from the `frontend/` directory without requiring a separate build step or asset server.
