const fs = require('fs');
const data = fs.readFileSync('C:/Users/13162/.gemini/antigravity/brain/1f398e62-525c-4159-856d-f4833d0d53e5/.system_generated/steps/1026/output.txt', 'utf8');
const json = JSON.parse(data);
json.screens.forEach(s => {
  console.log('Screen ID:', s.name, 'Title:', s.title);
});
