const fs=require('fs'), vm=require('vm'), assert=require('node:assert/strict');
const ts=require('typescript');
const source=fs.readFileSync(__dirname+'/../app/page.tsx','utf8');
const helper=source.slice(source.indexOf('async function readAll'),source.indexOf('const DAYS'));
const readAll=vm.runInNewContext(ts.transpile(helper)+'; readAll');
(async()=>{
  for(const count of [0,1,200,201,1001,2209]) {
    const data=Array.from({length:count},(_,id)=>({id}));let calls=0;
    const result=await readAll(()=>({range:async(a,b)=>{calls++;return {data:data.slice(a,b+1),error:null}}}));
    assert.equal(result.length,count);assert.equal(new Set(result.map(r=>r.id)).size,count);
    assert.equal(calls,Math.floor(count/200)+1);
  }
  let calls=0;
  await assert.rejects(readAll(()=>({range:async()=>++calls===1?{data:Array(200).fill({}),error:null}:{data:null,error:new Error('network')}})),/network/);
  console.log('PASS: six row-count boundaries (including >1000), unique rows, and failed-page propagation');
})().catch(e=>{console.error(e);process.exitCode=1});

