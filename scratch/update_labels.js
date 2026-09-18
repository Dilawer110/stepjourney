const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/TP: Rs/g, 'TP(Ex-GST): Rs');
content = content.replace(/Trade Rate<\/span>/g, 'Trade Rate (Ex-GST)</span>');

fs.writeFileSync(filePath, content, 'utf-8');
