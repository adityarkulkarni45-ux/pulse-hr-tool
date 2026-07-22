// server.js
// Zero-dependency HTTP server with request dispatcher for Pulse HR Tool
// Implements task 2.1: HTTP server with request dispatcher

const http = require("http");
const fs = require("fs");
const path = require("path");
const { readCollection, writeCollection, nextId } = require("./db");

const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

/**
 * Save base64 image data as a file
 * @param {string} base64Data - Base64 encoded image data (data:image/jpeg;base64,...)
 * @param {string} employeeId - Employee ID for filename
 * @returns {string} Filename of saved image
 */
function savePhotoAsFile(base64Data, employeeId) {
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return null;
  }

  // Extract image type and data
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return null;
  }

  const imageType = matches[1]; // jpeg, png, etc.
  const base64Image = matches[2];
  
  // Generate filename
  const filename = `${employeeId}_${Date.now()}.${imageType}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  
  // Convert base64 to buffer and save
  const imageBuffer = Buffer.from(base64Image, 'base64');
  fs.writeFileSync(filepath, imageBuffer);
  
  return filename;
}

/**
 * Delete photo file
 * @param {string} filename - Filename to delete
 */
function deletePhotoFile(filename) {
  if (!filename) return;
  
  const filepath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

/**
 * Send JSON response with status code and CORS headers for development
 * @param {http.ServerResponse} res - HTTP response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Data to send as JSON
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
  });
  res.end(JSON.stringify(data));
}

/**
 * Parse JSON from request stream
 * @param {http.IncomingMessage} req - HTTP request object
 * @returns {Promise<Object>} Parsed JSON object or empty object
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Serve static frontend files
 * @param {http.IncomingMessage} req - HTTP request object
 * @param {http.ServerResponse} res - HTTP response object
 * @param {string} urlPath - URL path to serve
 */
function serveStatic(req, res, urlPath) {
  let filePath = urlPath === "/" ? "/index.html" : urlPath;
  filePath = path.join(FRONTEND_DIR, filePath);

  // prevent path traversal outside the frontend directory
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Access-Control-Allow-Origin": "*"
    });
    res.end(content);
  });
}

/* ------------------------------ business logic functions ------------------------------ */

/**
 * Validate employee data for required fields and format
 * @param {Object} data - Employee data object
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateEmployee(data) {
  const errors = [];
  const { name, email, department, designation } = data;

  // Check required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required');
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('email is required');
  }
  if (!department || typeof department !== 'string' || department.trim() === '') {
    errors.push('department is required');
  }
  if (!designation || typeof designation !== 'string' || designation.trim() === '') {
    errors.push('designation is required');
  }

  // Validate email format (basic regex)
  if (email && typeof email === 'string' && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('email format is invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if email is unique across all employees
 * @param {string} email - Email to check
 * @param {string} excludeId - Employee ID to exclude from check (for updates)
 * @returns {boolean} true if email is unique
 */
function isEmailUnique(email, excludeId = null) {
  if (!email) return false;
  const employees = readCollection("employees");
  return !employees.some(emp => 
    emp.email.toLowerCase() === email.toLowerCase() && emp.id !== excludeId
  );
}

/**
 * Check if manager ID references an existing employee
 * @param {string} managerId - Manager ID to validate
 * @returns {boolean} true if manager exists or managerId is null
 */
function isValidManagerId(managerId) {
  if (!managerId) return true; // null managerId is valid
  const employees = readCollection("employees");
  return employees.some(emp => emp.id === managerId);
}

/**
 * Resolve manager name from managerId
 * @param {string|null} managerId - Manager ID to resolve
 * @returns {string} Manager name, "No manager assigned" if null, "Manager not found" if dangling
 */
function resolveManagerName(managerId) {
  if (managerId === null || managerId === undefined) return "No manager assigned";
  const employees = readCollection("employees");
  const manager = employees.find(emp => emp.id === managerId);
  return manager ? manager.name : "Manager not found";
}

/**
 * Get direct reports for a manager
 * @param {string} managerId - Manager ID
 * @returns {Array<Object>} Array of employees reporting to this manager
 */
function getDirectReports(managerId) {
  const employees = readCollection("employees");
  return employees.filter(emp => emp.managerId === managerId);
}

/* ------------------------------ onboarding functions ------------------------------ */

/**
 * Create default onboarding checklist for a new employee
 * @param {string} employeeId - Employee ID
 * @returns {Object} Created onboarding checklist
 */
function createOnboardingChecklist(employeeId) {
  const checklists = readCollection("onboarding");
  
  // Check if checklist already exists
  const existing = checklists.find(c => c.employeeId === employeeId);
  if (existing) {
    return existing;
  }

  const standardItems = [
    { id: "item1", label: "Send welcome email", completed: false },
    { id: "item2", label: "Set up workstation", completed: false },
    { id: "item3", label: "Assign system access", completed: false },
    { id: "item4", label: "Schedule orientation", completed: false }
  ];

  const newChecklist = {
    id: nextId("onboarding", "O"),
    employeeId,
    items: standardItems
  };

  checklists.push(newChecklist);
  writeCollection("onboarding", checklists);
  return newChecklist;
}

/**
 * Get onboarding checklist for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Object|null} Onboarding checklist or null if not found
 */
function getOnboardingChecklist(employeeId) {
  const checklists = readCollection("onboarding");
  return checklists.find(c => c.employeeId === employeeId) || null;
}

/**
 * Update onboarding checklist item completion state
 * @param {string} employeeId - Employee ID
 * @param {string} itemId - Item ID to update
 * @param {boolean} completed - Completion state
 * @returns {Object|null} Updated checklist or null if not found
 */
function updateOnboardingItem(employeeId, itemId, completed) {
  const checklists = readCollection("onboarding");
  const checklistIndex = checklists.findIndex(c => c.employeeId === employeeId);
  
  if (checklistIndex === -1) {
    return null;
  }

  const checklist = checklists[checklistIndex];
  const itemIndex = checklist.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    return null;
  }

  checklist.items[itemIndex].completed = completed;
  checklists[checklistIndex] = checklist;
  writeCollection("onboarding", checklists);
  
  return checklist;
}

/* ------------------------------ leave management functions ------------------------------ */

/**
 * Calculate leave days from date range
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @returns {number} Number of days (inclusive)
 */
function calculateLeaveDays(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = to - from;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // inclusive
}

/**
 * Calculate leave balance for an employee and leave type in a calendar year
 * @param {string} employeeId - Employee ID
 * @param {string} leaveType - Leave type
 * @param {number} year - Calendar year
 * @returns {number} Remaining leave balance
 */
function calculateLeaveBalance(employeeId, leaveType, year) {
  const entitlements = {
    "Casual Leave": 12,
    "Sick Leave": 12,
    "Earned Leave": 15
  };

  const entitlement = entitlements[leaveType] || 0;
  const leaves = readCollection("leaves");

  // Sum up approved and pending leaves for this type in the calendar year
  const usedDays = leaves
    .filter(leave => {
      if (leave.employeeId !== employeeId || leave.type !== leaveType) {
        return false;
      }
      // Count both Approved and Pending leaves (per requirement 8.3)
      if (leave.status !== "Approved" && leave.status !== "Pending") {
        return false;
      }
      // Check if leave falls within the calendar year
      const leaveYear = new Date(leave.fromDate).getFullYear();
      return leaveYear === year;
    })
    .reduce((sum, leave) => {
      return sum + calculateLeaveDays(leave.fromDate, leave.toDate);
    }, 0);

  return entitlement - usedDays;
}

/**
 * Check if employee has sufficient leave balance
 * @param {string} employeeId - Employee ID
 * @param {string} leaveType - Leave type
 * @param {string} fromDate - Start date
 * @param {string} toDate - End date
 * @returns {boolean} true if balance is sufficient
 */
function hasLeaveBalance(employeeId, leaveType, fromDate, toDate) {
  const year = new Date(fromDate).getFullYear();
  const balance = calculateLeaveBalance(employeeId, leaveType, year);
  const required = calculateLeaveDays(fromDate, toDate);
  return balance >= required;
}

/**
 * Validate leave type
 * @param {string} type - Leave type to validate
 * @returns {boolean} true if valid leave type
 */
function isValidLeaveType(type) {
  return ["Casual Leave", "Sick Leave", "Earned Leave"].includes(type);
}

/* ------------------------------ route handlers ------------------------------ */

async function handleOnboarding(req, res, segments) {
  const employeeId = segments[3]; // ["", "api", "onboarding", ":employeeId"]

  if (req.method === "GET" && employeeId) {
    // Check if employee exists
    const employees = readCollection("employees");
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      return sendJSON(res, 404, { error: "Employee not found" });
    }

    // Get or create checklist
    let checklist = getOnboardingChecklist(employeeId);
    if (!checklist) {
      checklist = createOnboardingChecklist(employeeId);
    }

    return sendJSON(res, 200, checklist);
  }

  if (req.method === "PUT" && employeeId) {
    const body = await readBody(req);
    const { itemId, completed } = body;

    if (!itemId || typeof completed !== 'boolean') {
      return sendJSON(res, 400, { error: "itemId and completed (boolean) are required" });
    }

    // Check if employee exists
    const employees = readCollection("employees");
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      return sendJSON(res, 404, { error: "Employee not found" });
    }

    // Get or create checklist if it doesn't exist
    let checklist = getOnboardingChecklist(employeeId);
    if (!checklist) {
      checklist = createOnboardingChecklist(employeeId);
    }

    // Update item
    const updatedChecklist = updateOnboardingItem(employeeId, itemId, completed);
    if (!updatedChecklist) {
      return sendJSON(res, 404, { error: "Onboarding item not found" });
    }

    return sendJSON(res, 200, updatedChecklist);
  }

  sendJSON(res, 405, { error: "Method not allowed" });
}

async function handleEmployees(req, res, segments) {
  const id = segments[3]; // ["", "api", "employees", ":id"]

  if (req.method === "GET" && !id) {
    return sendJSON(res, 200, readCollection("employees"));
  }

  if (req.method === "GET" && id) {
    const emp = readCollection("employees").find((e) => e.id === id);
    if (!emp) return sendJSON(res, 404, { error: "Employee not found" });
    return sendJSON(res, 200, emp);
  }

  if (req.method === "POST" && !id) {
    const body = await readBody(req);
    const { name, email, department, designation, managerId, joiningDate, photo } = body;
    
    // Validate required fields and format
    const validation = validateEmployee(body);
    if (!validation.valid) {
      return sendJSON(res, 400, { error: validation.errors.join(', ') });
    }

    // Check email uniqueness
    if (!isEmailUnique(email)) {
      return sendJSON(res, 409, { error: "Email already in use" });
    }

    // Validate manager ID if provided
    if (managerId && !isValidManagerId(managerId)) {
      return sendJSON(res, 400, { error: "Manager not found" });
    }

    const employees = readCollection("employees");
    const newEmployeeId = nextId("employees", "EMP");
    
    // Save photo as file if provided
    let photoFilename = null;
    if (photo) {
      photoFilename = savePhotoAsFile(photo, newEmployeeId);
    }
    
    const newEmployee = {
      id: newEmployeeId,
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      designation: designation.trim(),
      managerId: managerId || null,
      joiningDate: joiningDate || new Date().toISOString().slice(0, 10),
      status: "Active",
      photo: photoFilename, // Store filename instead of base64
    };
    employees.push(newEmployee);
    writeCollection("employees", employees);
    
    // Auto-create onboarding checklist for new employee (requirement 3.4)
    createOnboardingChecklist(newEmployee.id);
    
    return sendJSON(res, 201, newEmployee);
  }

  if (req.method === "PUT" && id) {
    const body = await readBody(req);
    const employees = readCollection("employees");
    const idx = employees.findIndex((e) => e.id === id);
    
    if (idx === -1) return sendJSON(res, 404, { error: "Employee not found" });

    const currentEmployee = employees[idx];
    const updateData = { ...body };

    // Remove id from update data to preserve original ID (per requirement 4.4)
    delete updateData.id;

    // Validate updated fields if they are provided
    const fieldsToUpdate = {};
    
    // Only validate fields that are being updated
    if (updateData.name !== undefined) {
      if (!updateData.name || typeof updateData.name !== 'string' || updateData.name.trim() === '') {
        return sendJSON(res, 400, { error: "name cannot be blank" });
      }
      fieldsToUpdate.name = updateData.name.trim();
    }

    if (updateData.email !== undefined) {
      if (!updateData.email || typeof updateData.email !== 'string' || updateData.email.trim() === '') {
        return sendJSON(res, 400, { error: "email cannot be blank" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email.trim())) {
        return sendJSON(res, 400, { error: "email format is invalid" });
      }
      if (!isEmailUnique(updateData.email, id)) {
        return sendJSON(res, 409, { error: "Email already in use" });
      }
      fieldsToUpdate.email = updateData.email.trim();
    }

    if (updateData.department !== undefined) {
      if (!updateData.department || typeof updateData.department !== 'string' || updateData.department.trim() === '') {
        return sendJSON(res, 400, { error: "department cannot be blank" });
      }
      fieldsToUpdate.department = updateData.department.trim();
    }

    if (updateData.designation !== undefined) {
      if (!updateData.designation || typeof updateData.designation !== 'string' || updateData.designation.trim() === '') {
        return sendJSON(res, 400, { error: "designation cannot be blank" });
      }
      fieldsToUpdate.designation = updateData.designation.trim();
    }

    if (updateData.managerId !== undefined) {
      if (updateData.managerId && !isValidManagerId(updateData.managerId)) {
        return sendJSON(res, 400, { error: "Manager not found" });
      }
      fieldsToUpdate.managerId = updateData.managerId || null;
    }

    if (updateData.joiningDate !== undefined) {
      fieldsToUpdate.joiningDate = updateData.joiningDate;
    }

    if (updateData.status !== undefined) {
      fieldsToUpdate.status = updateData.status;
    }

    // Handle photo update
    if (updateData.photo !== undefined) {
      // If new photo provided, save it as file
      if (updateData.photo && updateData.photo.startsWith('data:image')) {
        // Delete old photo file if exists
        if (currentEmployee.photo) {
          deletePhotoFile(currentEmployee.photo);
        }
        // Save new photo
        fieldsToUpdate.photo = savePhotoAsFile(updateData.photo, id);
      } else if (updateData.photo === null) {
        // If photo explicitly set to null, delete old photo
        if (currentEmployee.photo) {
          deletePhotoFile(currentEmployee.photo);
        }
        fieldsToUpdate.photo = null;
      }
    }

    // Apply updates while preserving original ID
    employees[idx] = { ...currentEmployee, ...fieldsToUpdate, id: currentEmployee.id };
    writeCollection("employees", employees);
    return sendJSON(res, 200, employees[idx]);
  }

  if (req.method === "DELETE" && id) {
    let employees = readCollection("employees");
    const employee = employees.find((e) => e.id === id);
    if (!employee) return sendJSON(res, 404, { error: "Employee not found" });
    
    // Delete photo file if exists
    if (employee.photo) {
      deletePhotoFile(employee.photo);
    }
    
    // Note: As per requirement 5.3, we retain all related records in other collections
    // The deletion only removes the employee record itself
    employees = employees.filter((e) => e.id !== id);
    writeCollection("employees", employees);
    return sendJSON(res, 200, { message: "Employee removed" });
  }

  sendJSON(res, 405, { error: "Method not allowed" });
}

async function handleLeaves(req, res, segments, query) {
  const id = segments[3]; // ["", "api", "leaves", ":id"]

  // GET /api/leaves?employeeId=X - List leaves filtered by employee (requirement 7.6)
  if (req.method === "GET" && !id) {
    let leaves = readCollection("leaves");
    if (query.employeeId) {
      leaves = leaves.filter((l) => l.employeeId === query.employeeId);
    }
    return sendJSON(res, 200, leaves);
  }

  // POST /api/leaves - Create leave request with validation (requirements 7.1-7.5, 8.3)
  if (req.method === "POST" && !id) {
    const body = await readBody(req);
    const { employeeId, type, fromDate, toDate, reason } = body;

    // Requirement 7.2: Check required fields
    const missingFields = [];
    if (!type) missingFields.push('type');
    if (!fromDate) missingFields.push('fromDate');
    if (!toDate) missingFields.push('toDate');
    
    if (missingFields.length > 0) {
      return sendJSON(res, 400, { 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Requirement 7.5: Validate employeeId exists
    const employee = readCollection("employees").find((e) => e.id === employeeId);
    if (!employee) {
      return sendJSON(res, 400, { error: "Invalid employeeId" });
    }

    // Requirement 7.4: Validate leave type
    if (!isValidLeaveType(type)) {
      return sendJSON(res, 400, { 
        error: "Invalid leave type. Must be one of: Casual Leave, Sick Leave, Earned Leave" 
      });
    }

    // Requirement 7.3: Validate date range (fromDate <= toDate)
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
      return sendJSON(res, 400, { error: "fromDate must not be later than toDate" });
    }

    // Requirement 8.3: Check leave balance (includes pending and approved leaves)
    if (!hasLeaveBalance(employeeId, type, fromDate, toDate)) {
      return sendJSON(res, 422, { 
        error: `Insufficient leave balance for ${type}` 
      });
    }

    // Requirement 7.1: Create leave request with Pending status
    const leaves = readCollection("leaves");
    const newLeave = {
      id: nextId("leaves", "L"),
      employeeId,
      employeeName: employee.name,
      type,
      fromDate,
      toDate,
      reason: reason || "",
      status: "Pending",
      appliedOn: new Date().toISOString().slice(0, 10),
    };
    leaves.push(newLeave);
    writeCollection("leaves", leaves);
    return sendJSON(res, 201, newLeave);
  }

  // PUT /api/leaves/:id - Update leave status (approve/reject) (requirements 9.1-9.3, 9.6)
  if (req.method === "PUT" && id) {
    const body = await readBody(req);
    const { status, rejectionReason } = body;

    // Requirement 9.6: Validate status value
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return sendJSON(res, 400, { 
        error: "status must be Approved, Rejected, or Pending" 
      });
    }

    // If rejecting, require a rejection reason
    if (status === "Rejected" && !rejectionReason) {
      return sendJSON(res, 400, {
        error: "rejectionReason is required when rejecting a leave request"
      });
    }

    const leaves = readCollection("leaves");
    const idx = leaves.findIndex((l) => l.id === id);
    
    // Requirement 9.2: Check if leave request exists
    if (idx === -1) {
      return sendJSON(res, 404, { error: "Leave request not found" });
    }

    const currentLeave = leaves[idx];

    // Requirement 9.3: Check if current status is Pending
    if (currentLeave.status !== "Pending") {
      return sendJSON(res, 409, { 
        error: "Leave request is not in Pending status" 
      });
    }

    // Requirement 9.1: Update status and persist
    leaves[idx].status = status;
    if (status === "Rejected" && rejectionReason) {
      leaves[idx].rejectionReason = rejectionReason;
    }
    writeCollection("leaves", leaves);
    return sendJSON(res, 200, leaves[idx]);
  }

  sendJSON(res, 405, { error: "Method not allowed" });
}

function handleDashboard(req, res) {
  const employees = readCollection("employees");
  const leaves = readCollection("leaves");
  sendJSON(res, 200, {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e) => e.status === "Active").length,
    pendingLeaves: leaves.filter((l) => l.status === "Pending").length,
    approvedLeavesThisMonth: leaves.filter((l) => l.status === "Approved").length,
    departments: [...new Set(employees.map((e) => e.department))],
  });
}

/**
 * Main request dispatcher - routes by URL path and method
 * @param {http.IncomingMessage} req - HTTP request object
 * @param {http.ServerResponse} res - HTTP response object
 */
async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const urlPath = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams);
  const segments = urlPath.split("/"); // ["", "api", "employees", ":id"]

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  try {
    // Serve uploaded photos
    if (urlPath.startsWith("/uploads/")) {
      const filename = path.basename(urlPath);
      const filepath = path.join(UPLOADS_DIR, filename);
      
      if (fs.existsSync(filepath)) {
        const ext = path.extname(filename);
        const contentType = MIME[ext] || "application/octet-stream";
        
        res.writeHead(200, {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*"
        });
        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(res);
        return;
      } else {
        return sendJSON(res, 404, { error: "Photo not found" });
      }
    }

    // API route dispatching
    if (urlPath.startsWith("/api/employees")) {
      return await handleEmployees(req, res, segments);
    }
    if (urlPath.startsWith("/api/onboarding")) {
      return await handleOnboarding(req, res, segments);
    }
    if (urlPath.startsWith("/api/leaves")) {
      return await handleLeaves(req, res, segments, query);
    }
    if (urlPath === "/api/dashboard") {
      return handleDashboard(req, res);
    }
    if (urlPath.startsWith("/api/")) {
      return sendJSON(res, 404, { error: "API endpoint not found" });
    }
    
    // Serve static frontend files for non-API requests
    return serveStatic(req, res, urlPath);
  } catch (err) {
    console.error("Request handling error:", err);
    return sendJSON(res, 500, { error: err.message });
  }
}

/**
 * Start HTTP server on specified port
 * @param {number} port - Port number (defaults to 4000)
 * @returns {http.Server} HTTP server instance
 */
function startServer(port = 4000) {
  const server = http.createServer(handleRequest);
  
  server.listen(port, () => {
    console.log(`Pulse HR Tool server running at http://localhost:${port}`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  return server;
}

// Export functions for testing and external use
module.exports = {
  startServer,
  handleRequest,
  readBody,
  sendJSON,
  serveStatic,
  validateEmployee,
  isEmailUnique,
  isValidManagerId,
  resolveManagerName,
  getDirectReports,
  calculateLeaveDays,
  calculateLeaveBalance,
  hasLeaveBalance,
  isValidLeaveType
};

// Start server when run directly (not when required as module)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  startServer(PORT);
}
