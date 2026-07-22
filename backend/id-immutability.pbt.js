// id-immutability.pbt.js
// Property-Based Test for ID Immutability in Employee Updates
// **Validates: Requirements 4.4**
//
// Property 2: ID Immutability in Updates
// For any employee update request that includes an `id` field in the payload,
// the employee's `id` after the update SHALL remain identical to the `id` before
// the update, regardless of the value provided in the request payload.

const http = require('http');
const { readCollection, writeCollection } = require('./db');

// Simple property-based testing utilities without external dependencies
class PropertyTest {
  constructor(name, property) {
    this.name = name;
    this.property = property;
  }

  // Generate random values for testing
  generateTestCases(count = 100) {
    const cases = [];
    for (let i = 0; i < count; i++) {
      cases.push(this.generateRandomCase(i));
    }
    return cases;
  }

  generateRandomCase(seed) {
    // Use seed for reproducible randomness
    const random = (seed * 9301 + 49297) % 233280 / 233280;
    
    // Generate random employee ID
    const employeeId = `E${String(Math.floor(random * 999) + 1).padStart(3, '0')}`;
    
    // Generate random update payload that includes an ID field
    const maliciousId = this.generateRandomId(seed + 1);
    const updatePayload = this.generateRandomPayload(seed, maliciousId);
    
    return { employeeId, updatePayload, maliciousId };
  }

  generateRandomId(seed) {
    const random = (seed * 9301 + 49297) % 233280 / 233280;
    const prefixes = ['E', 'L', 'S', 'P', 'X', 'HACKER'];
    const prefix = prefixes[Math.floor(random * prefixes.length)];
    const number = Math.floor(random * 9999) + 1;
    return `${prefix}${String(number).padStart(3, '0')}`;
  }

  generateRandomPayload(seed, maliciousId) {
    const random1 = ((seed + 1) * 9301 + 49297) % 233280 / 233280;
    const random2 = ((seed + 2) * 9301 + 49297) % 233280 / 233280;
    const random3 = ((seed + 3) * 9301 + 49297) % 233280 / 233280;
    
    const names = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown'];
    const departments = ['IT', 'HR', 'Finance', 'Sales'];
    const designations = ['Manager', 'Developer', 'Analyst', 'Admin'];
    
    // Always include the malicious ID in the payload
    const payload = {
      id: maliciousId,  // This should be ignored by the server
      name: names[Math.floor(random1 * names.length)],
      department: departments[Math.floor(random2 * departments.length)],
      designation: designations[Math.floor(random3 * designations.length)]
    };

    // Randomly include other fields
    if (random1 > 0.5) payload.email = `test${seed}@example.com`;
    if (random2 > 0.5) payload.status = random3 > 0.5 ? 'Active' : 'Inactive';
    if (random3 > 0.5) payload.managerId = `E${String(Math.floor(random1 * 10) + 1).padStart(3, '0')}`;

    return payload;
  }

  async run() {
    console.log(`\n🧪 Running Property Test: ${this.name}`);
    console.log('**Validates: Requirements 4.4**\n');
    
    const testCases = this.generateTestCases(50); // Use fewer cases for faster execution
    let passed = 0;
    let failed = 0;
    let firstFailure = null;

    for (let i = 0; i < testCases.length; i++) {
      try {
        const result = await this.property(testCases[i]);
        if (result.success) {
          passed++;
        } else {
          failed++;
          if (!firstFailure) {
            firstFailure = {
              case: testCases[i],
              error: result.error,
              details: result.details
            };
          }
        }
      } catch (error) {
        failed++;
        if (!firstFailure) {
          firstFailure = {
            case: testCases[i],
            error: error.message,
            details: 'Property test threw an exception'
          };
        }
      }
    }

    console.log(`✅ Passed: ${passed}/${testCases.length}`);
    console.log(`❌ Failed: ${failed}/${testCases.length}`);
    
    if (failed > 0 && firstFailure) {
      console.log('\n💥 First Failure:');
      console.log('Input:', JSON.stringify(firstFailure.case, null, 2));
      console.log('Error:', firstFailure.error);
      console.log('Details:', firstFailure.details);
      return false;
    }
    
    console.log('\n🎉 All property tests passed!');
    return true;
  }
}

