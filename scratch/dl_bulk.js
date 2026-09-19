const https = require('https');
const fs = require('fs');

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YmNkODNiNTNmZTIwMjNiYzA1MmEwMWUwMTE2EgsSBxDzyJuVggQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTI5NzI1MDkwOTUwNTIwMjAxMw&filename=&opi=89354086";

https.get(url, (res) => {
  const file = fs.createWriteStream('scratch/bulk_print.html');
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded bulk HTML');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
