const fs = require('fs');

let html = fs.readFileSync('scratch/invoice_print_stitch.html', 'utf8');

// Replace class with className
html = html.replace(/class=/g, 'className=');

// Replace standard HTML comments with JSX comments
html = html.replace(/<!--(.*?)-->/g, ''); // just remove them to be safe

// Fix self-closing tags
html = html.replace(/<hr(.*?[^\/])>/g, '<hr />');
html = html.replace(/<img(.*?[^\/])>/g, '<img />');
html = html.replace(/<input(.*?[^\/])>/g, '<input />');
html = html.replace(/<br>/g, '<br />');

// Remove doctype, html, head, body tags to isolate main component
html = html.replace(/<!DOCTYPE html>/i, '');
html = html.replace(/<html[^>]*>/i, '');
html = html.replace(/<\/html>/i, '');
html = html.replace(/<head>[\s\S]*?<\/head>/i, '');
html = html.replace(/<body[^>]*>/i, '<div className="min-h-screen py-6 px-4 flex flex-col items-center justify-start text-slate-800 bg-[#0b1523] print:bg-white print:p-0">');
html = html.replace(/<\/body>/i, '</div>');

// Write out the raw JSX structure to check
fs.writeFileSync('scratch/PrintInvoiceTemplate.jsx', html);
