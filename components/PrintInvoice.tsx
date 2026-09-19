import React from 'react';

export default function PrintInvoice({ order, invoiceId, outletName, customName, channel, tier, taxReg, onBack }: any) {
  const rs = (num: number) => 'Rs. ' + (num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const format = (num: number) => (num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen py-6 px-4 flex flex-col items-center justify-start text-slate-800 bg-slate-900 print:bg-white print:p-0 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
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
        .num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
        .border-print-dark { border: 1.5px solid #0f172a; }
      `}} />
      
      {/* Top Preview Toolbar */}
      <header className="no-print w-full max-w-[297mm] mb-5 flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-5 py-3 shadow-xl text-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">
            &larr; Back to Invoice
          </button>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Invoice Print Preview
              <span className="text-[11px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{invoiceId}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition ring-2 ring-emerald-400/30">
            Print / Save PDF
          </button>
        </div>
      </header>

      {/* Printable Canvas */}
      <main className="a4-landscape-page flex flex-col justify-between text-[11px] leading-tight select-text print-break-inside-avoid">
        <div>
          {/* Header */}
          <div className="relative pb-2 border-b-2 border-slate-900 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-slate-700">B</div>
              <div>
                <div className="text-[13px] font-extrabold text-[#0f294a] uppercase tracking-wider">Bunny's Quality Foods (Pvt) Ltd.</div>
                <div className="text-[9.5px] text-slate-500 font-medium">Snacks Division &middot; Commercial Sales Invoice</div>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center">
              <h2 className="text-base font-extrabold uppercase tracking-widest text-[#0f294a] border-b border-slate-800 pb-0.5 px-4">SNACKS INVOICE</h2>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <div className="flex items-center gap-2"><span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Invoice No:</span> <span className="font-mono font-bold text-sm text-slate-900">{invoiceId}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Date:</span> <span className="font-mono font-semibold text-xs text-slate-800">{today}</span></div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-3 flex gap-4">
            <div className="flex-1 border border-slate-300 rounded p-2 bg-slate-50 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Billed To</div>
              <div className="text-sm font-extrabold text-[#0f294a] leading-tight">{customName || outletName}</div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 border border-slate-300 rounded p-2">
              <div><span className="text-slate-500 text-[9px] block">Channel / Tier</span> <strong className="text-slate-800">{channel} &middot; {tier}</strong></div>
              <div><span className="text-slate-500 text-[9px] block">Tax Type</span> <strong className="text-slate-800 uppercase">{taxReg}</strong></div>
            </div>
          </div>

          {/* Product Table */}
          <div className="mt-4 border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-200/80 text-[8.5px] text-slate-600 uppercase tracking-wider border-b-2 border-slate-300">
                  <th className="p-1.5 pl-2">Product Description</th>
                  <th className="p-1 text-center">QTY</th>
                  <th className="p-1 text-right">TP(Ex)</th>
                  <th className="p-1 text-right">Gross</th>
                  <th className="p-1 text-right">Trade Disc</th>
                  <th className="p-1 text-right">Slab Disc</th>
                  <th className="p-1 text-right">Net(Ex-Tax)</th>
                  <th className="p-1 text-right">GST</th>
                  <th className="p-1 pr-2 text-right">Incl. GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {order.lineItems.map(({ item, calc }: any) => (
                  <tr key={item.id}>
                    <td className="p-1 pl-2 text-[9px] border-r border-slate-200">
                      <div className="font-bold text-slate-900">{item.product.name}</div>
                      <div className="text-slate-500 font-mono text-[8px]">{item.product.code}</div>
                    </td>
                    <td className="p-1 text-center font-mono num border-r border-slate-200">{item.qty} {item.uom}</td>
                    <td className="p-1 text-right font-mono num border-r border-slate-200">{format(item.product.tp)}</td>
                    <td className="p-1 text-right font-mono num font-semibold border-r border-slate-200">{format(item.product.tp * calc.units)}</td>
                    <td className="p-1 text-right font-mono num border-r border-slate-200">{format(calc.tradeDisc)} ({calc.channelOfferPct}%)</td>
                    <td className="p-1 text-right font-mono num border-r border-slate-200">{format(calc.slabDisc)} ({(order.activeSlab?.pct || 0)}%)</td>
                    <td className="p-1 text-right font-mono num font-bold border-r border-slate-200">{format(calc.netBeforeGST)}</td>
                    <td className="p-1 text-right font-mono num border-r border-slate-200">{format(calc.gst)} ({taxReg === 'unregistered' ? '22%' : '18%'})</td>
                    <td className="p-1 pr-2 text-right font-mono num font-extrabold bg-slate-50">{format(calc.netBeforeGST + calc.gst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-4 grid grid-cols-12 gap-3">
            <div className="col-span-8 flex flex-col border border-slate-300 rounded overflow-hidden">
               <div className="bg-slate-100 border-b border-slate-300 px-2 py-1 font-bold text-slate-800 text-[9.5px] uppercase tracking-wide">
                 Discount Summary
               </div>
               <div className="p-2">
                 <div className="flex justify-between items-center text-slate-700 py-1">
                   <span>Trade Offer Discount ({channel})</span>
                   <span className="font-mono font-bold num">{rs(order.totalTradeDisc)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-700 py-1 border-t border-slate-100">
                   <span>Slab Discount ({tier})</span>
                   <span className="font-mono font-bold num">{rs(order.totalSlabDisc)}</span>
                 </div>
               </div>
               <div className="bg-slate-50 border-t border-slate-200 px-2 py-1.5 flex justify-between font-bold text-slate-800 mt-auto">
                 <span>Total Promotional Benefit</span>
                 <span className="font-mono num">{rs(order.totalTradeDisc + order.totalSlabDisc)}</span>
               </div>
            </div>

            <div className="col-span-4 flex flex-col border-print-dark rounded bg-white overflow-hidden shadow-sm">
              <div className="bg-[#0f294a] text-white px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider flex justify-between items-center">
                <span>Financial Summary</span>
              </div>
              <div className="p-2 flex flex-col justify-between text-[10px] flex-1">
                <div className="space-y-1 divide-y divide-slate-100">
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-slate-600">Gross Amount:</span>
                    <span className="font-bold text-slate-800 num">{format(order.grossSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-600">
                    <span>Total Discount Amount:</span>
                    <span className="font-semibold text-emerald-700 num">- {format(order.totalTradeDisc + order.totalSlabDisc)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-600">
                    <span>GST (Sales Tax):</span>
                    <span className="font-semibold text-slate-800 num">{format(order.totalGST)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-700 font-semibold bg-slate-50 px-1 py-0.5 rounded">
                    <span>Net Amount (Before Adv. Tax):</span>
                    <span className="font-bold text-slate-900 num">{format(order.totalNetBeforeGST + order.totalGST)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-600">
                    <span className="text-[9.5px]">Advance Tax ({taxReg === "unregistered" ? "2.5%" : "1%"}):</span>
                    <span className="font-bold text-slate-800 num">{format(order.totalAdvTax)}</span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-[#0f294a]/10 border-2 border-[#0f294a] rounded text-center">
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#0f294a]">NET FINAL PAYABLE</div>
                  <div className="text-lg font-black text-[#0f294a] num tracking-tight leading-none mt-0.5">{rs(order.totalPayable)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-4 pt-2 border-t border-slate-400">
          <div className="grid grid-cols-2 gap-16 text-center text-[10px] text-slate-600 w-1/2 mx-auto">
            <div>
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold text-slate-800">Order Booker Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold text-slate-800">Customer Signature</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[8px] text-slate-500 border-t border-slate-200 pt-1">
            <span>System Generated Invoice &middot; Standard A4 (Landscape)</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
