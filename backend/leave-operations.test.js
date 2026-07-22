// leave-operations.test.js
// Unit tests for leave request operations (Task 6.1)
// Tests requirements 7.1-7.6, 8.3, 9.1-9.3, 9.6

const assert = require('assert');
const http = require('http');
const { 
  startServer, 
  calculateLeaveDays, 
  calculateLeaveBalance,
  hasLeaveBalance,
  isValidLeaveType 
} = require('./server');
const { writeCollection, readCollection } = require('./db');

// Test data
const testEmployees = [
  {
    id: "E001",
    name: "John Doe",
    email: "john@test.com",
    department: "IT",
    designation: "Developer",
    managerId: null,
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E002",
    name: "Jane Smith",
    email: "jane@test.com",
    department: "HR",
    designation: "Manager",
    managerId: null,
    joiningDate: "2023-01-01",
    status: "Active"
  }
];

const testLeaves = [
  {
    id: "L001",
    employeeId: "E001",
    employeeName: "John Doe",
    type: "Casual Leave",
    fromDate: "2024-01-15",
    toDate: "2024-01-17",
    reason: "Personal",
    status: "Approved",
    appliedOn: "2024-01-10"
  },
  {
    id: "L002",
    employeeId: "E001",
    employeeName: "John Doe",
    type: "Sick Leave",
    fromDate: "2024-02-10",
    toDate: "2024-02-10",
    reason: "Flu",
    status: "Pending",
    appliedOn: "2024-02-09"
  }
];

let server;
const PORT = 4001; // Use different port for testing

function setupTestData() {
  writeCollection("employees", testEmployees);
  writeCollection("leaves", testLeaves);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("Setting up test data...");
  setupTestData();

  console.log("Starting test server...");
  server = startServer(PORT);
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // Test utility functions
    console.log("\nTesting utility functions...");
    testUtilityFunctions();

    // Test POST /api/leaves - Create leave request
    console.log("\nTesting POST /api/leaves...");
    await testCreateLeaveRequest();

    // Test GET /api/leaves - List leaves with filter
    console.log("\nTesting GET /api/leaves...");
    await testGetLeaves();

    // Test PUT /api/leaves/:id - Update leave status
    console.log("\nTesting PUT /api/leaves/:id...");
    await testUpdateLeaveStatus();

    console.log("\n✅ All leave operations tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    throw error;
  } finally {
    console.log("\nStopping test server...");
    server.close();
  }
}

function testUtilityFunctions() {
  // Test calculateLeaveDays
  assert.strictEqual(calculateLeaveDays("2024-01-01", "2024-01-01"), 1, "Same day should be 1 day");
  assert.strictEqual(calculateLeaveDays("2024-01-01", "2024-01-03"), 3, "3-day range should be 3 days");
  assert.strictEqual(calculateLeaveDays("2024-01-15", "2024-01-17"), 3, "Jan 15-17 should be 3 days");
  console.log("  ✓ calculateLeaveDays tests passed");

  // Test isValidLeaveType
  assert.strictEqual(isValidLeaveType("Casual Leave"), true, "Casual Leave should be valid");
  assert.strictEqual(isValidLeaveType("Sick Leave"), true, "Sick Leave should be valid");
  assert.strictEqual(isValidLeaveType("Earned Leave"), true, "Earned Leave should be valid");
  assert.strictEqual(isValidLeaveType("Vacation"), false, "Vacation should be invalid");
  assert.strictEqual(isValidLeaveType(""), false, "Empty string should be invalid");
  console.log("  ✓ isValidLeaveType tests passed");

  // Test calculateLeaveBalance
  // E001 has 3 days approved Casual Leave in 2024, so balance should be 12 - 3 = 9
  const casualBalance = calculateLeaveBalance("E001", "Casual Leave", 2024);
  assert.strictEqual(casualBalance, 9, "E001 should have 9 days Casual Leave remaining");
  
  // E001 has 1 day pending Sick Leave in 2024, so balance should be 12 - 1 = 11
  const sickBalance = calculateLeaveBalance("E001", "Sick Leave", 2024);
  assert.strictEqual(sickBalance, 11, "E001 should have 11 days Sick Leave remaining (includes pending)");
  
  // E001 has no Earned Leave, so balance should be 15
  const earnedBalance = calculateLeaveBalance("E001", "Earned Leave", 2024);
  assert.strictEqual(earnedBalance, 15, "E001 should have 15 days Earned Leave remaining");
  console.log("  ✓ calculateLeaveBalance tests passed");

  // Test hasLeaveBalance
  assert.strictEqual(hasLeaveBalance("E001", "Casual Leave", "2024-03-01", "2024-03-05"), true, 
    "E001 should have balance for 5 days Casual Leave");
  assert.strictEqual(hasLeaveBalance("E001", "Casual Leave", "2024-03-01", "2024-03-15"), false, 
    "E001 should NOT have balance for 15 days Casual Leave (only 9 remaining)");
  console.log("  ✓ hasLeaveBalance tests passed");
}

