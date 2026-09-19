const fs = require('fs');
let code = fs.readFileSync('components/PrintInvoice.tsx', 'utf8');

const companyBlock = \<div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#0f294a] flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-slate-700">B</div>
              <div>
                <div className="text-[13px] font-extrabold text-[#0f294a] uppercase tracking-wider">Bunny's Quality Foods (Pvt) Ltd.</div>
                <div className="text-[9.5px] text-slate-500 font-medium">Snacks Division &middot; Commercial Sales Invoice</div>
              </div>
            </div>\;

code = code.replace(companyBlock, '');

const signaturesBlock = \<div className="grid grid-cols-2 gap-16 text-center text-[10px] text-slate-600 w-1/2 mx-auto">
            <div>
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold text-slate-800">Order Booker Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold text-slate-800">Customer Signature</span>
            </div>
          </div>\;

code = code.replace(signaturesBlock, '');

const footerText = \<div className="mt-4 flex items-center justify-between text-[8px] text-slate-500 border-t border-slate-200 pt-1">
            <span>System Generated Invoice &middot; Standard A4 (Landscape)</span>
            <span>Page 1 of 1</span>
          </div>\;
          
const newFooterText = \<div className="mt-4 flex items-end justify-between text-[9px] text-slate-500 pt-1">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-700 text-[10px]">System Buyer Record: {outletName}</span>
              <span className="text-[8px]">System Generated Invoice &middot; Standard A4 (Landscape)</span>
            </div>
            <span>Page 1 of 1</span>
          </div>\;

code = code.replace(footerText, newFooterText);

// Also remove the extra top border above footer if needed, but it looks fine.
// <div className="mt-4 pt-2 border-t border-slate-400">
// We can change border-slate-400 to border-slate-300 and keep it.
code = code.replace(/<div className="mt-4 pt-2 border-t border-slate-400">/g, '<div className="mt-4 pt-2 border-t border-slate-300">');

fs.writeFileSync('components/PrintInvoice.tsx', code);
console.log('Update complete.');
