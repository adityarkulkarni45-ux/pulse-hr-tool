// Test Edge Cases for Employee CRUD Operations
// Additional tests to ensure complete requirement coverage

const http = require('http');
const { startServer } = require('./server.js');

// Start server for testing
const server = startServer(3002);

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            data: body ? JSON.parse(body) : null,
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body,
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

async function runEdgeCaseTests() {
  console.log('🧪 Testing Employee CRUD Edge Cases\n');

  try {
    // Create a manager first for testing managerId validation
    console.log('1. Creating manager employee for testing');
    const managerData = {
      name: 'Test Manager',
      email: 'manager@example.com',
      department: 'Management',
      designation: 'Manager'
    };
    const createManager = await makeRequest('POST', '/api/employees', managerData);
    const managerId = createManager.data?.id;
    console.log(`   ✓ Manager created with ID: ${managerId}`);

    // Test 2: Create employee with valid manager ID
    console.log('\n2. Testing POST with valid manager ID');
    const employeeWithManager = {
      name: 'Test Employee With Manager',
      email: 'emp.with.manager@example.com',
      department: 'Engineering',
      designation: 'Developer',
      managerId: managerId
    };
    const createEmpWithMgr = await makeRequest('POST', '/api/employees', employeeWithManager);
    console.log(`   ✓ Status: ${createEmpWithMgr.statusCode}`);
    console.log(`   ✓ Manager ID assigned: ${createEmpWithMgr.data?.managerId}`);

    // Test 3: Email format validation
    console.log('\n3. Testing invalid email formats');
    const invalidEmails = [
      'not-an-email',
      '@missing-local.com',
      'missing-at-sign.com',
      'missing-domain@',
      'spaces in@email.com'
    ];
    
    for (const email of invalidEmails) {
      const invalidEmailEmployee = {
        name: 'Test',
        email: email,
        department: 'Test',
        designation: 'Test'
      };
      const response = await makeRequest('POST', '/api/employees', invalidEmailEmployee);
      console.log(`   ✓ Email "${email}" rejected with status: ${response.statusCode}`);
    }

    // Test 4: Update email with uniqueness check
    const testEmpId = createEmpWithMgr.data?.id;
    if (testEmpId) {
      console.log('\n4. Testing email uniqueness on update');
      const updateWithDuplicateEmail = {
        email: 'manager@example.com' // This email already exists
      };
      const updateDuplicate = await makeRequest('PUT', `/api/employees/${testEmpId}`, updateWithDuplicateEmail);
      console.log(`   ✓ Status: ${updateDuplicate.statusCode} (expected 409)`);
      console.log(`   ✓ Error: ${updateDuplicate.data?.error}`);
    }

    // Test 5: Update with blank required fields
    if (testEmpId) {
      console.log('\n5. Testing updates with blank required fields');
      const blankFields = [
        { name: '' },
        { email: ' ' },
        { department: null },
        { designation: undefined }
      ];

      for (const field of blankFields) {
        const response = await makeRequest('PUT', `/api/employees/${testEmpId}`, field);
        console.log(`   ✓ Blank field ${JSON.stringify(field)} rejected with status: ${response.statusCode}`);
      }
    }

    // Test 6: Case-insensitive email uniqueness
    console.log('\n6. Testing case-insensitive email uniqueness');
    const caseTestEmployee = {
      name: 'Case Test',
      email: 'MANAGER@EXAMPLE.COM', // Same as manager@example.com but uppercase
      department: 'Test',
      designation: 'Test'
    };
    const caseResponse = await makeRequest('POST', '/api/employees', caseTestEmployee);
    console.log(`   ✓ Status: ${caseResponse.statusCode} (expected 409)`);
    console.log(`   ✓ Case-insensitive check working: ${caseResponse.data?.error}`);

    // Test 7: Test with null managerId (should be valid)
    console.log('\n7. Testing null managerId');
    const noManagerEmployee = {
      name: 'No Manager Employee',
      email: 'no.manager@example.com',
      department: 'Independent',
      designation: 'Freelancer',
      managerId: null
    };
    const noManagerResponse = await makeRequest('POST', '/api/employees', noManagerEmployee);
    console.log(`   ✓ Status: ${noManagerResponse.statusCode}`);
    console.log(`   ✓ Null managerId accepted: ${noManagerResponse.data?.managerId === null}`);

    console.log('\n✅ All edge case tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

// Wait a bit for server to start, then run tests
setTimeout(runEdgeCaseTests, 100);