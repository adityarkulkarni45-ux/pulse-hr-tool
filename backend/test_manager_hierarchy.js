// test_manager_hierarchy.js
// Test manager hierarchy resolution functions (Task 3.4)

const { resolveManagerName, getDirectReports } = require('./server');
const { writeCollection } = require('./db');

// Test data with all scenarios
const testEmployees = [
  {
    id: "E001",
    name: "John Manager",
    email: "john@test.com",
    department: "IT",
    designation: "Manager",
    managerId: null, // No manager
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E002",
    name: "Jane Employee",
    email: "jane@test.com", 
    department: "IT",
    designation: "Developer",
    managerId: "E001", // Valid manager
    joiningDate: "2023-01-01",
    status: "Active"
  },
  {
    id: "E003",
    name: "Bob Employee",
    email: "bob@test.com",
    department: "IT", 
    designation: "Developer",
    managerId: "E001", // Valid manager (same as E002)
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
  }
];

function runManagerHierarchyTests() {
  console.log('🧪 Testing Manager Hierarchy Resolution (Task 3.4)');
  console.log('');

  // Setup test data
  writeCollection("employees", testEmployees);

  console.log('1. Testing resolveManagerName function');
  
  // Test requirement 6.1: Valid manager resolution
  const validManagerName = resolveManagerName("E001");
  console.log(`   ✓ Valid manager (E001): "${validManagerName}"`);
  if (validManagerName !== "John Manager") {
    console.error(`   ❌ Expected "John Manager", got "${validManagerName}"`);
    process.exit(1);
  }

  // Test requirement 6.4: Null manager
  const nullManagerName = resolveManagerName(null);
  console.log(`   ✓ Null manager: "${nullManagerName}"`);
  if (nullManagerName !== "No manager assigned") {
    console.error(`   ❌ Expected "No manager assigned", got "${nullManagerName}"`);
    process.exit(1);
  }

  // Test requirement 6.2: Dangling reference
  const danglingManagerName = resolveManagerName("E999");
  console.log(`   ✓ Dangling reference (E999): "${danglingManagerName}"`);
  if (danglingManagerName !== "Manager not found") {
    console.error(`   ❌ Expected "Manager not found", got "${danglingManagerName}"`);
    process.exit(1);
  }

  console.log('');
  console.log('2. Testing getDirectReports function');

  // Test requirement 6.3: Manager with direct reports
  const directReports = getDirectReports("E001");
  console.log(`   ✓ Direct reports for E001: ${directReports.length} employees`);
  if (directReports.length !== 2) {
    console.error(`   ❌ Expected 2 direct reports, got ${directReports.length}`);
    process.exit(1);
  }
  
  const reportIds = directReports.map(emp => emp.id).sort();
  console.log(`   ✓ Report IDs: ${reportIds.join(', ')}`);
  if (reportIds.join(',') !== 'E002,E003') {
    console.error(`   ❌ Expected E002,E003, got ${reportIds.join(',')}`);
    process.exit(1);
  }

  // Test employee with no direct reports
  const noDirectReports = getDirectReports("E002");
  console.log(`   ✓ Direct reports for E002: ${noDirectReports.length} employees`);
  if (noDirectReports.length !== 0) {
    console.error(`   ❌ Expected 0 direct reports, got ${noDirectReports.length}`);
    process.exit(1);
  }

  // Test non-existent manager
  const nonExistentReports = getDirectReports("E888");
  console.log(`   ✓ Direct reports for non-existent E888: ${nonExistentReports.length} employees`);
  if (nonExistentReports.length !== 0) {
    console.error(`   ❌ Expected 0 direct reports, got ${nonExistentReports.length}`);
    process.exit(1);
  }

  // Test dangling reference scenario (employees pointing to non-existent manager)
  const danglingReports = getDirectReports("E999");
  console.log(`   ✓ Employees with dangling reference to E999: ${danglingReports.length} employees`);
  if (danglingReports.length !== 1 || danglingReports[0].id !== "E004") {
    console.error(`   ❌ Expected 1 employee (E004), got ${danglingReports.length}`);
    process.exit(1);
  }

  console.log('');
  console.log('✅ All Manager Hierarchy Resolution tests passed!');
  console.log('');
  console.log('Requirements validated:');
  console.log('  ✓ 6.1: Manager name resolution for valid IDs');
  console.log('  ✓ 6.2: "Manager not found" for dangling references');
  console.log('  ✓ 6.3: Direct reports list for managers');
  console.log('  ✓ 6.4: "No manager assigned" for null managerId');
}

if (require.main === module) {
  runManagerHierarchyTests();
}

module.exports = { runManagerHierarchyTests };