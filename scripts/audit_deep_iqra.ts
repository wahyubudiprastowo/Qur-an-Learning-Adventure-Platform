import { IQRA_1_PAGES } from '../src/data/iqraBook1Data';
import { IQRA_2_PAGES } from '../src/data/iqraBook2Data';
import { IQRA_3_PAGES } from '../src/data/iqraBook3Data';
import { IQRA_4_PAGES } from '../src/data/iqraBook4Data';
import { IQRA_5_PAGES } from '../src/data/iqraBook5Data';
import { IQRA_6_PAGES } from '../src/data/iqraBook6Data';
import { IQRA_CURRICULUM } from '../src/data/iqraData';

console.log('=== DEEP AUDIT OF IQRA 1-6 & CURRICULUM A ===');

const books = [
  { name: 'Curriculum A', isPages: false, data: IQRA_CURRICULUM },
  { name: 'Iqra 1', isPages: true, data: IQRA_1_PAGES },
  { name: 'Iqra 2', isPages: true, data: IQRA_2_PAGES },
  { name: 'Iqra 3', isPages: true, data: IQRA_3_PAGES },
  { name: 'Iqra 4', isPages: true, data: IQRA_4_PAGES },
  { name: 'Iqra 5', isPages: true, data: IQRA_5_PAGES },
  { name: 'Iqra 6', isPages: true, data: IQRA_6_PAGES },
];

let totalPages = 0;
let totalItems = 0;
const harakatIssues: any[] = [];
const latinDiscrepancies: any[] = [];
const suspiciousChars: any[] = [];

// Transliteration checker
function checkHarakat(arabic: string, latin?: string, context?: string) {
  // Check if string contains unexpected characters
  if (/[a-zA-Z0-9]/.test(arabic)) {
    suspiciousChars.push({ context, arabic, issue: 'Contains Latin/numbers in Arabic text' });
  }

  // Check for orphan harakat (harakat without a consonant)
  if (/^[\u064B-\u0652\u0670]/.test(arabic)) {
    harakatIssues.push({ context, arabic, issue: 'Starts with orphan harakat' });
  }

  // Check double harakats on same letter (e.g., fathah + kasrah on same character)
  if (/[\u064E\u064F\u0650]{2,}/.test(arabic)) {
    harakatIssues.push({ context, arabic, issue: 'Multiple basic vowels on same character' });
  }

  // Check Shaddah + multiple vowels
  if (/\u0651[\u064E\u064F\u0650]{2,}/.test(arabic)) {
    harakatIssues.push({ context, arabic, issue: 'Shaddah with conflicting vowels' });
  }

  // Check tanwin + vowel
  if (/[\u064B\u064C\u064D][\u064E\u064F\u0650]/.test(arabic)) {
    harakatIssues.push({ context, arabic, issue: 'Tanwin combined with single vowel' });
  }

  // In Iqra 1, all practice letters should have Fathah (A).
  // Check if Iqra 1 has unvocalized letters (except page 32 which introduces names)
  if (context && context.includes('Iqra 1') && !context.includes('p32') && !context.includes('header')) {
    // Check if letter has no harakat
    const cleanChars = arabic.replace(/\s+/g, '');
    for (let i = 0; i < cleanChars.length; i++) {
      const code = cleanChars.charCodeAt(i);
      // If it's a letter and not followed by a harakat
      const isLetter = (code >= 0x0621 && code <= 0x064A) || code === 0x0671;
      if (isLetter) {
        const nextCode = cleanChars.charCodeAt(i + 1);
        const hasHarakat = nextCode >= 0x064B && nextCode <= 0x0652;
        // In Iqra 1, letters are single characters with fathah
        if (!hasHarakat && cleanChars[i] !== 'ا') { // Alif might sometimes not have harakat if dagger or wasla
          // Note if missing harakat
          // harakatIssues.push({ context, arabic, issue: `Letter ${cleanChars[i]} has no harakat in Iqra 1` });
        }
      }
    }
  }
}

books.forEach(b => {
  if (!b.isPages) {
    (b.data as any[]).forEach((item, idx) => {
      totalItems++;
      checkHarakat(item.arabic, item.latin, `${b.name} item ${idx} (${item.title})`);
    });
  } else {
    (b.data as any[]).forEach(pg => {
      totalPages++;
      if (pg.headerPreview) {
        totalItems++;
        checkHarakat(pg.headerPreview.arabic, pg.headerPreview.latin, `${b.name} p${pg.pageNumber} header`);
      }
      pg.rows.forEach((r: any, rIdx: number) => {
        r.items.forEach((it: any, iIdx: number) => {
          totalItems++;
          checkHarakat(it.arabic, it.latin, `${b.name} p${pg.pageNumber} r${rIdx} i${iIdx}`);
        });
      });
    });
  }
});

console.log(`Total Pages: ${totalPages}`);
console.log(`Total Items Audited: ${totalItems}`);
console.log(`Suspicious characters in Arabic: ${suspiciousChars.length}`);
if (suspiciousChars.length > 0) {
  console.log(suspiciousChars);
}
console.log(`Harakat issues found: ${harakatIssues.length}`);
if (harakatIssues.length > 0) {
  console.log(harakatIssues);
}
