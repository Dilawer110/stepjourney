const fs = require('fs');

let html = fs.readFileSync('scratch/invoice_print_stitch.html', 'utf8');

// Replace class with className
html = html.replace(/class=/g, 'className=');

// Fix self-closing tags
html = html.replace(/<hr(.*?[^\/])>/g, '<hr />');
html = html.replace(/<img(.*?[^\/])>/g, '<img />');
html = html.replace(/<input(.*?[^\/])>/g, '<input />');
html = html.replace(/<br>/g, '<br />');

// Remove comments
html = html.replace(/<!--[\s\S]*?-->/g, '');

// Isolate main component
html = html.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '');
html = html.replace(/<\/body>[\s\S]*?<\/html>/i, '');

// Fix onClick
html = html.replace(/onclick="window\.history\.back\(\)"/g, 'onClick={onBack}');
html = html.replace(/onclick="window\.print\(\)"/g, 'onClick={() => window.print()}');

// Fix style
html = html.replace(/style="([^"]*)"/g, (match, p1) => {
  let props = p1.split(';').filter(Boolean).map(prop => {
    let parts = prop.split(':');
    if(parts.length < 2) return '';
    let key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
    let value = parts[1].trim();
    return \\: '\'\;
  }).filter(Boolean).join(', ');
  return \style={{\}}\;
});

// Fix weird characters
html = html.replace(/A/g, '·');
html = html.replace(/o"/g, '?');
html = html.replace(/colspan/g, 'colSpan');
html = html.replace(/rowspan/g, 'rowSpan');

// Now, we inject dynamic variables
// We'll replace the static table body with a map over order.lineItems
const tableRegex = /<tbody className="divide-y divide-slate-100 text-slate-700 font-medium">[\s\S]*?<\/tbody>/;
const dynamicTable = \<tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {order.lineItems.map((item, i) => (
                  <tr key={item.id}>
                    <td className="p-1 pl-2 text-[8.5px] border-r border-slate-300">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.product.name}</span>
                        <span className="text-slate-500 font-mono text-[7.5px]">{item.product.code}</span>
                      </div>
                    </td>
                    <td className="p-1 text-center font-mono num border-r border-slate-300">{item.qty} {item.uom}</td>
                    <td className="p-1 text-right font-mono num border-r border-slate-300">{item.product.tp.toFixed(2)}</td>
                    <td className="p-1 text-center font-mono num border-r border-slate-300 text-slate-400">0</td>
                    <td className="p-1 text-right font-mono num font-semibold border-r border-slate-300">{(item.product.tp * item.calc.units).toFixed(2)}</td>
                    <td className="p-0.5 pr-1 text-right font-mono num text-emerald-700 border-r border-slate-300 bg-slate-100/50">{item.calc.tradeDisc.toFixed(2)}</td>
                    <td className="p-0.5 text-center font-mono num text-[8px] border-r border-slate-300 bg-slate-100/50">{item.calc.channelOfferPct}%</td>
                    <td className="p-0.5 pr-1 text-right font-mono num text-emerald-700 border-r border-slate-300">{item.calc.slabDisc.toFixed(2)}</td>
                    <td className="p-0.5 text-center font-mono num text-[8px] border-r border-slate-300">{order.activeSlab.pct}%</td>
                    <td className="p-0.5 pr-1 text-right font-mono num text-slate-400 border-r border-slate-300 bg-slate-50">0.00</td>
                    <td className="p-0.5 text-center font-mono num text-[8px] text-slate-400 border-r border-slate-300 bg-slate-50">0%</td>
                    <td className="p-1 pr-1.5 text-right font-mono num font-bold text-slate-800 border-r border-slate-300 bg-slate-50/50">{item.calc.netBeforeGST.toFixed(2)}</td>
                    <td className="p-0.5 pr-1 text-right font-mono num border-r border-slate-300">{item.calc.gst.toFixed(2)}</td>
                    <td className="p-0.5 text-center font-mono num text-[8px] border-r border-slate-300">{taxReg === 'unregistered' ? '22%' : '18%'}</td>
                    <td className="p-1 pr-2 text-right font-mono num font-extrabold text-slate-900 bg-slate-100/50">{(item.calc.netBeforeGST + item.calc.gst).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>\;

html = html.replace(tableRegex, dynamicTable);

// We need to inject variables for totals, invoiceId, etc.
// Replace invoice ID
html = html.replace(/INV-D0010ORD11608/g, '{invoiceId}');
// Replace Customer Name
html = html.replace(/Al Madina General Store/g, '{customName || outletName}');

const componentString = \import React from 'react';

export default function PrintInvoice({ order, invoiceId, outletName, customName, channel, tier, taxReg, onBack }) {
  const rs = (num) => 'Rs. ' + num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const format = (num) => num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen py-6 px-4 flex flex-col items-center justify-start text-slate-800 bg-slate-900 print:bg-white print:p-0 font-sans">
      <style dangerouslySetInnerHTML={{ __html: \\\
        @media print {
          @page { size: A4 landscape; margin: 8mm 10mm; }
          body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .a4-landscape-page { width: 100% !important; min-height: auto !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
        .a4-landscape-page {
          width: 297mm; min-height: 210mm; background: #ffffff;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.45);
          position: relative; box-sizing: border-box; padding: 10mm 12mm;
        }
        .num { font-family: monospace; font-variant-numeric: tabular-nums; }
      \\\}} />
      \
    </div>
  );
}
\;

fs.writeFileSync('components/PrintInvoice.tsx', componentString);
console.log('Component Created');
