const fs = require('fs');
const source = fs.readFileSync(__dirname + '/../supabase_master_data.sql', 'utf8');
const rows = [];
for (const block of source.matchAll(/INSERT INTO outlet_visit_schedule \([^;]+? VALUES\s*([\s\S]*?);/g)) {
  for (const match of block[1].matchAll(/\('((?:[^']|'')*)', '((?:[^']|'')*)', '((?:[^']|'')*)', '((?:[^']|'')*)', '((?:[^']|'')*)', '((?:[^']|'')*)'\)/g)) {
    rows.push([match[1],match[2],match[4],match[5]].map(s=>s.replace(/''/g,"'")));
  }
}
const unique = [...new Map(rows.map(r=>[JSON.stringify(r),r])).values()];
if (!unique.length || unique.some(r=>!['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].includes(r[2]))) throw Error('Invalid schedule');
const q = value => "'"+value.replace(/'/g,"''")+"'";
const batches=[];
for(let i=0;i<unique.length;i+=2000) {
  batches.push(`INSERT INTO public.outlet_visit_schedule (store_code,pjp_code,day,order_booker_code) SELECT v.* FROM (VALUES ${unique.slice(i,i+2000).map(r=>'('+r.map(q).join(',')+')').join(',')} ) v(store_code,pjp_code,day,order_booker_code) JOIN public.outlets o ON o.code=v.store_code JOIN public.app_users u ON u.order_booker_code=v.order_booker_code WHERE EXISTS (SELECT 1 FROM public.pjp_routes p WHERE p.pjp_code=v.pjp_code AND p.day=v.day AND p.order_booker_code=v.order_booker_code) ON CONFLICT DO NOTHING;`);
}
const restoreBookers = `insert into public.app_users(order_booker_code,order_booker_name,distributor_code,distributor_name) select order_booker_code,min(order_booker_name),min(distributor_code),min(distributor_name) from public.pjp_routes where order_booker_code is not null group by order_booker_code having count(distinct distributor_code)=1 on conflict(order_booker_code) do nothing;`;
fs.writeFileSync(__dirname+'/../supabase/header_filter_seed.sql',restoreBookers+'\
'+batches.join('\
'));
console.log(JSON.stringify({sourceRows:rows.length,uniqueRows:unique.length,batches:batches.length}));

