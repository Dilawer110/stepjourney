const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript');
const data=new Map(); const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
const sandboxModule={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(__dirname+'/../lib/user-storage.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:sandboxModule.exports,localStorage});
const {userStorage:s,setStorageIdentity:set}=sandboxModule.exports;
assert.throws(()=>s.getItem('orders'),/Sign in/);
data.set('orders','legacy');set('alice','worker-A');assert.equal(s.getItem('orders'),null);
s.setItem('orders','alice-private');set('bob','worker-B');assert.equal(s.getItem('orders'),null);s.setItem('orders','bob-private');
set('alice','worker-A');assert.equal(s.getItem('orders'),'alice-private');
set('alice','worker-C');assert.equal(s.getItem('orders'),null);
set(null);assert.throws(()=>s.setItem('orders','bad'),/Sign in/);
assert.equal(data.get('orders'),'legacy');console.log('Storage isolation: passed (sign-out, account switching, scope changes, legacy preservation).');


