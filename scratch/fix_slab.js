const fs = require('fs');
let code = fs.readFileSync('components/PrintInvoice.tsx', 'utf8');
code = code.replace(/order\.activeSlab\.pct/g, '(order.activeSlab?.pct || 0)');
fs.writeFileSync('components/PrintInvoice.tsx', code);
