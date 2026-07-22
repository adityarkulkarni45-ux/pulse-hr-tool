// db.test.js
// Simple unit tests for db.js utilities
// Run with: node db.test.js

const db = require('./db');
const fs = require('fs');
const path = require('path');

const TEST_COLLECTION = 'test_collection';
const TEST_DATA_PATH = path.join(__dirname, 'data', `${TEST_COLLECTION}.json`);

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, message) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual: ${JSON.stringify(actual)}`);
    testsFailed++;
  }
}

function cleanup() {
  if (fs.existsSync(TEST_DATA_PATH)) {
    fs.unlinkSync(TEST_DATA_PATH);
  }
}

// Run tests
console.log('Running db.js unit tests...\n');

// Test 1: readCollection returns empty array for missing file
cleanup();
const emptyResult = db.readCollection(TEST_COLLECTION);
assertEquals(emptyResult, [], 'readCollection returns empty array for missing file');

// Test 2: writeCollection creates file with pretty-printed JSON
const testData = [
  { id: 'E001', name: 'John Doe' },
  { id: 'E002', name: 'Jane Smith' }
];
db.writeCollection(TEST_COLLECTION, testData);
assert(fs.existsSync(TEST_DATA_PATH), 'writeCollection creates file');

const fileContent = fs.readFileSync(TEST_DATA_PATH, 'utf-8');
const hasProperIndent = fileContent.includes('  ');
assert(hasProperIndent, 'writeCollection uses 2-space indentation');

// Test 3: readCollection returns data from file
const readData = db.readCollection(TEST_COLLECTION);
assertEquals(readData, testData, 'readCollection returns correct data');

// Test 4: nextId generates sequential IDs with prefix
const id1 = db.nextId(TEST_COLLECTION, 'E');
assertEquals(id1, 'E003', 'nextId generates E003 when max is E002');

const id2 = db.nextId(TEST_COLLECTION, 'L');
assertEquals(id2, 'L001', 'nextId generates L001 for different prefix');

// Test 5: nextId handles empty collection
cleanup();
const id3 = db.nextId(TEST_COLLECTION, 'E');
assertEquals(id3, 'E001', 'nextId generates E001 for empty collection');

// Test 6: nextId pads numbers to 3 digits
const largeData = [
  { id: 'E099', name: 'Test' }
];
db.writeCollection(TEST_COLLECTION, largeData);
const id4 = db.nextId(TEST_COLLECTION, 'E');
assertEquals(id4, 'E100', 'nextId generates E100 when max is E099');

// Test 7: filePath returns absolute path
const expectedPath = path.join(__dirname, 'data', `${TEST_COLLECTION}.json`);
const actualPath = db.filePath(TEST_COLLECTION);
assertEquals(actualPath, expectedPath, 'filePath returns correct absolute path');

// Test 8: readCollection handles malformed JSON gracefully
fs.writeFileSync(TEST_DATA_PATH, '', 'utf-8');
const emptyFileResult = db.readCollection(TEST_COLLECTION);
assertEquals(emptyFileResult, [], 'readCollection returns empty array for empty file');

// Cleanup
cleanup();

// Summary
console.log(`\n========================================`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`========================================`);

if (testsFailed > 0) {
  process.exit(1);
}
