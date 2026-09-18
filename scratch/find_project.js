const fs = require('fs');
const path = require('path');
const data = fs.readFileSync('C:/Users/13162/.gemini/antigravity/brain/1f398e62-525c-4159-856d-f4833d0d53e5/.system_generated/steps/817/output.txt', 'utf8');
const json = JSON.parse(data);
json.projects.forEach(p => {
  console.log('Project ID:', p.name, 'Title:', p.title);
});
