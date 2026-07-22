// server.test.js
// Unit tests for server functions including manager hierarchy resolution

const assert = require('assert');
const { resolveManagerName, getDirectReports } = require('./server');
const { writeCollection } = require('./db');

// Test data setup
const testEmployees = [
  {
    id: "E001",
    name: "John Manager",
    email: "john@test.com",
    department: "IT",
    designation: "Manager",
    managerId: null,
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E002",
    name: "Jane Employee",
    email: "jane@test.com", 
    department: "IT",
    designation: "Developer",
    managerId: "E001",
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E003",
    name: "Bob Employee",
    email: "bob@test.com",
    department: "IT", 
    designation: "Developer",
    managerId: "E001",
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E004",
    name: "Alice Employee",
    email: "alice@test.com",
    department: "IT",
    designation: "Analyst", 
    managerId: "E999", // Dangling reference
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E005",
    name: "Charlie Employee",
    email: "charlie@test.com",
    department: "HR",
    designation: "Specialist",
    managerId: null, // No manager
    joiningDate: "2023-01-01", 
    status: "Active"
  }
];

function setupTestData() {
  writeCollection("employees", testEmployees);
}

function runTests() {
  setupTestData();
  
  // Test resolveManagerName function
  console.log("Testing resolveManagerName...");
  
  // Test case 1: Valid manager ID
  assert.strictEqual(resolveManagerName("E001"), "John Manager", "Should return manager name for valid ID");
  
  // Test case 2: Null manager ID
  assert.strictEqual(resolveManagerName(null), "No manager assigned", "Should return 'No manager assigned' for null managerId");
  
  // Test case 3: Undefined manager ID
  assert.strictEqual(resolveManagerName(undefined), "No manager assigned", "Should return 'No manager assigned' for undefined managerId");
  
  // Test case 4: Dangling reference (non-existent manager ID)
  assert.strictEqual(resolveManagerName("E999"), "Manager not found", "Should return 'Manager not found' for dangling reference");
  
  // Test case 5: Empty string manager ID
  assert.strictEqual(resolveManagerName(""), "Manager not found", "Should return 'Manager not found' for empty string");
  
  console.log("✓ resolveManagerName tests passed");
  
  // Test getDirectReports function
  console.log("Testing getDirectReports...");
  
  // Test case 1: Manager with direct reports
  const directReports = getDirectReports("E001");
  assert.strictEqual(directReports.length, 2, "Should return 2 direct reports for E001");
  assert.strictEqual(directReports[0].id, "E002", "Should include E002 as direct report");
  assert.strictEqual(directReports[1].id, "E003", "Should include E003 as direct report");
  
  // Test case 2: Employee with no direct reports
  const noReports = getDirectReports("E002");
  assert.strictEqual(noReports.length, 0, "Should return empty array for employee with no direct reports");
  
  // Test case 3: Non-existent manager ID
  const nonExistentReports = getDirectReports("E888");
  assert.strictEqual(nonExistentReports.length, 0, "Should return empty array for non-existent manager");
  
  // Test case 3b: Manager ID with dangling references (employees report to non-existent manager)
  const danglingRefReports = getDirectReports("E999");
  assert.strictEqual(danglingRefReports.length, 1, "Should return employees with dangling manager references");
  assert.strictEqual(danglingRefReports[0].id, "E004", "Should include E004 who has dangling managerId E999");
  
  // Test case 4: Null manager ID
  const nullReports = getDirectReports(null);
  assert.strictEqual(nullReports.length, 2, "Should return employees with null managerId");
  const nullManagerIds = nullReports.map(emp => emp.id).sort();
  assert.deepStrictEqual(nullManagerIds, ["E001", "E005"], "Should include E001 and E005 who have null managerId");
  
  console.log("✓ getDirectReports tests passed");
  
  console.log("All manager hierarchy resolution tests passed! ✅");
}

// Run tests when executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, setupTestData };