'use client'

import React, { useEffect, useState } from 'react'

export default function ReportPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [route, setRoute] = useState<string>('N/A')

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const savedOrders = JSON.parse(localStorage.getItem('orders_' + todayStr) || '[]')
    setOrders(savedOrders)
    
    try {
      const todayOutlets = JSON.parse(localStorage.getItem('todayOutlets') || '{}')
      if (todayOutlets.routeName) setRoute(todayOutlets.routeName)
    } catch {}
  }, [])

  const rs = (num: number) => 'Rs. ' + (num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const format = (num: number) => (num || 0).toLocaleString('en-PK')

  // Left List (Orders)
  const leftList = orders.map((o, idx) => ({
    sno: idx + 1,
    buyerName: o.customName || o.outletName,
    sysRef: o.outletName,
    netPayable: o.order?.totalPayable || 0
  }))

  const totalBuyers = leftList.length
  const totalNetPayable = leftList.reduce((acc, curr) => acc + curr.netPayable, 0)

  // Right List (SKUs)
  const skuMap = new Map<string, any>()
  orders.forEach(o => {
    if (!o.order?.lineItems) return
    o.order.lineItems.forEach(({ item, calc }: any) => {
      if (!item?.product) return
      const code = item.product.code
      if (!skuMap.has(code)) {
        skuMap.set(code, {
          code: code,
          name: item.product.name,
          qty: 0
        })
      }
      skuMap.get(code).qty += (calc?.units || 0)
    })
  })
  const rightList = Array.from(skuMap.values()).sort((a, b) => a.name.localeCompare(b.name)).map((s, idx) => ({
    ...s, sno: idx + 1
  }))

  const totalSKUs = rightList.length
  const totalQty = rightList.reduce((acc, curr) => acc + curr.qty, 0)

  // Zipping for robust pagination
  const maxRows = Math.max(leftList.length, rightList.length)
  const zipped = Array.from({ length: maxRows }).map((_, i) => ({
    left: leftList[i] || null,
    right: rightList[i] || null
  }))

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 font-sans p-4 flex flex-col items-center print:bg-white print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 landscape; margin: 8mm 10mm; }
        @media print {
          body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; color: #0f172a !important; }
          .no-print { display: none !important; }
          .page-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; min-height: auto !important; padding: 0 !important; }
          table { page-break-inside: auto; width: 100%; border-collapse: separate; border-spacing: 0; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          .print-break-avoid { break-inside: avoid; }
        }
        .a4-landscape-page { width: 297mm; min-height: 210mm; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.45); box-sizing: border-box; padding: 10mm; }
        .num { font-family: monospace; font-variant-numeric: tabular-nums; }
      `}} />

      {/* Screen Toolbar */}
      <header className="no-print w-full max-w-[297mm] mb-6 flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 backdrop-blur border border-slate-700/80 px-6 py-3.5 rounded-xl shadow-2xl text-white">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-slate-100">Salesman Cash and Stock Summary</h1>
          <p className="text-xs text-slate-400">Order List & SKU Summary</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold">Back</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold shadow-lg">Print Report</button>
        </div>
      </header>

      {/* Main Print Container */}
      <main className="page-sheet a4-landscape-page text-[10px]">
        <table className="w-full border-collapse">
          <thead>
            {/* 1. Main Repeating Header */}
            <tr>
              <th colSpan={2} className="p-0 border-none font-normal text-left pb-2">
                <div className="w-full bg-slate-100 px-3.5 py-2.5 rounded border border-slate-300 print-break-avoid">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <h2 className="text-base font-bold uppercase tracking-tight text-[#0f294a]">Salesman Cash and Stock Summary</h2>
                      <p className="text-[9px] text-slate-500">Operational Gate Loading, Stock Pick & Sales Route Manifest</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-2 pt-2 border-t border-slate-300 text-[9px]">
                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block font-bold">Delivery Date</span>
                      <strong className="text-slate-800">{new Date().toLocaleDateString('en-GB')}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block font-bold">Route / Area</span>
                      <strong className="text-slate-800">{route}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block font-bold">Generated At</span>
                      <strong className="text-slate-800">{new Date().toLocaleString('en-GB')}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-slate-500 block font-bold">Print Req.</span>
                      <strong className="text-slate-800">A4 Landscape</strong>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            
            {/* 2. Sub-Headers for the Two Columns */}
            <tr>
              <th className="w-1/2 p-0 pr-2 align-bottom border-none pb-1">
                <div className="w-full rounded-t border-t border-l border-r border-slate-400 bg-slate-200 text-[#0f294a] uppercase font-bold px-2 py-1 text-center text-[9px] tracking-widest">
                  Orders & Cash Receivables
                </div>
                <table className="w-full text-left border-l border-r border-slate-400 bg-slate-100 border-collapse">
                  <thead>
                    <tr className="text-[8px] uppercase text-slate-600 border-b-2 border-slate-400">
                      <th className="p-1.5 w-8 text-center border-r border-slate-300">#</th>
                      <th className="p-1.5 border-r border-slate-300">Buyer Name</th>
                      <th className="p-1.5 text-right w-24">Net Payable</th>
                    </tr>
                  </thead>
                </table>
              </th>
              
              <th className="w-1/2 p-0 pl-2 align-bottom border-none pb-1">
                <div className="w-full rounded-t border-t border-l border-r border-emerald-500 bg-emerald-100 text-emerald-900 uppercase font-bold px-2 py-1 text-center text-[9px] tracking-widest">
                  SKU Pick & Loading Totals
                </div>
                <table className="w-full text-left border-l border-r border-emerald-500 bg-emerald-50 border-collapse">
                  <thead>
                    <tr className="text-[8px] uppercase text-emerald-800 border-b-2 border-emerald-500">
                      <th className="p-1.5 w-8 text-center border-r border-emerald-300">#</th>
                      <th className="p-1.5 border-r border-emerald-300">SKU Code</th>
                      <th className="p-1.5 border-r border-emerald-300">SKU Name</th>
                      <th className="p-1.5 text-center w-16">Total Qty</th>
                    </tr>
                  </thead>
                </table>
              </th>
            </tr>
          </thead>

          <tbody>
            {zipped.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-slate-500 bg-slate-50 border border-slate-200">
                  No orders generated for today yet.
                </td>
              </tr>
            )}
            {zipped.map((row, i) => (
              <tr key={i}>
                <td className="w-1/2 p-0 pr-2 align-top border-none">
                  {row.left ? (
                    <table className="w-full text-left border-l border-r border-b border-slate-300 border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200 hover:bg-slate-50 bg-white">
                          <td className="p-1.5 w-8 text-center text-slate-500 text-[8px] font-bold border-r border-slate-300 num">{row.left.sno}</td>
                          <td className="p-1.5 border-r border-slate-300">
                            <div className="font-bold text-slate-900 leading-tight">{row.left.buyerName}</div>
                            {row.left.sysRef !== row.left.buyerName && (
                              <div className="text-[8px] text-slate-400 mt-0.5">Sys. Buyer Ref: {row.left.sysRef}</div>
                            )}
                            {row.left.sysRef === row.left.buyerName && (
                              <div className="text-[8px] text-slate-400 mt-0.5">Sys. Buyer Ref: {row.left.sysRef}</div>
                            )}
                          </td>
                          <td className="p-1.5 text-right w-24 font-bold text-slate-900 num bg-slate-50">{format(row.left.netPayable)}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-l border-r border-b border-slate-300 border-collapse">
                      <tbody><tr className="bg-slate-50/50 border-b border-slate-200"><td className="p-1.5 h-[34px]"></td></tr></tbody>
                    </table>
                  )}
                </td>

                <td className="w-1/2 p-0 pl-2 align-top border-none">
                  {row.right ? (
                    <table className="w-full text-left border-l border-r border-b border-emerald-300 border-collapse">
                      <tbody>
                        <tr className="border-b border-emerald-100 hover:bg-emerald-50 bg-white">
                          <td className="p-1.5 w-8 text-center text-emerald-600 text-[8px] font-bold border-r border-emerald-200 num">{row.right.sno}</td>
                          <td className="p-1.5 border-r border-emerald-200 text-slate-500 font-mono text-[8px] w-24">{row.right.code}</td>
                          <td className="p-1.5 border-r border-emerald-200 font-bold text-slate-800">{row.right.name}</td>
                          <td className="p-1.5 text-center w-16 font-extrabold text-emerald-700 num bg-emerald-50/50">{format(row.right.qty)}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-l border-r border-b border-emerald-300 border-collapse">
                      <tbody><tr className="bg-emerald-50/20 border-b border-emerald-100"><td className="p-1.5 h-[34px]"></td></tr></tbody>
                    </table>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td className="w-1/2 p-0 pr-2 align-top border-none pt-2">
                 <div className="border-2 border-[#0f294a] rounded overflow-hidden print-break-avoid">
                   <div className="bg-[#0f294a] text-white px-3 py-1.5 flex justify-between font-bold uppercase tracking-wider text-[10px]">
                     <span>Total Order Value</span>
                     <span className="text-blue-300">{totalBuyers} Orders</span>
                   </div>
                   <div className="bg-white p-3 flex justify-between items-center">
                     <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Total Cash Receivable</span>
                     <span className="text-lg font-black text-[#0f294a] num">{rs(totalNetPayable)}</span>
                   </div>
                 </div>
              </td>
              <td className="w-1/2 p-0 pl-2 align-top border-none pt-2">
                 <div className="border-2 border-emerald-600 rounded overflow-hidden print-break-avoid">
                   <div className="bg-emerald-600 text-white px-3 py-1.5 flex justify-between font-bold uppercase tracking-wider text-[10px]">
                     <span>Total SKU Loading</span>
                     <span className="text-emerald-200">{totalSKUs} Unique SKUs</span>
                   </div>
                   <div className="bg-white p-3 flex justify-between items-center">
                     <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Total Physical Stock</span>
                     <span className="text-lg font-black text-emerald-700 num">{format(totalQty)} Units</span>
                   </div>
                 </div>
              </td>
            </tr>
          </tfoot>
        </table>
        
        <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[8px] text-slate-400">
           System Generated Report &middot; End of Document
        </div>
      </main>
    </div>
  )
}
