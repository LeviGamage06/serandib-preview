const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../venue-engine.js');
const data = require('../venue-data.js');
const settings = {city:'Colombo',year:2026,guests:200,budget:3000000,reserve:100000,date:'',allowSpecialDays:false};
function platform({blocked=false, pathname='/serandib-preview/venues.html', storage=new Map()}={}) {
  const context = {window:{},document:{querySelector:()=>null,getElementById:()=>null},location:{href:'https://example.test'+pathname},URL,URLSearchParams,TextEncoder,TextDecoder,btoa,atob,
    localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);},removeItem:k=>storage.delete(k)}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../platform.js'),'utf8'),context);
  return context.window.Serandib;
}
test('share links round-trip Unicode, contain preferences only and retain project path',()=>{
 const app=platform(), input={v:1,ids:['kingsbury-bronze'],settings:{...settings,city:'කොළඹ',contact:'private@example.test'},contact:'private'};
 const link=app.shortlistURL(input);assert.equal(new URL(link).pathname,'/serandib-preview/shortlist.html');
 const decoded=app.decode(new URLSearchParams(new URL(link).hash.slice(1)).get('list'));
 assert.equal(decoded.settings.city,'කොළඹ');assert.equal(decoded.settings.contact,undefined);assert.equal(decoded.contact,undefined);
});
test('malformed, oversized, invalid-date and excessive-selection links are rejected',()=>{
 const app=platform();for(const token of ['bad!','a'.repeat(7000),'e30'])assert.throws(()=>app.decode(token));
 for(const changes of [{date:'2026-02-30'},{guests:0},{budget:-1},{reserve:4000000},{year:NaN}])assert.throws(()=>app.encode({v:1,ids:['test'],settings:{...settings,...changes}}));
 assert.throws(()=>app.encode({v:1,ids:['a','b','c','d'],settings}));
});
test('saved lists deduplicate, cap at 30 and survive a new page instance',()=>{
 const storage=new Map(),app=platform({storage});
 for(let i=0;i<35;i++)app.saveShortlist({v:1,ids:['p'+i],settings});
 app.saveShortlist({v:1,ids:['p34'],settings});assert.equal(app.savedLists().length,30);
 assert.equal(platform({storage,pathname:'/serandib-preview/shortlist.html'}).savedLists().length,30);
 assert.equal(platform({storage,pathname:'/other/shortlist.html'}).savedLists().length,0);
});
test('blocked storage still generates a shareable shortlist',()=>{
 const app=platform({blocked:true}),result=app.saveShortlist({v:1,ids:['venue__test'],settings});
 assert.equal(result.persisted,false);assert.match(result.url,/#list=/);assert.equal(app.savedLists().length,0);
});
test('price calculation includes service, mandatory fees and reserve',()=>{
 const row=engine.estimate({name:'Test',checkedAt:'2026-10-02'}, {kind:'perPerson',rate:1000,servicePercent:10,fixedFees:5000,priceYear:2026},{...settings,today:'2026-10-04'});
 assert.equal(row.subtotal,225000);assert.equal(row.planningTotal,325000);assert.equal(row.status,'potential');
});
test('unpriced venues and unavailable guest tiers never become zero-price matches',()=>{
 for(const p of [{kind:'quote'},{kind:'guestTiers',tiers:{100:100000}}]){
 const row=engine.estimate({checkedAt:'2026-10-02'},p,{...settings,today:'2026-10-04'});
 assert.equal(row.subtotal,null);assert.equal(row.status,'quote');
 }
 assert.equal(platform().money(null),'Quote required');
});
test('expired, stale and wrong-year prices require a quote',()=>{
 for(const [v,p] of [[{checkedAt:'2025-01-01'},{}],[{checkedAt:'2026-10-02'},{priceYear:2025}],[{checkedAt:'2026-10-02'},{validUntil:'2026-01-01'}]]){
 assert.equal(engine.estimate(v,{kind:'perPerson',rate:1000,...p},{...settings,today:'2026-10-04'}).status,'quote');
 }
});
test('years roll forward and invalid search dates/guest counts fail',()=>{
 assert.equal(engine.validate({...settings,year:2030}).year,2030);
 assert.throws(()=>engine.validate({...settings,date:'2026-02-30',today:'2026-01-01'}));
 assert.throws(()=>engine.validate({...settings,guests:1.5}));
});
test('directory IDs are stable-safe and unique; package sources use HTTPS',()=>{
 const ids=new Set();
 for(const v of data.venues){
 assert.match(v.id,/^[a-zA-Z0-9_-]+$/);assert.ok(!ids.has('venue__'+v.id));ids.add('venue__'+v.id);assert.match(v.source,/^https:\/\//);
 for(const p of v.packages){assert.match(p.id,/^[a-zA-Z0-9_-]+$/);assert.ok(!ids.has(p.id));ids.add(p.id);assert.match(p.source||v.source,/^https:\/\//);}
 }
});
