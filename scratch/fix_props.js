const fs = require('fs');
let code = fs.readFileSync('components/PrintInvoice.tsx', 'utf8');

code = code.replace(/order\.tradeDisc/g, 'order.totalTradeDisc');
code = code.replace(/order\.slabDisc/g, 'order.totalSlabDisc');
code = code.replace(/order\.gst/g, 'order.totalGST');
code = code.replace(/order\.netBeforeGST/g, 'order.totalNetBeforeGST');
code = code.replace(/order\.advTax/g, 'order.totalAdvTax');

code = code.replace(/const rs = \(num: number\) => 'Rs\. ' \+ num\.toLocaleString/g, "const rs = (num: number) => 'Rs. ' + (num || 0).toLocaleString");
code = code.replace(/const format = \(num: number\) => num\.toLocaleString/g, "const format = (num: number) => (num || 0).toLocaleString");

fs.writeFileSync('components/PrintInvoice.tsx', code);
console.log('Fixed property names in PrintInvoice.tsx');
