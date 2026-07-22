// onboarding.test.js
// Unit tests for onboarding checklist functionality
// Implements task 4.2: Write unit tests for onboarding workflow

const http = require("http");
const assert = require("assert");
const { startServer } = require("./server");
const { readCollection, writeCollection } = require("./db");

let server;
const PORT = 4001;

/**
 * Make HTTP request to test server
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} body - Request body (optional)
 * @returns {Promise<{status: number, data: Object}>}
 */
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: PORT,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : {},
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: {} });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function setupTestData() {
  // Reset test data
  writeCollection("employees", [
    {
      id: "E001",
      name: "Test Employee",
      email: "test@example.com",
      department: "Engineering",
      designation: "Software Engineer",
      managerId: null,
      joiningDate: "2024-01-15",
      status: "Active",
    },
  ]);
  writeCollection("onboarding", []);
}

async function runTests() {
  console.log("Starting onboarding checklist tests...");
  
  // Start server
  server = startServer(PORT);
  
  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 500));
  
  setupTestData();

  try {
    // Test 1: GET returns checklist with 4 standard items
    console.log("Test 1: GET /api/onboarding/:employeeId returns checklist with 4 standard items");
    const response1 = await request("GET", "/api/onboarding/E001");
    
    assert.strictEqual(response1.status, 200, "Should return 200 OK");
    assert.strictEqual(response1.data.employeeId, "E001", "Should return correct employeeId");
    assert.ok(response1.data.items, "Should have items property");
    assert.strictEqual(response1.data.items.length, 4, "Should have 4 items");
    
    // Verify standard items
    assert.strictEqual(response1.data.items[0].id, "item1", "Item 1 should have correct id");
    assert.strictEqual(response1.data.items[0].label, "Send welcome email", "Item 1 should be 'Send welcome email'");
    assert.strictEqual(response1.data.items[0].completed, false, "Item 1 should be uncompleted");
    
    assert.strictEqual(response1.data.items[1].label, "Set up workstation", "Item 2 should be 'Set up workstation'");
    assert.strictEqual(response1.data.items[2].label, "Assign system access", "Item 3 should be 'Assign system access'");
    assert.strictEqual(response1.data.items[3].label, "Schedule orientation", "Item 4 should be 'Schedule orientation'");
    console.log("✓ Test 1 passed");

    // Test 2: GET returns 404 for non-existent employee
    console.log("Test 2: GET /api/onboarding/:employeeId returns 404 for non-existent employee");
    const response2 = await request("GET", "/api/onboarding/E999");
    
    assert.strictEqual(response2.status, 404, "Should return 404 Not Found");
    assert.strictEqual(response2.data.error, "Employee not found", "Should return correct error message");
    console.log("✓ Test 2 passed");

    // Test 3: PUT updates item completion state
    console.log("Test 3: PUT /api/onboarding/:employeeId updates item completion state");
    
    // Update item completion
    const response3a = await request("PUT", "/api/onboarding/E001", {
      itemId: "item1",
      completed: true,
    });

    assert.strictEqual(response3a.status, 200, "Should return 200 OK");
    assert.strictEqual(response3a.data.items[0].completed, true, "Item 1 should be marked completed");

    // Verify persistence
    const response3b = await request("GET", "/api/onboarding/E001");
    assert.strictEqual(response3b.data.items[0].completed, true, "Item 1 completion should persist");
    console.log("✓ Test 3 passed");

    // Test 4: PUT returns 404 for non-existent employee
    console.log("Test 4: PUT /api/onboarding/:employeeId returns 404 for non-existent employee");
    const response4 = await request("PUT", "/api/onboarding/E999", {
      itemId: "item1",
      completed: true,
    });

    assert.strictEqual(response4.status, 404, "Should return 404 Not Found");
    assert.strictEqual(response4.data.error, "Employee not found", "Should return correct error message");
    console.log("✓ Test 4 passed");

    // Test 5: PUT returns 400 for missing itemId
    console.log("Test 5: PUT /api/onboarding/:employeeId returns 400 for missing itemId");
    const response5 = await request("PUT", "/api/onboarding/E001", {
      completed: true,
    });

    assert.strictEqual(response5.status, 400, "Should return 400 Bad Request");
    assert.ok(response5.data.error.includes("itemId"), "Error should mention itemId");
    console.log("✓ Test 5 passed");

    // Test 6: PUT returns 400 for missing completed field
    console.log("Test 6: PUT /api/onboarding/:employeeId returns 400 for missing completed field");
    const response6 = await request("PUT", "/api/onboarding/E001", {
      itemId: "item1",
    });

    assert.strictEqual(response6.status, 400, "Should return 400 Bad Request");
    assert.ok(response6.data.error.includes("completed"), "Error should mention completed");
    console.log("✓ Test 6 passed");

    // Test 7: PUT returns 404 for invalid itemId
    console.log("Test 7: PUT /api/onboarding/:employeeId returns 404 for invalid itemId");
    const response7 = await request("PUT", "/api/onboarding/E001", {
      itemId: "invalid-item",
      completed: true,
    });

    assert.strictEqual(response7.status, 404, "Should return 404 Not Found");
    assert.strictEqual(response7.data.error, "Onboarding item not found", "Should return correct error message");
    console.log("✓ Test 7 passed");

    // Test 8: Checklist persists completion state across multiple updates
    console.log("Test 8: Checklist persists completion state across multiple updates");
    setupTestData(); // Reset for fresh test
    
    await request("GET", "/api/onboarding/E001"); // Create checklist
    
    await request("PUT", "/api/onboarding/E001", {
      itemId: "item1",
      completed: true,
    });
    await request("PUT", "/api/onboarding/E001", {
      itemId: "item3",
      completed: true,
    });

    const response8 = await request("GET", "/api/onboarding/E001");
    assert.strictEqual(response8.data.items[0].completed, true, "Item 1 should be completed");
    assert.strictEqual(response8.data.items[1].completed, false, "Item 2 should be uncompleted");
    assert.strictEqual(response8.data.items[2].completed, true, "Item 3 should be completed");
    assert.strictEqual(response8.data.items[3].completed, false, "Item 4 should be uncompleted");
    console.log("✓ Test 8 passed");

    // Test 9: Checklist is auto-created when new employee is added
    console.log("Test 9: Checklist is auto-created when new employee is added");
    const response9a = await request("POST", "/api/employees", {
      name: "New Employee",
      email: "new@example.com",
      department: "Sales",
      designation: "Sales Rep",
    });

    assert.strictEqual(response9a.status, 201, "Should return 201 Created");
    const newEmployeeId = response9a.data.id;

    // Verify checklist was auto-created
    const checklists = readCollection("onboarding");
    const checklist = checklists.find(c => c.employeeId === newEmployeeId);
    
    assert.ok(checklist, "Checklist should be auto-created");
    assert.strictEqual(checklist.items.length, 4, "Should have 4 items");
    assert.strictEqual(checklist.items[0].label, "Send welcome email", "Should have correct first item");
    console.log("✓ Test 9 passed");

    console.log("\nAll onboarding checklist tests passed! ✅");
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  } finally {
    // Close server
    server.close();
  }
}

// Run tests when executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error("Test suite failed:", error);
    process.exit(1);
  });
}

module.exports = { runTests };
