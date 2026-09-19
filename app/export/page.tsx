'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PrintInvoice from '@/components/PrintInvoice'

export default function BulkExportPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'list' | 'sheet' | 'print'>('list')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const savedOrders = JSON.parse(localStorage.getItem('orders_' + todayStr) || '[]')
    setOrders(savedOrders)
  }, [])

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === orders.length) setSelected(new Set())
    else setSelected(new Set(orders.map(o => o.invoiceId)))
  }

  const selectedOrders = orders.filter(o => selected.has(o.invoiceId))
  const totalPayable = selectedOrders.reduce((acc, curr) => acc + (curr.order?.totalPayable || 0), 0)
  
  const rs = (num: number) => 'Rs. ' + (num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCombinedPrint = () => {
    if (selected.size === 0) return
    setView('print')
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bulk Export Orders',
          text: `Here are the details for ${selected.size} selected orders.`
        })
        setToast('Shared successfully')
      } catch (e) {
        console.error(e)
      }
    } else {
      setToast('Native share not supported on this device')
    }
    setTimeout(() => setToast(''), 3000)
  }

  if (view === 'print') {
    return (
      <div className="bg-slate-900 min-h-screen pb-10">
        <div className="no-print sticky top-0 bg-slate-900/90 backdrop-blur z-50 p-4 border-b border-slate-800 flex justify-between items-center text-white">
          <div>
            <h2 className="font-bold">Combined PDF Preview</h2>
            <p className="text-xs text-slate-400">{selected.size} Orders selected</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('list')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-semibold">Back</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">print</span> Print/PDF
            </button>
          </div>
        </div>
        <div className="flex flex-col pt-6">
          {selectedOrders.map((o, i) => (
            <div key={i} className="print-break-after">
              <PrintInvoice 
                order={o.order} 
                invoiceId={o.invoiceId}
                outletName={o.outletName}
                customName={o.customName}
                channel={o.order?.channel || 'Retail (GT)'}
                tier={o.order?.tier || 'Tier 1'}
                taxReg={o.order?.taxReg || 'unregistered'}
                hideToolbar={true}
              />
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
             .no-print { display: none !important; }
             body { background: white !important; }
             .print-break-after { page-break-after: always; break-after: page; }
             .print-break-after:last-child { page-break-after: auto; break-after: auto; }
          }
        `}} />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-32 font-sans relative">
      <header className="sticky top-0 z-30 bg-white shadow-sm pt-4 pb-2 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Export Orders</h1>
          </div>
        </div>
        
        {/* Selection Action Bar */}
        <div className="bg-[#0f294a] text-white rounded-xl shadow-md px-4 py-3 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(new Set())} className="text-slate-300 hover:text-white">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <span className="font-bold">{selected.size} Selected</span>
          </div>
          <button onClick={toggleSelectAll} className="text-blue-300 text-sm font-semibold uppercase tracking-wider">
            {selected.size === orders.length && orders.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {orders.length === 0 && (
          <div className="text-center py-10 text-slate-500">No orders completed today.</div>
        )}
        {orders.map((o) => (
          <div key={o.invoiceId} onClick={() => toggleSelect(o.invoiceId)} className={`relative flex items-start gap-3 p-3.5 rounded-xl bg-white shadow-sm cursor-pointer transition-all border ${selected.has(o.invoiceId) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
            {selected.has(o.invoiceId) && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl"></div>}
            
            <div className="pt-0.5 pl-1">
              <input type="checkbox" checked={selected.has(o.invoiceId)} readOnly className="w-5 h-5 rounded accent-blue-600 pointer-events-none" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate leading-tight">{o.customName || o.outletName}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{o.outletName}</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">Completed</span>
              </div>
              <div className="mt-2 pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Ref: <span className="text-slate-700 ml-1">{o.invoiceId}</span></div>
                <div className="text-xs font-bold text-[#0f294a]">{rs(o.order?.totalPayable)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sticky Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] transition-transform duration-300 ${selected.size > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">{selected.size} Orders</div>
            <div className="text-lg font-black text-[#0f294a]">{rs(totalPayable)}</div>
          </div>
          <button onClick={() => setView('sheet')} className="flex-1 max-w-[160px] h-12 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 active:scale-95 transition-all">
            Export 
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
          </button>
        </div>
      </div>

      {/* Export Options Bottom Sheet */}
      {view === 'sheet' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-2xl shadow-2xl p-5 transform transition-transform animate-slide-up">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">picture_as_pdf</span>
                Export Selected
              </h2>
              <button onClick={() => setView('list')} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* Option 1: Combined */}
              <label className="flex items-start gap-3 p-3 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer">
                <div className="pt-0.5"><input type="radio" checked readOnly className="w-5 h-5 accent-blue-600" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Combined PDF</span>
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Create one master PDF containing {selected.size} invoices sequentially.</p>
                </div>
              </label>

              {/* Option 2: Separate */}
              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl opacity-50 cursor-not-allowed" onClick={() => { setToast('Native Separate ZIP generation requires an external plugin (e.g. jszip). Using Combined PDF instead.'); setTimeout(() => setToast(''), 4000); }}>
                <div className="pt-0.5"><input type="radio" disabled className="w-5 h-5" /></div>
                <div>
                  <div className="font-bold text-slate-500">Separate PDFs (ZIP)</div>
                  <p className="text-xs text-slate-400 mt-1">Generate {selected.size} individual files.</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleNativeShare} className="h-12 bg-slate-100 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200">
                <span className="material-symbols-outlined text-[20px]">share</span> Share
              </button>
              <button onClick={handleCombinedPrint} className="h-12 bg-[#0f294a] text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#1a3a63]">
                <span className="material-symbols-outlined text-[20px]">download</span> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center gap-2 animate-fade-in w-max max-w-[90%] text-center">
          <span className="material-symbols-outlined text-[18px]">info</span> {toast}
        </div>
      )}
    </div>
  )
}
