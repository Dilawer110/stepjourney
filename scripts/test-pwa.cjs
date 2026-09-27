const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const root=__dirname+'/../public/';
const manifest=JSON.parse(fs.readFileSync(root+'manifest.webmanifest'));
assert.ok(manifest.name&&manifest.description);assert.equal(manifest.scope,'/stepjourney/');
for(const icon of manifest.icons){const b=fs.readFileSync(root+icon.src.replace('/stepjourney/',''));assert.equal(b.readUInt32BE(16),Number(icon.sizes.split('x')[0]));}
const listeners={},stored=new Map();let offline=false;
const cache={addAll:async paths=>paths.forEach(p=>stored.set(p,new Response('fallback'))),match:async p=>stored.get(typeof p==='string'?p:p.url),put:async(p,r)=>stored.set(typeof p==='string'?p:p.url,r)};
vm.runInNewContext(fs.readFileSync(root+'sw.js','utf8'),{
  self:{location:{origin:'https://example.com'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>listeners[name]=fn},
  URL,Response,caches:{open:async()=>cache,keys:async()=>[],delete:async()=>true},
  fetch:async()=>{if(offline)throw Error('offline');return new Response('page',{headers:{'content-type':'text/html'}})},
});
function request(url,mode='navigate',headers={},method='GET') { let response; listeners.fetch({request:{url,mode,method,headers:new Headers(headers)},respondWith:p=>response=p});return response; }
(async()=>{
  let installation;listeners.install({waitUntil:p=>installation=p});await installation;
  assert.equal(request('https://project.supabase.co/rest/v1/orders'),undefined);
  assert.equal(request('https://example.com/another-app/'),undefined);
  assert.equal(request('https://example.com/stepjourney/','navigate',{},'POST'),undefined);
  assert.equal(request('https://example.com/stepjourney/?_rsc=1'),undefined);
  assert.equal(request('https://example.com/stepjourney/','cors',{RSC:'1'}),undefined);
  assert.equal(await (await request('https://example.com/stepjourney/order/?outletId=test')).text(),'page');
  offline=true;
  assert.equal(await (await request('https://example.com/stepjourney/order/?outletId=other')).text(),'page');
  assert.equal(await (await request('https://example.com/stepjourney/report/')).text(),'fallback');
  console.log('PASS: manifest/icon sizes, network exclusions, navigation cache, offline fallback');
})().catch(e=>{console.error(e);process.exitCode=1});

