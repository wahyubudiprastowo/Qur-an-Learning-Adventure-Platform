const fs = require('fs');
const path = require('path');

const books = [
  { file: 'src/data/iqraBook1Data.ts', name: 'Iqra 1' },
  { file: 'src/data/iqraBook2Data.ts', name: 'Iqra 2' },
  { file: 'src/data/iqraBook3Data.ts', name: 'Iqra 3' },
  { file: 'src/data/iqraBook4Data.ts', name: 'Iqra 4' },
  { file: 'src/data/iqraBook5Data.ts', name: 'Iqra 5' },
  { file: 'src/data/iqraBook6Data.ts', name: 'Iqra 6' },
];

let totalPages = 0;
let totalItems = 0;
let anomalies = [];

for (const b of books) {
  const content = fs.readFileSync(path.resolve(b.file), 'utf8');
  
  // Extract pages
  const pageMatches = content.match(/pageNumber:\s*(\d+)/g) || [];
  totalPages += pageMatches.length;

  // Extract all arabic items
  const itemMatches = [...content.matchAll(/arabic:\s*['"`]([^'"`]+)['"`]/g)];
  totalItems += itemMatches.length;

  for (const m of itemMatches) {
    const text = m[1];
    // Check Latin letters in arabic string (unless it is an explicit rule note)
    if (/[a-zA-Z]/.test(text)) {
      anomalies.push({ book: b.name, type: 'latin_in_arabic', text });
    }
    // Check for weird unicode replacement character
    if (text.includes('\uFFFD')) {
      anomalies.push({ book: b.name, type: 'replacement_char', text });
    }
    // Check double harakat errors (e.g. two consecutive fathahs \u064E\u064E)
    if (/[\u064B-\u0652]{3,}/.test(text)) {
      anomalies.push({ book: b.name, type: 'stacked_harakat_excess', text });
    }
  }

  // Check latin items
  const latinMatches = [...content.matchAll(/latin:\s*['"`]([^'"`]*)['"`]/g)];
  for (const lm of latinMatches) {
    const lat = lm[1];
    if (lat && lat.includes('undefined')) {
      anomalies.push({ book: b.name, type: 'undefined_latin', text: lat });
    }
  }
}

console.log('--- AUDIT RESULT ---');
console.log('Total Pages across Books 1-6:', totalPages);
console.log('Total Arabic Items across Books 1-6:', totalItems);
console.log('Anomalies Count:', anomalies.length);
if (anomalies.length > 0) {
  console.log('Anomalies detail:');
  console.log(JSON.stringify(anomalies, null, 2));
} else {
  console.log('No syntax or character corruption anomalies found!');
}