async function testCreateLeaveRequest() {
  // Test requirement 7.1: Valid leave request
  let response = await makeRequest('POST', '/api/leaves', {
    employeeId: "E002",
    type: "Casual Leave",
    fromDate: "2024-03-10",
    toDate: "2024-03-12",
    reason: "Family event"
  });
  assert.strictEqual(response.statusCode, 201, "Should return 201 for valid leave request");
  assert.strictEqual(response.body.status, "Pending", "New leave should have Pending status");
  assert.strictEqual(response.body.employeeId, "E002", "Should have correct employeeId");
  assert.strictEqual(response.body.employeeName, "Jane Smith", "Should populate employeeName");
  console.log("  ✓ Valid leave request creation (7.1)");

  // Test requirement 7.2: Missing required fields
  response = await makeRequest('POST', '/api/leaves', {
    employeeId: "E002",
    fromDate: "2024-03-10",
    toDate: "2024-03-12"
    // Missing 'type'
  });
  assert.strictEqual(response.statusCode, 400, "Should return 400 for missing type");
  assert.ok(response.body.error.includes("type"), "Error should mention missing type field");
  console.log("  ✓ Missing required fields validation (7.2)");

  // Test requirement 7.3: fromDate later than toDate
  response = await makeRequest('POST', '/api/leaves', {
    employeeId: "E002",
    type: "Sick Leave",
    fromDate: "2024-03-15",
    toDate: "2024-03-10"
  });
  assert.strictEqual(response.statusCode, 400, "Should return 400 for invalid date range");
  assert.strictEqual(response.body.error, "fromDate must not be later than toDate", 
    "Should return correct error message");
  console.log("  ✓ Date range validation (7.3)");

  // Test requirement 7.4: Invalid leave type
  response = await makeRequest('POST', '/api/leaves', {
    employeeId: "E002",
    type: "Vacation Leave",
    fromDate: "2024-03-10",
    toDate: "2024-03-12"
  });
  assert.strictEqual(response.statusCode, 400, "Should return 400 for invalid leave type");
  assert.ok(response.body.error.toLowerCase().includes("invalid leave type"), 
    "Error should mention invalid leave type");
  console.log("  ✓ Leave type validation (7.4)");

  // Test requirement 7.5: Invalid employeeId
  response = await makeRequest('POST', '/api/leaves', {
    employeeId: "E999",
    type: "Casual Leave",
    fromDate: "2024-03-10",
    toDate: "2024-03-12"
  });
  assert.strictEqual(response.statusCode, 400, "Should return 400 for invalid employeeId");
  assert.strictEqual(response.body.error, "Invalid employeeId", "Should return correct error message");
  console.log("  ✓ Employee validation (7.5)");

  // Test requirement 8.3: Insufficient leave balance
  // E001 has 9 days Casual Leave remaining, requesting 15 days should fail
  response = await makeRequest('POST', '/api/leaves', {
    employeeId: "E001",
    type: "Casual Leave",
    fromDate: "2024-04-01",
    toDate: "2024-04-15"
  });
  assert.strictEqual(response.statusCode, 422, "Should return 422 for insufficient balance");
  assert.ok(response.body.error.toLowerCase().includes("insufficient"), 
    "Error should mention insufficient balance");
  console.log("  ✓ Leave balance validation (8.3)");
}

async function testGetLeaves() {
  // Test requirement 7.6: Filter by employeeId
  let response = await makeRequest('GET', '/api/leaves?employeeId=E001');
  assert.strictEqual(response.statusCode, 200, "Should return 200 for GET leaves");
  assert(Array.isArray(response.body), "Should return array of leaves");
  assert.strictEqual(response.body.length, 2, "E001 should have 2 leave requests");
  assert.ok(response.body.every(l => l.employeeId === "E001"), 
    "All leaves should belong to E001");
  console.log("  ✓ Filter leaves by employeeId (7.6)");

  // Test without filter - should return all leaves
  response = await makeRequest('GET', '/api/leaves');
  assert.strictEqual(response.statusCode, 200, "Should return 200 for GET all leaves");
  assert(response.body.length >= 3, "Should return all leaves (at least 3)");
  console.log("  ✓ Get all leaves without filter");
}

async function testUpdateLeaveStatus() {
  // Test requirement 9.1: Approve pending leave
  let response = await makeRequest('PUT', '/api/leaves/L002', {
    status: "Approved"
  });
  assert.strictEqual(response.statusCode, 200, "Should return 200 for successful update");
  assert.strictEqual(response.body.status, "Approved", "Status should be updated to Approved");
  console.log("  ✓ Approve pending leave (9.1)");

  // Test requirement 9.2: Non-existent leave request
  response = await makeRequest('PUT', '/api/leaves/L999', {
    status: "Approved"
  });
  assert.strictEqual(response.statusCode, 404, "Should return 404 for non-existent leave");
  assert.ok(response.body.error.includes("not found"), "Error should mention not found");
  console.log("  ✓ Non-existent leave request (9.2)");

  // Test requirement 9.3: Update non-pending leave
  response = await makeRequest('PUT', '/api/leaves/L001', {
    status: "Rejected"
  });
  assert.strictEqual(response.statusCode, 409, "Should return 409 for non-pending leave");
  assert.ok(response.body.error.toLowerCase().includes("not in pending"), 
    "Error should mention not in Pending status");
  console.log("  ✓ Cannot update non-pending leave (9.3)");

  // Test requirement 9.6: Invalid status value
  response = await makeRequest('PUT', '/api/leaves/L002', {
    status: "Cancelled"
  });
  assert.strictEqual(response.statusCode, 400, "Should return 400 for invalid status");
  assert.ok(response.body.error.includes("status must be"), 
    "Error should mention valid status values");
  console.log("  ✓ Invalid status validation (9.6)");
}

// Run tests when executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runTests };
