// record-retention.pbt.js
// Property-Based Test for Record Retention on Employee Deletion
// **Validates: Requirements 5.3**
//
// Property 3: Record Retention on Employee Deletion
// For any employee who has associated Leave_Requests, Attendance_Records, Payslips,
// or Reviews, when that employee is deleted, all associated records SHALL remain in 
// the database and be retrievable by the deleted employee's employeeId.

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
    const employeeId = `E${String(Math.floor(random * 999) + 100).padStart(3, '0')}`;
    
    // Generate associated records for this employee
    const associatedRecords = this.generateAssociatedRecords(seed, employeeId);
    
    return { employeeId, associatedRecords };
  }

  generateAssociatedRecords(seed, employeeId) {
    const records = {
      leaves: [],
      attendance: [],
      payslips: [],
      reviews: []
    };

    // Generate some leave requests
    for (let i = 0; i < 3; i++) {
      const leaveSeed = seed + i * 17;
      const leaveRandom = (leaveSeed * 9301 + 49297) % 233280 / 233280;
      
      const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave'];
      const statuses = ['Pending', 'Approved', 'Rejected'];
      
      records.leaves.push({
        id: `L${String(Math.floor(leaveRandom * 999) + 100).padStart(3, '0')}`,
        employeeId,
        employeeName: `Employee ${employeeId}`,
        type: leaveTypes[Math.floor(leaveRandom * leaveTypes.length)],
        fromDate: '2023-06-01',
        toDate: '2023-06-03',
        reason: `Test leave reason ${i}`,
        status: statuses[Math.floor((leaveRandom * 3) % 3)],
        appliedOn: '2023-05-25'
      });
    }

    // Generate some attendance records
    for (let i = 0; i < 5; i++) {
      const attendanceSeed = seed + i * 23;
      const attendanceRandom = (attendanceSeed * 9301 + 49297) % 233280 / 233280;
      
      const day = String(i + 1).padStart(2, '0');
      
      records.attendance.push({
        id: `A${String(Math.floor(attendanceRandom * 999) + 100).padStart(3, '0')}`,
        employeeId,
        date: `2023-06-${day}`,
        clockIn: '09:00',
        clockOut: attendanceRandom > 0.5 ? '17:00' : null,
        status: 'Present'
      });
    }

    // Generate some payslips
    for (let i = 0; i < 2; i++) {
      const payslipSeed = seed + i * 31;
      const payslipRandom = (payslipSeed * 9301 + 49297) % 233280 / 233280;
      
      records.payslips.push({
        id: `P${String(Math.floor(payslipRandom * 999) + 100).padStart(3, '0')}`,
        employeeId,
        month: i + 5, // May, June
        year: 2023,
        baseSalary: 50000 + Math.floor(payslipRandom * 20000),
        allowances: Math.floor(payslipRandom * 5000),
        deductions: Math.floor(payslipRandom * 2000),
        netPay: 53000, // Will be calculated
        generatedOn: '2023-06-01'
      });
    }

    // Generate some reviews
    for (let i = 0; i < 1; i++) {
      const reviewSeed = seed + i * 37;
      const reviewRandom = (reviewSeed * 9301 + 49297) % 233280 / 233280;
      
      records.reviews.push({
        id: `R${String(Math.floor(reviewRandom * 999) + 100).padStart(3, '0')}`,
        cycleId: `RC${String(Math.floor(reviewRandom * 10) + 1).padStart(3, '0')}`,
        employeeId,
        reviewerId: null,
        selfAssessment: `Self assessment for employee ${employeeId}`,
        managerRating: null,
        managerComments: '',
        status: 'Self-Assessment Submitted'
      });
    }

    return records;
  }

  async run() {
    console.log(`\n🧪 Running Property Test: ${this.name}`);
    console.log('**Validates: Requirements 5.3**\n');
    
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
const recordRetentionProperty = async (testCase) => {
  const { employeeId, associatedRecords } = testCase;

  try {
    // Setup: Create the employee and all associated records
    const employees = readCollection('employees');
    const testEmployee = {
      id: employeeId,
      name: `Test Employee ${employeeId}`,
      email: `test${employeeId}@example.com`,
      department: 'Test Department',
      designation: 'Test Position',
      managerId: null,
      joiningDate: '2023-01-01',
      status: 'Active'
    };

    // Ensure employee exists
    const existingIndex = employees.findIndex(e => e.id === employeeId);
    if (existingIndex >= 0) {
      employees[existingIndex] = testEmployee;
    } else {
      employees.push(testEmployee);
    }
    writeCollection('employees', employees);

    // Add all associated records to their respective collections
    const collections = ['leaves', 'attendance', 'payslips', 'reviews'];
    const recordCounts = {};
    
    for (const collection of collections) {
      const existingData = readCollection(collection);
      const recordsForCollection = associatedRecords[collection] || [];
      
      // Remove any existing records with the same IDs to avoid duplicates
      const filteredExisting = existingData.filter(record => 
        !recordsForCollection.some(newRecord => newRecord.id === record.id)
      );
      
      // Add new records
      const updatedData = [...filteredExisting, ...recordsForCollection];
      writeCollection(collection, updatedData);
      
      recordCounts[collection] = recordsForCollection.length;
    }

    // Verify records exist before deletion
    const preDeleteionCounts = {};
    for (const collection of collections) {
      const data = readCollection(collection);
      preDeleteionCounts[collection] = data.filter(record => record.employeeId === employeeId).length;
    }

    // Action: Delete the employee via API
    const deleteResponse = await makeRequest('DELETE', `/api/employees/${employeeId}`);

    if (deleteResponse.statusCode !== 200) {
      return {
        success: false,
        error: `Employee deletion failed with status ${deleteResponse.statusCode}`,
        details: deleteResponse.data
      };
    }

    // Verification 1: Employee should be removed
    const employeesAfterDelete = readCollection('employees');
    const deletedEmployee = employeesAfterDelete.find(e => e.id === employeeId);
    
    if (deletedEmployee) {
      return {
        success: false,
        error: 'Employee was not deleted from employees collection',
        details: { employeeId, foundEmployee: deletedEmployee }
      };
    }

    // Verification 2: All associated records should remain
    for (const collection of collections) {
      const dataAfterDelete = readCollection(collection);
      const remainingRecords = dataAfterDelete.filter(record => record.employeeId === employeeId);
      const expectedCount = preDeleteionCounts[collection];

      if (remainingRecords.length !== expectedCount) {
        return {
          success: false,
          error: `Records lost in ${collection} collection`,
          details: {
            collection,
            expectedCount,
            actualCount: remainingRecords.length,
            employeeId,
            remainingRecords: remainingRecords.map(r => r.id)
          }
        };
      }

      // Verify record contents are intact
      const originalRecords = associatedRecords[collection] || [];
      for (const originalRecord of originalRecords) {
        const foundRecord = remainingRecords.find(r => r.id === originalRecord.id);
        if (!foundRecord) {
          return {
            success: false,
            error: `Specific record lost in ${collection} collection`,
            details: {
              collection,
              lostRecordId: originalRecord.id,
              employeeId
            }
          };
        }

        // Verify key fields are preserved
        if (foundRecord.employeeId !== employeeId) {
          return {
            success: false,
            error: `Record employeeId changed in ${collection} collection`,
            details: {
              collection,
              recordId: foundRecord.id,
              expectedEmployeeId: employeeId,
              actualEmployeeId: foundRecord.employeeId
            }
          };
        }
      }
    }

    // Verification 3: Records should be retrievable by employeeId
    for (const collection of collections) {
      const dataAfterDelete = readCollection(collection);
      const retrievableRecords = dataAfterDelete.filter(record => record.employeeId === employeeId);
      
      if (retrievableRecords.length !== preDeleteionCounts[collection]) {
        return {
          success: false,
          error: `Records not retrievable by employeeId in ${collection} collection`,
          details: {
            collection,
            employeeId,
            expectedCount: preDeleteionCounts[collection],
            retrievableCount: retrievableRecords.length
          }
        };
      }
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
async function runRecordRetentionTests() {
  console.log('🚀 Starting Record Retention Property-Based Tests');
  console.log('Testing that employee deletion preserves all associated records (leaves, attendance, payslips, reviews)\n');

  const propertyTest = new PropertyTest(
    'Record Retention on Employee Deletion',
    recordRetentionProperty
  );

  const success = await propertyTest.run();
  
  if (success) {
    console.log('\n✅ Property Test PASSED: Record retention is preserved on employee deletion');
    process.exit(0);
  } else {
    console.log('\n❌ Property Test FAILED: Records were lost during employee deletion');
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
    runRecordRetentionTests();
  }).catch((error) => {
    console.error('Error waiting for server:', error);
    process.exit(1);
  });
}

module.exports = { PropertyTest, recordRetentionProperty, runRecordRetentionTests };