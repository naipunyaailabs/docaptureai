// lib/excel-utils.test.ts
// Simple test file for excel-utils functions

import { convertJsonToExcelFormat, processFieldExtractionForExcel, formatFieldName, formatFieldValue } from './excel-utils';

// Simple test function
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error}`);
  }
}

// Simple assertion functions
function expect(actual: any) {
  return {
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toHaveLength: (expected: number) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual.length}`);
      }
    }
  };
}

console.log('Running tests for excel-utils...');

// Test convertJsonToExcelFormat
test('convertJsonToExcelFormat should handle null/undefined data', () => {
  expect(convertJsonToExcelFormat(null)).toEqual([]);
  expect(convertJsonToExcelFormat(undefined)).toEqual([]);
});

test('convertJsonToExcelFormat should handle array data', () => {
  const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
  expect(convertJsonToExcelFormat(data)).toEqual(data);
});

test('convertJsonToExcelFormat should handle primitive data', () => {
  expect(convertJsonToExcelFormat('test')).toEqual([{ value: 'test' }]);
  expect(convertJsonToExcelFormat(42)).toEqual([{ value: '42' }]);
});

test('convertJsonToExcelFormat should handle simple objects', () => {
  const data = { name: 'John', age: 30 };
  const result = convertJsonToExcelFormat(data);
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({ name: 'John', age: 30 });
});

// Test processFieldExtractionForExcel
test('processFieldExtractionForExcel should handle array data', () => {
  const data = [{ field: 'Name', value: 'John' }];
  expect(processFieldExtractionForExcel(data)).toEqual(data);
});

test('processFieldExtractionForExcel should convert objects to field-value pairs', () => {
  const data = { name: 'John', age: 30 };
  const result = processFieldExtractionForExcel(data);
  expect(result).toEqual([
    { field: 'Name', value: 'John' },
    { field: 'Age', value: '30' }
  ]);
});

test('processFieldExtractionForExcel should handle nested extracted data', () => {
  const data = { extracted: { name: 'John', age: 30 } };
  const result = processFieldExtractionForExcel(data);
  expect(result).toEqual([
    { field: 'Name', value: 'John' },
    { field: 'Age', value: '30' }
  ]);
});

// Test formatFieldName
test('formatFieldName should convert camelCase to Title Case', () => {
  expect(formatFieldName('firstName')).toBe('First Name');
  expect(formatFieldName('jobTitle')).toBe('Job Title');
  expect(formatFieldName('requiredFields')).toBe('Required Fields');
});

test('formatFieldName should handle single words', () => {
  expect(formatFieldName('name')).toBe('Name');
  expect(formatFieldName('age')).toBe('Age');
});

// Test formatFieldValue
test('formatFieldValue should handle null/undefined values', () => {
  expect(formatFieldValue(null)).toBe('');
  expect(formatFieldValue(undefined)).toBe('');
});

test('formatFieldValue should handle arrays', () => {
  expect(formatFieldValue(['a', 'b', 'c'])).toBe('a, b, c');
});

test('formatFieldValue should handle objects', () => {
  const obj = { name: 'John', age: 30 };
  expect(formatFieldValue(obj)).toBe(JSON.stringify(obj, null, 2));
});

test('formatFieldValue should handle primitives', () => {
  expect(formatFieldValue('test')).toBe('test');
  expect(formatFieldValue(42)).toBe('42');
  expect(formatFieldValue(true)).toBe('true');
});

console.log('All tests completed!');