const fs = require('fs');
let html = fs.readFileSync('scratch/invoice_print_stitch.html', 'utf8');

// Basic html to jsx
html = html.replace(/class=/g, 'className=');
html = html.replace(/<!--(.*?)-->/g, '{/*  */}');
html = html.replace(/onclick=/g, 'onClick=');
html = html.replace(/<hr(.*?[^\/])>/g, '<hr />');
html = html.replace(/<br(.*?[^\/])>/g, '<br />');
html = html.replace(/<img(.*?[^\/])>/g, '<img />');
html = html.replace(/<input(.*?[^\/])>/g, '<input />');
html = html.replace(/style="([^"]*)"/g, (match, p1) => {
  // Very hacky style to object
  let props = p1.split(';').filter(Boolean).map(prop => {
    let parts = prop.split(':');
    if(parts.length < 2) return '';
    let key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
    let value = parts[1].trim();
    return \\: '\'\;
  }).filter(Boolean).join(', ');
  return \style={{\}}\;
});

fs.writeFileSync('scratch/invoice_print_stitch.jsx', html);
console.log('Done');
