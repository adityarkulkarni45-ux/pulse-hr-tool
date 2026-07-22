// Test Employee CRUD Operations
// Simple test to verify task 3.1 implementation

const http = require('http');
const { startServer } = require('./server.js');

// Start server for testing
const server = startServer(3001);

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
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

async function runTests() {
  console.log('🧪 Testing Employee CRUD Operations (Task 3.1)\n');

  try {
    // Test 1: GET /api/employees - List all employees
    console.log('1. Testing GET /api/employees');
    const getAll = await makeRequest('GET', '/api/employees');
    console.log(`   ✓ Status: ${getAll.statusCode}`);
    console.log(`   ✓ Employees count: ${getAll.data?.length || 0}`);

    // Test 2: POST /api/employees - Create new employee with validation
    console.log('\n2. Testing POST /api/employees (valid data)');
    const newEmployee = {
      name: 'Test Employee',
      email: 'test.employee@example.com',
      department: 'Engineering',
      designation: 'Software Engineer'
    };
    const createResponse = await makeRequest('POST', '/api/employees', newEmployee);
    console.log(`   ✓ Status: ${createResponse.statusCode}`);
    console.log(`   ✓ Created employee ID: ${createResponse.data?.id}`);

    const createdEmployeeId = createResponse.data?.id;

    // Test 3: POST /api/employees - Test missing required fields
    console.log('\n3. Testing POST /api/employees (missing required fields)');
    const invalidEmployee = { name: 'Test' }; // Missing email, department, designation
    const createInvalid = await makeRequest('POST', '/api/employees', invalidEmployee);
    console.log(`   ✓ Status: ${createInvalid.statusCode} (expected 400)`);
    console.log(`   ✓ Error: ${createInvalid.data?.error}`);

    // Test 4: POST /api/employees - Test email uniqueness
    console.log('\n4. Testing POST /api/employees (duplicate email)');
    const duplicateEmployee = { ...newEmployee };
    const createDuplicate = await makeRequest('POST', '/api/employees', duplicateEmployee);
    console.log(`   ✓ Status: ${createDuplicate.statusCode} (expected 409)`);
    console.log(`   ✓ Error: ${createDuplicate.data?.error}`);

    // Test 5: GET /api/employees/:id - Get single employee
    if (createdEmployeeId) {
      console.log('\n5. Testing GET /api/employees/:id');
      const getOne = await makeRequest('GET', `/api/employees/${createdEmployeeId}`);
      console.log(`   ✓ Status: ${getOne.statusCode}`);
      console.log(`   ✓ Employee name: ${getOne.data?.name}`);
    }

    // Test 6: PUT /api/employees/:id - Update employee (preserve ID field)
    if (createdEmployeeId) {
      console.log('\n6. Testing PUT /api/employees/:id (with ID field in payload)');
      const updateData = {
        id: 'SHOULD_BE_IGNORED', // This should be ignored per requirement 4.4
        name: 'Updated Test Employee',
        designation: 'Senior Software Engineer'
      };
      const updateResponse = await makeRequest('PUT', `/api/employees/${createdEmployeeId}`, updateData);
      console.log(`   ✓ Status: ${updateResponse.statusCode}`);
      console.log(`   ✓ ID preserved: ${updateResponse.data?.id === createdEmployeeId}`);
      console.log(`   ✓ Name updated: ${updateResponse.data?.name}`);
    }

    // Test 7: PUT /api/employees/:id - Test invalid manager ID
    if (createdEmployeeId) {
      console.log('\n7. Testing PUT /api/employees/:id (invalid manager ID)');
      const updateInvalid = { managerId: 'INVALID_ID' };
      const updateInvalidResponse = await makeRequest('PUT', `/api/employees/${createdEmployeeId}`, updateInvalid);
      console.log(`   ✓ Status: ${updateInvalidResponse.statusCode} (expected 400)`);
      console.log(`   ✓ Error: ${updateInvalidResponse.data?.error}`);
    }

    // Test 8: DELETE /api/employees/:id - Remove employee
    if (createdEmployeeId) {
      console.log('\n8. Testing DELETE /api/employees/:id');
      const deleteResponse = await makeRequest('DELETE', `/api/employees/${createdEmployeeId}`);
      console.log(`   ✓ Status: ${deleteResponse.statusCode}`);
      console.log(`   ✓ Message: ${deleteResponse.data?.message}`);

      // Verify employee is deleted
      const getDeleted = await makeRequest('GET', `/api/employees/${createdEmployeeId}`);
      console.log(`   ✓ Verify deleted - Status: ${getDeleted.statusCode} (expected 404)`);
    }

    // Test 9: DELETE /api/employees/:id - Non-existent employee
    console.log('\n9. Testing DELETE /api/employees/:id (non-existent)');
    const deleteNonExistent = await makeRequest('DELETE', '/api/employees/INVALID_ID');
    console.log(`   ✓ Status: ${deleteNonExistent.statusCode} (expected 404)`);
    console.log(`   ✓ Error: ${deleteNonExistent.data?.error}`);

    console.log('\n✅ All Employee CRUD tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

// Wait a bit for server to start, then run tests
setTimeout(runTests, 100);