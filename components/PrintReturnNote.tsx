import React from 'react';

interface ReturnLine {
  id: string;
  product: { code: string; name: string; tp: number; pcsPerCtn: number };
  qty: number;
  uom: 'CTN' | 'PCS';
  condition: 'Expired' | 'Damaged' | 'Near Expiry';
  batch: string;
  invoiceRef: string;
}

interface PrintReturnNoteProps {
  returnId: string;
  outletName: string;
  outletCode?: string;
  pjpName?: string;
  channel?: string;
  tier?: string;
  taxReg?: string;
  result?: any;
  lines: ReturnLine[];
  onBack?: () => void;
  hideToolbar?: boolean;
}

export default function PrintReturnNote({ returnId, outletName, outletCode, pjpName, channel, tier, taxReg, result, lines, onBack, hideToolbar }: PrintReturnNoteProps) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const rs = (n: number) => 'Rs. ' + (n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const conditionColor = (c: string) => {
    if (c === 'Expired') return '#dc2626';
    if (c === 'Damaged') return '#d97706';
    return '#7c3aed';
  };

  const totalUnits = lines.reduce((s, l) => s + (l.uom === 'CTN' ? l.qty * l.product.pcsPerCtn : l.qty), 0);
  const claimTotal = result ? result.totalPayable : lines.reduce((s, l) => s + (l.uom === 'CTN' ? l.qty * l.product.pcsPerCtn : l.qty) * l.product.tp, 0);

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

      {/* Toolbar */}
      {!hideToolbar && (
        <header className="no-print w-full max-w-[297mm] mb-5 flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-5 py-3 shadow-xl text-white">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">
              &larr; Back
            </button>
            <div className="h-4 w-[1px] bg-slate-700"></div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Return / Claim Note Preview
                <span className="text-[11px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{returnId}</span>
              </h1>
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition ring-2 ring-emerald-400/30">
            Print / Save PDF
          </button>
        </header>
      )}

      {/* Printable Canvas */}
      <main className="a4-landscape-page flex flex-col justify-between text-[11px] leading-tight select-text print-break-inside-avoid">
        <div>
          {/* Header */}
          <div className="relative pb-2 border-b-2 border-slate-900 flex items-start justify-between">
            <div className="flex-1"></div>
            <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center">
              <h2 className="text-base font-extrabold uppercase tracking-widest text-[#0f294a] border-b border-slate-800 pb-0.5 px-4">SALES RETURN / CLAIM NOTE</h2>
              <p className="text-[9px] text-slate-500 mt-0.5 tracking-wide uppercase">Expired · Damaged · Near Expiry — Distributor Copy</p>
            </div>
            <div className="flex-1 flex flex-col items-end text-[10px] text-slate-600">
              <span className="font-mono font-bold text-slate-800">{returnId}</span>
              <span>{today}</span>
            </div>
          </div>

          {/* Billed To */}
          <div className="mt-2 mb-3 grid grid-cols-2 gap-4 text-[10px]">
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Returned By</div>
              <div className="font-bold text-[12px] text-slate-900">{outletName}</div>
              <div className="text-slate-500">{outletCode}{pjpName ? ` · ${pjpName}` : ''}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Commercial Terms</div>
              {channel && tier && <div className="font-semibold text-slate-800">{channel} · {tier}</div>}
              {taxReg && <div className="text-slate-500 uppercase">{taxReg === 'registered' ? 'STRN Registered' : 'Unregistered'}</div>}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="bg-slate-100 text-[#0f294a] uppercase text-[9px] font-extrabold tracking-wider border-y-2 border-slate-900">
                <th className="py-1.5 px-1.5 w-[5%]">#</th>
                <th className="py-1.5 px-1.5 w-[10%]">SKU Code</th>
                <th className="py-1.5 px-1.5 w-[25%]">Product Description</th>
                <th className="py-1.5 px-1.5 text-center w-[8%]">Condition</th>
                <th className="py-1.5 px-1.5 text-center w-[8%]">Batch/Inv</th>
                <th className="py-1.5 px-1.5 text-center w-[10%]">Qty (UOM)</th>
                <th className="py-1.5 px-1.5 text-center w-[7%]">Units</th>
                <th className="py-1.5 px-1.5 text-right w-[12%]">TP / Unit (Ex-GST)</th>
                <th className="py-1.5 px-1.5 text-right w-[15%]">Line Credit</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {lines.map((l, i) => {
                const units = l.uom === 'CTN' ? l.qty * l.product.pcsPerCtn : l.qty;
                const tp = l.product.tp;
                // If result exists, grab line calc, else fallback to simple units * tp
                const lineCalc = result?.lineItems.find((li:any) => li.item.id === l.id)?.calc;
                const lineTotal = lineCalc ? lineCalc.total : (units * tp);
                
                return (
                  <tr key={l.id} className="border-b border-slate-200/60 break-inside-avoid">
                    <td className="py-1 px-1.5 font-mono text-slate-400">{i + 1}</td>
                    <td className="py-1 px-1.5 font-mono font-medium">{l.product.code}</td>
                    <td className="py-1 px-1.5 font-bold text-slate-800">{l.product.name}</td>
                    <td className="py-1 px-1.5 text-center">
                      {l.condition && (
                        <span style={{ color: conditionColor(l.condition), border: `1px solid ${conditionColor(l.condition)}40`, padding: '1px 4px', borderRadius: '4px', fontSize: '8.5px', fontWeight: 'bold' }}>
                          {l.condition}
                        </span>
                      )}
                    </td>
                    <td className="py-1 px-1.5 text-center text-[8.5px] text-slate-500 font-mono">
                      {l.batch ? `B:${l.batch}` : ''} {l.invoiceRef ? `I:${l.invoiceRef}` : ''}
                    </td>
                    <td className="py-1 px-1.5 text-center num">{l.qty} {l.uom}</td>
                    <td className="py-1 px-1.5 text-center num font-bold">{units}</td>
                    <td className="py-1 px-1.5 text-right num">{tp.toFixed(2)}</td>
                    <td className="py-1 px-1.5 text-right num font-bold text-slate-900">{rs(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Simple Totals Row if no result passed */}
          {!result && (
            <div className="border-t-2 border-slate-900 mt-1 pt-1.5 flex justify-between items-center px-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Return Claim (Ex-GST)</span>
              <span className="font-bold text-[13px] num">{rs(claimTotal)}</span>
            </div>
          )}
        </div>

        {/* Financial Footer (if result passed) */}
        {result && (
          <div className="mt-4 flex gap-4">
            <div className="flex-[2] text-[9px] text-slate-500 border border-slate-300 p-2 rounded">
              <strong>Return Terms & Conditions:</strong><br />
              1. All returned goods must be physically verified by distributor warehouse.<br />
              2. Expiry returns are processed as per company policy limits.<br />
              3. Damaged goods must be in original condition as received by the retailer.<br />
              4. Credit note value is inclusive of applicable GST and Advance Tax.
            </div>
            
            <div className="flex-[1.5] flex flex-col gap-0.5 text-[10px] num">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Gross Subtotal (Ex-GST)</span>
                <span className="font-semibold text-slate-800">{rs(result.grossSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 text-emerald-700">
                <span>Trade Offer Discount</span>
                <span>-{rs(result.totalTradeDisc)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200 text-emerald-700">
                <span>Slab Discount ({result.activeSlab.pct}%)</span>
                <span>-{rs(result.totalSlabDisc)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 font-bold">
                <span className="text-slate-800">Net Amount Before GST</span>
                <span className="text-slate-900">{rs(result.totalNetBeforeGST)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-500">GST ({taxReg === 'unregistered' ? '22%' : '18%'})</span>
                <span className="font-semibold text-slate-800">{rs(result.totalGST)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Advance Tax ({taxReg === 'unregistered' ? '2.5%' : '1%'})</span>
                <span className="font-semibold text-slate-800">{rs(result.totalAdvTax)}</span>
              </div>
              <div className="flex justify-between items-center py-1 mt-1 border-y-2 border-slate-900 bg-slate-50 px-1">
                <span className="font-extrabold uppercase tracking-wide text-slate-900">Total Credit Claim</span>
                <span className="font-extrabold text-[12px] text-slate-900">{rs(result.totalPayable)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="w-32 border-b border-slate-400 mb-1"></div>
            <span className="font-bold uppercase tracking-wider text-slate-500">Sales Representative</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-32 border-b border-slate-400 mb-1"></div>
            <span className="font-bold uppercase tracking-wider text-slate-500">Distributor Manager</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-32 border-b border-slate-400 mb-1"></div>
            <span className="font-bold uppercase tracking-wider text-slate-500">Retailer Signature</span>
          </div>
        </div>
      </main>
    </div>
  );
}
