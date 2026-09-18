const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the specific sub-string
const targetStr = 'LC Unit Cst: {calc.landedUnit.toFixed(2)}, Dzn Cost: {calc.landedDzn.toFixed(2)}, Ctn Cst: {calc.landedCtn.toFixed(2)}';
content = content.split(targetStr).join('');

// Also remove any dangling '?  ' or similar
content = content.replace(/?\s*<\/div>/g, '</div>');
content = content.replace(/?\s*$/gm, '');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully cleaned up old strings completely');