// HTTP client utilities for testing
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: { error: 'Invalid JSON response' }
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Property test implementation
const idImmutabilityProperty = async (testCase) => {
  const { employeeId, updatePayload, maliciousId } = testCase;

  try {
    // Setup: Ensure the employee exists in the database
    const employees = readCollection('employees');
    const existingEmployee = {
      id: employeeId,
      name: 'Original Name',
      email: `original${employeeId}@example.com`,
      department: 'Original Department',
      designation: 'Original Designation',
      managerId: null,
      joiningDate: '2023-01-01',
      status: 'Active'
    };

    // Add or update the employee in the collection
    const existingIndex = employees.findIndex(e => e.id === employeeId);
    if (existingIndex >= 0) {
      employees[existingIndex] = existingEmployee;
    } else {
      employees.push(existingEmployee);
    }
    writeCollection('employees', employees);

    // Action: Attempt to update the employee with a payload that includes a malicious ID
    const response = await makeRequest('PUT', `/api/employees/${employeeId}`, updatePayload);

    if (response.statusCode !== 200) {
      return {
        success: false,
        error: `Update request failed with status ${response.statusCode}`,
        details: response.data
      };
    }

    // Verification: Check that the ID remained unchanged
    const updatedEmployee = response.data;
    
    if (!updatedEmployee || !updatedEmployee.id) {
      return {
        success: false,
        error: 'Response does not contain employee with ID',
        details: updatedEmployee
      };
    }

    if (updatedEmployee.id !== employeeId) {
      return {
        success: false,
        error: `ID was changed from ${employeeId} to ${updatedEmployee.id}`,
        details: {
          original: employeeId,
          maliciousId: maliciousId,
          actualId: updatedEmployee.id,
          payload: updatePayload
        }
      };
    }

    // Additional verification: Check that other fields were updated correctly
    const expectedUpdates = { ...updatePayload };
    delete expectedUpdates.id; // Remove the ID from expected updates

    for (const [key, value] of Object.entries(expectedUpdates)) {
      if (updatedEmployee[key] !== value) {
        return {
          success: false,
          error: `Field ${key} was not updated correctly`,
          details: {
            expected: value,
            actual: updatedEmployee[key]
          }
        };
      }
    }

    // Verify in database as well
    const dbEmployees = readCollection('employees');
    const dbEmployee = dbEmployees.find(e => e.id === employeeId);
    
    if (!dbEmployee) {
      return {
        success: false,
        error: 'Employee not found in database after update',
        details: { searchId: employeeId }
      };
    }

    if (dbEmployee.id !== employeeId) {
      return {
        success: false,
        error: `Database employee ID was changed from ${employeeId} to ${dbEmployee.id}`,
        details: {
          original: employeeId,
          maliciousId: maliciousId,
          dbId: dbEmployee.id
        }
      };
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: 'Exception during property test execution'
    };
  }
};

// Test runner
async function runIdImmutabilityTests() {
  console.log('🚀 Starting ID Immutability Property-Based Tests');
  console.log('Testing that employee IDs remain unchanged during updates regardless of request payload\n');

  const propertyTest = new PropertyTest(
    'ID Immutability in Employee Updates',
    idImmutabilityProperty
  );

  const success = await propertyTest.run();
  
  if (success) {
    console.log('\n✅ Property Test PASSED: ID immutability is preserved');
    process.exit(0);
  } else {
    console.log('\n❌ Property Test FAILED: ID immutability was violated');
    process.exit(1);
  }
}

// Wait for server to be ready before running tests
function waitForServer() {
  return new Promise((resolve) => {
    const checkServer = () => {
      const req = http.request({
        hostname: 'localhost',
        port: 4000,
        path: '/api/dashboard',
        method: 'GET'
      }, (res) => {
        resolve();
      });
      
      req.on('error', () => {
        setTimeout(checkServer, 500);
      });
      
      req.end();
    };
    
    checkServer();
  });
}

// Main execution
if (require.main === module) {
  waitForServer().then(() => {
    runIdImmutabilityTests();
  }).catch((error) => {
    console.error('Error waiting for server:', error);
    process.exit(1);
  });
}

module.exports = { PropertyTest, idImmutabilityProperty, runIdImmutabilityTests };