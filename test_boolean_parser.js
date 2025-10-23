// Quick test for the boolean search parser
const testQuery = '+Keywords:FinTech, +Job title:("UX Designer"), +Job occupation:((Product Designer) OR (User Experience Designer)), +Company:("Careem" OR "Jahez" OR "Deliveroo" OR "The Chefz" OR "Uber" OR "talabat"), +Job title time scope:Current or past, +Company time scope:Current or past';

// Import would go here in actual TypeScript
// import BooleanSearchParser from './src/services/booleanSearchParser';

console.log('Testing query validation...');
console.log('Query:', testQuery);

// Mock validation test (in actual implementation this would use the real parser)
const validFields = ['Keywords', 'Job title', 'Job occupation', 'Location', 'Job title time scope', 'Company', 'Company time scope'];
const fieldPattern = /\+([^:]+):/g;
let fieldMatch;
let unknownFields = [];

while ((fieldMatch = fieldPattern.exec(testQuery)) !== null) {
  const fieldName = fieldMatch[1].trim();
  if (!validFields.some(valid => fieldName.toLowerCase().includes(valid.toLowerCase()))) {
    unknownFields.push(fieldName);
  }
}

if (unknownFields.length === 0) {
  console.log('✅ Query validation passed - all fields are supported!');
} else {
  console.log('❌ Unknown fields found:', unknownFields);
}

console.log('\nSupported fields:');
validFields.forEach(field => console.log(`  - ${field}`));