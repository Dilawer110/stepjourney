const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/Landed Rs \{calc\.landedUnit\.toFixed\(2\)\}\/unit, Rs \{calc\.landedDzn\.toFixed\(2\)\}\/Dzn, Rs \{calc\.landedCtn\.toFixed\(2\)\}\/Ctn/g, 'LC Unit Cst: {calc.landedUnit.toFixed(2)}, Dzn Cost: {calc.landedDzn.toFixed(2)}, Ctn Cst: {calc.landedCtn.toFixed(2)}');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated Landed Cost UI strings');
