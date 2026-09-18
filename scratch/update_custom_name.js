const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/order/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add customName state
content = content.replace(
  "const [invoiceId, setInvoiceId] = useState('')",
  "const [invoiceId, setInvoiceId] = useState('')\n  const [customName, setCustomName] = useState('')"
);

// Update success view
content = content.replace(
  "<p className=\"text-sm text-slate-500 mb-2\">{outletName}</p>",
  "<div className=\"mb-2\"><p className=\"text-sm text-slate-500\">{customName || outletName}</p>{customName && <p className=\"text-[9px] text-slate-400\">(Sys: {outletName})</p>}</div>"
);

// Update Review View (Tax Grid and Outlet Name)
content = content.replace(
  /<div className="flex items-center justify-between border-b border-slate-100 pb-2">\s*<span className="font-bold text-slate-900 text-\[13px\]">\{outletName\}<\/span>\s*<span className="px-2 py-0\.5 rounded bg-blue-50 text-blue-700 font-mono text-\[10px\] font-bold">\{channel\} · \{tier\}<\/span>\s*<\/div>/,
  \<div className="flex flex-col border-b border-slate-100 pb-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-[13px]">{customName || outletName}</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">{channel} · {tier}</span>
            </div>
            {customName && <div className="text-[9px] text-slate-400 mt-0.5">Original System Name: {outletName}</div>}
          </div>\
);

// Update Tax Type position
content = content.replace(
  /<div className="grid grid-cols-2 gap-2 text-\[11px\] text-slate-600">\s*<div><span className="text-slate-400">Tax Type:<\/span> <strong className="text-slate-800 capitalize">\{taxReg\}<\/strong><\/div>\s*<div><span className="text-slate-400">SKUs:<\/span> <strong className="text-slate-800">\{order\.lineItems\.length\} \(\{order\.totalUnits\} Units\)<\/strong><\/div>\s*<div><span className="text-slate-400">GST Rate:<\/span> <strong className="text-slate-800">\{taxReg === 'unregistered' \? '22%' : '18%'\}<\/strong><\/div>\s*<div><span className="text-slate-400">Adv Tax:<\/span> <strong className="text-slate-800">\{taxReg === 'unregistered' \? '2\.5%' : '1%'\}<\/strong><\/div>\s*<\/div>/,
  \<div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div><span className="text-slate-400">SKUs:</span> <strong className="text-slate-800">{order.lineItems.length} ({order.totalUnits} Units)</strong></div>
            <div><span className="text-slate-400">GST Rate:</span> <strong className="text-slate-800">{taxReg === 'unregistered' ? '22%' : '18%'}</strong></div>
            <div><span className="text-slate-400">Adv Tax:</span> <strong className="text-slate-800">{taxReg === 'unregistered' ? '2.5%' : '1%'}</strong></div>
            <div><span className="text-slate-400">Tax Type:</span> <strong className="text-slate-800 capitalize">{taxReg}</strong></div>
          </div>\
);

// Update the Picker/Order Header
content = content.replace(
  /<h2 className="text-sm font-bold text-slate-900 leading-tight">\{outletName\}<\/h2>\s*<span className="px-1\.5 py-0\.2 rounded bg-emerald-50 text-emerald-700 text-\[10px\] font-semibold border border-emerald-200">PJP Valid<\/span>\s*<\/div>\s*<p className="text-\[11px\] text-slate-500 font-medium">\{outletCode\} · \{pjpName\}<\/p>/,
  \<h2 className="text-sm font-bold text-slate-900 leading-tight">{customName || outletName}</h2>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">PJP Valid</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {customName && <span className="text-[9.5px] text-slate-400 mr-1.5">(Sys: {outletName})</span>}
                  {outletCode} · {pjpName}
                </p>\
);

// Add input field for Custom Name inside Commercial Settings
const settingsTarget = \{/* Commercial Settings */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm space-y-2">\;

const settingsReplacement = \{/* Commercial Settings */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm space-y-2">
          
          <div className="mb-3">
            <label className="text-[10px] font-semibold text-slate-500 block mb-1 uppercase tracking-wider">Custom Buyer Name (Optional)</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Leave blank to use default name"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>\;

content = content.replace(settingsTarget, settingsReplacement);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully added customName features');
