const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Revert landedUnit to include GST & Adv Tax
content = content.replace(
  'const landedUnit = netBeforeGST / units',
  'const landedUnit = total / units'
);

// 2. Update display strings in Review and Cart
const oldStringRegex = /Trade \{calc\.channelOfferPct\}% \+ Slab \{.*\.activeSlab\.pct\}% ? Landed Rs \{calc\.landedUnit\.toFixed\(2\)\}\/unit, Rs \{calc\.landedDzn\.toFixed\(2\)\}\/Dzn, Rs \{calc\.landedCtn\.toFixed\(2\)\}\/Ctn/g;

content = content.replace(oldStringRegex, (match) => {
  if (match.includes('order.activeSlab')) {
    return 'Trade {calc.channelOfferPct}% + Slab {order.activeSlab.pct}% ? LC Unit Cst: {calc.landedUnit.toFixed(2)}, Dzn Cost: {calc.landedDzn.toFixed(2)}, Ctn Cst: {calc.landedCtn.toFixed(2)}';
  } else {
    return 'Trade {calc.channelOfferPct}% + Slab {activeSlab.pct}% ? LC Unit Cst: {calc.landedUnit.toFixed(2)}, Dzn Cost: {calc.landedDzn.toFixed(2)}, Ctn Cst: {calc.landedCtn.toFixed(2)}';
  }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated Landed Cost logic and UI strings');
