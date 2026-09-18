const https = require('https');
const fs = require('fs');

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YmM2NDU4YzJlMTEwNDRmNmNhZTY1MDBiNWZlEgsSBxDzyJuVggQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTI5NzI1MDkwOTUwNTIwMjAxMw&filename=&opi=89354086";

https.get(url, (res) => {
  const file = fs.createWriteStream('scratch/invoice_print_stitch.html');
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
