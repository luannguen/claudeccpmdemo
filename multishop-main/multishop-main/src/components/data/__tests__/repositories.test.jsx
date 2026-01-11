/**
 * Repository Unit Tests
 * 
 * Basic tests for product and order repositories
 * Run these to verify repository logic works correctly
 */

import { productRepository } from '../repositories/productRepository';
import { orderRepository } from '../repositories/orderRepository';
import { success, failure, ErrorCodes } from '../types';

// ========== TEST UTILITIES ==========

const testResults = [];

function assertEqual(actual, expected, testName) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  testResults.push({
    name: testName,
    passed,
    actual,
    expected
  });
  return passed;
}

function assertTrue(value, testName) {
  testResults.push({
    name: testName,
    passed: !!value,
    actual: value,
    expected: true
  });
  return !!value;
}

function assertFalse(value, testName) {
  testResults.push({
    name: testName,
    passed: !value,
    actual: value,
    expected: false
  });
  return !value;
}

// ========== PRODUCT REPOSITORY TESTS ==========

/**
 * Test product validation - missing name
 */
export async function testProductCreateValidation_MissingName() {
  const result = await productRepository.createWithValidation({
    category: 'vegetables',
    price: 50000,
    unit: 'kg'
  });
  
  assertFalse(result.success, 'Should fail when name is missing');
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR, 'Should return VALIDATION_ERROR');
  return result;
}

/**
 * Test product validation - missing category
 */
export async function testProductCreateValidation_MissingCategory() {
  const result = await productRepository.createWithValidation({
    name: 'Test Product',
    price: 50000,
    unit: 'kg'
  });
  
  assertFalse(result.success, 'Should fail when category is missing');
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR, 'Should return VALIDATION_ERROR');
  return result;
}

/**
 * Test product validation - invalid price
 */
export async function testProductCreateValidation_InvalidPrice() {
  const result = await productRepository.createWithValidation({
    name: 'Test Product',
    category: 'vegetables',
    price: 0,
    unit: 'kg'
  });
  
  assertFalse(result.success, 'Should fail when price is 0');
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR, 'Should return VALIDATION_ERROR');
  return result;
}

/**
 * Test product list returns Result<T>
 */
export async function testProductList_ReturnsResult() {
  const result = await productRepository.list();
  
  assertTrue(result.hasOwnProperty('success'), 'Should have success property');
  if (result.success) {
    assertTrue(Array.isArray(result.data), 'Data should be array');
  }
  return result;
}

// ========== ORDER REPOSITORY TESTS ==========

/**
 * Test order validation - missing customer name
 */
export async function testOrderCreateValidation_MissingCustomerName() {
  const result = await orderRepository.createWithValidation({
    customer_phone: '0901234567',
    items: [{ product_id: '1', quantity: 1 }]
  });
  
  assertFalse(result.success, 'Should fail when customer_name is missing');
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR, 'Should return VALIDATION_ERROR');
  return result;
}

/**
 * Test order validation - missing phone
 */
export async function testOrderCreateValidation_MissingPhone() {
  const result = await orderRepository.createWithValidation({
    customer_name: 'Test Customer',
    items: [{ product_id: '1', quantity: 1 }]
  });
  
  assertFalse(result.success, 'Should fail when customer_phone is missing');
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR, 'Should return VALIDATION_ERROR');
  return result;
}

/**
 * Test order validation - empty items
 */
export async function testOrderCreateValidation_EmptyItems() {
  const result = await orderRepository.createWithValidation({
    customer_name: 'Test Customer',
    customer_phone: '0901234567',
    items: []
  });
  
  assertFalse(result.success, 'Should fail when items is empty');
  assertEqual(result.code, ErrorCodes.VALIDATION_ERROR, 'Should return VALIDATION_ERROR');
  return result;
}

/**
 * Test order list returns Result<T>
 */
export async function testOrderList_ReturnsResult() {
  const result = await orderRepository.list();
  
  assertTrue(result.hasOwnProperty('success'), 'Should have success property');
  if (result.success) {
    assertTrue(Array.isArray(result.data), 'Data should be array');
  }
  return result;
}

/**
 * Test order stats returns correct structure
 */
export async function testOrderStats_ReturnsStructure() {
  const result = await orderRepository.getStats();
  
  if (result.success) {
    assertTrue(result.data.hasOwnProperty('total'), 'Stats should have total');
    assertTrue(result.data.hasOwnProperty('pending'), 'Stats should have pending');
    assertTrue(result.data.hasOwnProperty('delivered'), 'Stats should have delivered');
  }
  return result;
}

// ========== RUN ALL TESTS ==========

export async function runAllTests() {
  console.log('🧪 Running repository tests...\n');
  
  // Product tests
  await testProductCreateValidation_MissingName();
  await testProductCreateValidation_MissingCategory();
  await testProductCreateValidation_InvalidPrice();
  await testProductList_ReturnsResult();
  
  // Order tests
  await testOrderCreateValidation_MissingCustomerName();
  await testOrderCreateValidation_MissingPhone();
  await testOrderCreateValidation_EmptyItems();
  await testOrderList_ReturnsResult();
  await testOrderStats_ReturnsStructure();
  
  // Summary
  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}`);
      console.log(`    Expected: ${JSON.stringify(t.expected)}`);
      console.log(`    Actual: ${JSON.stringify(t.actual)}`);
    });
  }
  
  return { passed, failed, results: testResults };
}

export default runAllTests;