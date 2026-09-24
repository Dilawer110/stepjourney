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
  lines: ReturnLine[];
  onBack?: () => void;
  hideToolbar?: boolean;
}

export default function PrintReturnNote({ returnId, outletName, outletCode, pjpName, lines, onBack, hideToolbar }: PrintReturnNoteProps) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const rs = (n: number) => 'Rs. ' + (n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const conditionColor = (c: string) => {
    if (c === 'Expired') return '#dc2626';
    if (c === 'Damaged') return '#d97706';
    return '#7c3aed';
  };

  const totalUnits = lines.reduce((s, l) => s + (l.uom === 'CTN' ? l.qty * l.product.pcsPerCtn : l.qty), 0);
  const totalValue = lines.reduce((s, l) => {
    const units = l.uom === 'CTN' ? l.qty * l.product.pcsPerCtn : l.qty;
    return s + units * l.product.tp;
  }, 0);

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
            <div className="text-right">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Document</div>
              <div className="font-mono font-bold text-slate-800">{returnId}</div>
              <div className="text-slate-500">Date: {today}</div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-[10px]" style={{ border: '1.5px solid #0f172a' }}>
            <thead>
              <tr style={{ background: '#0f294a', color: '#ffffff' }}>
                <th className="text-left px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '4%' }}>#</th>
                <th className="text-left px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '10%' }}>SKU Code</th>
                <th className="text-left px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '30%' }}>Product Name</th>
                <th className="text-center px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '8%' }}>Qty</th>
                <th className="text-center px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '6%' }}>UOM</th>
                <th className="text-center px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '8%' }}>Units</th>
                <th className="text-right px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '10%' }}>TP/Unit</th>
                <th className="text-right px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '12%' }}>Claim Value</th>
                <th className="text-center px-2 py-1.5 font-bold uppercase tracking-wide" style={{ width: '12%' }}>Condition</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const units = l.uom === 'CTN' ? l.qty * l.product.pcsPerCtn : l.qty;
                const lineVal = units * l.product.tp;
                return (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td className="px-2 py-1.5 text-slate-500">{i + 1}</td>
                    <td className="px-2 py-1.5 font-mono text-[9px] text-blue-700">{l.product.code}</td>
                    <td className="px-2 py-1.5 font-semibold text-slate-800">
                      {l.product.name}
                      {l.batch && <span className="ml-1.5 text-[8px] text-slate-400">Batch: {l.batch}</span>}
                      {l.invoiceRef && <span className="ml-1.5 text-[8px] text-slate-400">Inv: {l.invoiceRef}</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center num font-bold">{l.qty}</td>
                    <td className="px-2 py-1.5 text-center text-slate-500">{l.uom}</td>
                    <td className="px-2 py-1.5 text-center num">{units}</td>
                    <td className="px-2 py-1.5 text-right num">{l.product.tp.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right num font-bold">{rs(lineVal)}</td>
                    <td className="px-2 py-1.5 text-center">
                      <span style={{ color: conditionColor(l.condition), fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {l.condition}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#0f172a', color: '#ffffff', borderTop: '2px solid #0f172a' }}>
                <td colSpan={5} className="px-2 py-2 font-bold text-[11px] uppercase tracking-wide">Totals</td>
                <td className="px-2 py-2 text-center num font-bold">{totalUnits}</td>
                <td></td>
                <td className="px-2 py-2 text-right num font-bold">{rs(totalValue)}</td>
                <td className="px-2 py-2 text-center text-[9px] text-slate-300">{lines.length} Line(s)</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between text-[9px] text-slate-400">
          <span>Claim Value is at Ex-GST Trade Price. Subject to distributor verification.</span>
          <span>{returnId} · {today}</span>
        </div>
      </main>
    </div>
  );
}
