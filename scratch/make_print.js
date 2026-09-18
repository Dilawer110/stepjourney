const fs = require('fs');
let html = fs.readFileSync('scratch/invoice_print_stitch.html', 'utf8');

html = html.replace(/class=/g, 'className=');
html = html.replace(/<hr(.*?[^\/])>/g, '<hr />');
html = html.replace(/<img(.*?[^\/])>/g, '<img />');
html = html.replace(/<input(.*?[^\/])>/g, '<input />');
html = html.replace(/<br>/g, '<br />');
html = html.replace(/<!--[\s\S]*?-->/g, '');
html = html.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '');
html = html.replace(/<\/body>[\s\S]*?<\/html>/i, '');
html = html.replace(/onclick="window\.history\.back\(\)"/g, 'onClick={onBack}');
html = html.replace(/onclick="window\.print\(\)"/g, 'onClick={() => window.print()}');
html = html.replace(/colspan/g, 'colSpan');
html = html.replace(/rowspan/g, 'rowSpan');
html = html.replace(/A/g, '-'); // special char
html = html.replace(/o"/g, '?');

html = html.replace(/style="width:\s*([^"]+)"/g, "style={{ width: '\' }}");

html = html.replace(/Al Madina General Store/g, '{customName || outletName}');
html = html.replace(/INV-D0010ORD11608/g, '{invoiceId}');
html = html.replace(/>7,082\.88</, '>{format(order.grossSubtotal)}<');
html = html.replace(/>-\s*416\.10</, '>- {format(order.tradeDisc + order.slabDisc)}<');
html = html.replace(/>1,466\.70</, '>{format(order.gst)}<');
html = html.replace(/>8,133\.48</, '>{format(order.netBeforeGST + order.gst)}<');
html = html.replace(/>203\.34</, '>{format(order.advTax)}<');
html = html.replace(/>Rs\.\s*8,336\.82</, '>{rs(order.totalPayable)}<');
html = html.replace(/\(2\.50%\)/, '({taxReg === "unregistered" ? "2.5%" : "1%"})');

const tableRegex = /<tbody className="divide-y divide-slate-100 text-slate-700 font-medium">[\s\S]*?<\/tbody>/;
const dynamicTable = "<tbody className=\"divide-y divide-slate-100 text-slate-700 font-medium\">" +
  "{order.lineItems.map((item, i) => (" +
  "  <tr key={item.id}>" +
  "    <td className=\"p-1 pl-2 text-[8.5px] border-r border-slate-300\">" +
  "      <div className=\"flex flex-col\">" +
  "        <span className=\"font-bold text-slate-900\">{item.product.name}</span>" +
  "        <span className=\"text-slate-500 font-mono text-[7.5px]\">{item.product.code}</span>" +
  "      </div>" +
  "    </td>" +
  "    <td className=\"p-1 text-center font-mono num border-r border-slate-300\">{item.qty} {item.uom}</td>" +
  "    <td className=\"p-1 text-right font-mono num border-r border-slate-300\">{item.product.tp.toFixed(2)}</td>" +
  "    <td className=\"p-1 text-center font-mono num border-r border-slate-300 text-slate-400\">0</td>" +
  "    <td className=\"p-1 text-right font-mono num font-semibold border-r border-slate-300\">{(item.product.tp * item.calc.units).toFixed(2)}</td>" +
  "    <td className=\"p-0.5 pr-1 text-right font-mono num text-emerald-700 border-r border-slate-300 bg-slate-100/50\">{item.calc.tradeDisc.toFixed(2)}</td>" +
  "    <td className=\"p-0.5 text-center font-mono num text-[8px] border-r border-slate-300 bg-slate-100/50\">{item.calc.channelOfferPct}%</td>" +
  "    <td className=\"p-0.5 pr-1 text-right font-mono num text-emerald-700 border-r border-slate-300\">{item.calc.slabDisc.toFixed(2)}</td>" +
  "    <td className=\"p-0.5 text-center font-mono num text-[8px] border-r border-slate-300\">{order.activeSlab.pct}%</td>" +
  "    <td className=\"p-0.5 pr-1 text-right font-mono num text-slate-400 border-r border-slate-300 bg-slate-50\">0.00</td>" +
  "    <td className=\"p-0.5 text-center font-mono num text-[8px] text-slate-400 border-r border-slate-300 bg-slate-50\">0%</td>" +
  "    <td className=\"p-1 pr-1.5 text-right font-mono num font-bold text-slate-800 border-r border-slate-300 bg-slate-50/50\">{item.calc.netBeforeGST.toFixed(2)}</td>" +
  "    <td className=\"p-0.5 pr-1 text-right font-mono num border-r border-slate-300\">{item.calc.gst.toFixed(2)}</td>" +
  "    <td className=\"p-0.5 text-center font-mono num text-[8px] border-r border-slate-300\">{taxReg === 'unregistered' ? '22%' : '18%'}</td>" +
  "    <td className=\"p-1 pr-2 text-right font-mono num font-extrabold text-slate-900 bg-slate-100/50\">{(item.calc.netBeforeGST + item.calc.gst).toFixed(2)}</td>" +
  "  </tr>" +
  "))}" +
  "</tbody>";

html = html.replace(tableRegex, dynamicTable);

const promoRegex = /<table className="w-full text-\[9px\] text-left">[\s\S]*?<\/table>/;
const dynamicPromo = "<table className=\"w-full text-[9px] text-left\">" +
  "<thead>" +
  "  <tr className=\"text-slate-500 uppercase tracking-wider border-b border-slate-200\">" +
  "    <th className=\"pb-1\">Discount Summary</th>" +
  "    <th className=\"pb-1 text-right\">Amount</th>" +
  "    <th className=\"pb-1 text-center\">%</th>" +
  "  </tr>" +
  "</thead>" +
  "<tbody className=\"divide-y divide-slate-100 text-slate-700 font-medium\">" +
  "  {order.tradeDisc > 0 && <tr>" +
  "    <td className=\"py-1 pr-1 font-semibold text-slate-900\">Trade Offer - {channel}</td>" +
  "    <td className=\"py-1 text-right num\">{format(order.tradeDisc)}</td>" +
  "    <td className=\"py-1 text-center num text-slate-400\">-</td>" +
  "  </tr>}" +
  "  {order.slabDisc > 0 && <tr>" +
  "    <td className=\"py-1 pr-1 font-semibold text-slate-900\">Slab Discount - {tier}</td>" +
  "    <td className=\"py-1 text-right num\">{format(order.slabDisc)}</td>" +
  "    <td className=\"py-1 text-center num text-slate-400\">{order.activeSlab.pct}%</td>" +
  "  </tr>}" +
  "</tbody>" +
  "</table>";

html = html.replace(promoRegex, dynamicPromo);
html = html.replace(/>Rs\.\s*416\.06</, ">{rs(order.tradeDisc + order.slabDisc)}<");


const componentStr = "import React from 'react';\n" +
"\n" +
"export default function PrintInvoice({ order, invoiceId, outletName, customName, channel, tier, taxReg, onBack }) {\n" +
"  const rs = (num) => 'Rs. ' + num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n" +
"  const format = (num) => num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n" +
"  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });\n" +
"\n" +
"  return (\n" +
"    <div className=\"min-h-screen py-6 px-4 flex flex-col items-center justify-start text-slate-800 bg-slate-900 print:bg-white print:p-0 font-sans\">\n" +
"      <style dangerouslySetInnerHTML={{ __html: \n" +
"        @media print {\n" +
"          @page { size: A4 landscape; margin: 8mm 10mm; }\n" +
"          body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }\n" +
"          .no-print { display: none !important; }\n" +
"          .a4-landscape-page { width: 100% !important; min-height: auto !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }\n" +
"          .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }\n" +
"        }\n" +
"        .a4-landscape-page {\n" +
"          width: 297mm; min-height: 210mm; background: #ffffff;\n" +
"          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.45);\n" +
"          position: relative; box-sizing: border-box; padding: 10mm 12mm;\n" +
"        }\n" +
"        .num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }\n" +
"      }} />\n" +
"      " + html + "\n" +
"    </div>\n" +
"  );\n" +
"}\n";

fs.writeFileSync('components/PrintInvoice.tsx', componentStr);
console.log('Done Building PrintInvoice');
