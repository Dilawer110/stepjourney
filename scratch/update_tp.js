const fs = require('fs');
const path = require('path');

const tpMap = {
  "18": "14.75",
  "27": "22.13",
  "45": "36.89",
  "72": "59.02",
  "108": "88.52",
  "162": "132.79",
  "216": "177.05",
  "225": "184.43",
  "243": "199.18",
  "324": "265.57",
  "360": "295.08",
  "450": "368.85"
};

const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace 	p: XX with 	p: YY
content = content.replace(/tp:\s*(\d+)/g, (match, tpVal) => {
  if (tpMap[tpVal]) {
    return 'tp: ' + tpMap[tpVal];
  }
  return match;
});

// Let's also update the UI text from 'TP: Rs' to 'TP(Ex-GST): Rs' so it's clearer.
content = content.replace(/>TP: Rs \{/g, '>TP(Ex-GST): Rs {');
// In the picker list:
content = content.replace(/>Rs \{p\.tp\} <span/g, '>Rs {p.tp} (Ex-GST) <span');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated TP values');
