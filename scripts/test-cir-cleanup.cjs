const assert = require('node:assert/strict'), fs = require('fs'), vm = require('vm'), ts = require('typescript');
const m = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(__dirname + '/../lib/legacy-cir-cleanup.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports:m.exports});
const data = new Map([
 ['comp_intel_2026-09-29','old'],
 ['stepjourney-v2:alice:["worker","zone"]:comp_intel_2026-09-29','old scoped'],
 ['cir_draft_shop','new draft'],
 ['cir_reports_submitted','new reports'],
 ['cir_master_brands','brands'],
 ['stepjourney-v2:alice:scope:cir_draft_shop','scoped draft'],
 ['stepjourney-v2:alice:scope:cir_reports_submitted','scoped reports'],
 ['orders','unrelated'], ['comp_intel_notes','not a dated legacy record'],
 ['sb-auth-token','session']
]);
const storage = {get length(){return data.size},key:i=>[...data.keys()][i]??null,removeItem:k=>data.delete(k)};
const preserved = new Map([...data].slice(2));
assert.equal(m.exports.removeLegacyCIRCache(storage),2);
assert.deepEqual(data,preserved);
assert.equal(m.exports.removeLegacyCIRCache(storage),0);
const form=fs.readFileSync(__dirname+'/../app/competitor-intelligence/page.tsx','utf8');
assert.ok(!form.includes("from('competitor_intelligence')"));
assert.ok(!form.includes('localStorage.'));
assert.ok(form.includes('loaded && outletCode && !success'));
assert.ok(form.includes('Database synchronization is not available yet.'));
console.log('CIR cleanup passed: exact legacy keys removed; current drafts/reports, brands, orders and auth preserved; idempotent cleanup.');
