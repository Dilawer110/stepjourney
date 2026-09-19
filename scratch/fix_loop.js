const fs = require('fs');
let code = fs.readFileSync('components/PrintInvoice.tsx', 'utf8');

code = code.replace(/\{order\.lineItems\.map\(\(item: any\) => \(/g, '{order.lineItems.map(({ item, calc }: any) => (');

// Now, replace item.calc with calc since we destructured it
code = code.replace(/item\.calc/g, 'calc');

fs.writeFileSync('components/PrintInvoice.tsx', code);
console.log('Fixed item loop structure');
