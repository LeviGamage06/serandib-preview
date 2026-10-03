(function(root){
'use strict';
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function validate(input){
 if(!input||typeof input.city!=='string'||!input.city.trim())throw new Error('Choose a city.');
 if(input.year!==undefined&&![2026,2027,2028].includes(input.year))throw new Error('Choose 2026, 2027 or 2028.');
 if(input.date&&input.year&&Number(input.date.slice(0,4))!==input.year)throw new Error('Your wedding date must be in the selected year.');
 if(!Number.isSafeInteger(input.guests)||input.guests<1||input.guests>10000)throw new Error('Enter a whole guest count between 1 and 10,000.');
 if(!Number.isFinite(input.budget)||input.budget<=0||input.budget>1000000000)throw new Error('Enter a venue budget between LKR 1 and LKR 1,000,000,000.');
 if(!Number.isFinite(input.reserve)||input.reserve<0||input.reserve>input.budget)throw new Error('Your extra-cost allowance must be zero or more and no larger than your budget.');
 if(input.date){const d=new Date(input.date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==input.date)throw new Error('Enter a valid wedding date.');if(input.date<(input.today||today()))throw new Error('Choose today or a future wedding date.');}
 return input;
}
function estimate(venue,p,input){
 const now=input.today||today();const year=input.year||Number((input.date||now).slice(0,4));const start=input.date||[now,year+'-01-01'].sort().pop();const end=input.date||year+'-12-31';const date=input.date||start;const reasons=[];
 if(end<now)reasons.push('This wedding year has passed.');
 if(p.validFrom&&end<p.validFrom)reasons.push('Published rate starts '+p.validFrom+'.');
 if(p.requiresYearConfirmation)reasons.push('This published price has no confirmed validity for '+year+'. Request a year-specific quote.');
 if(venue.maxGuests&&input.guests>venue.maxGuests)reasons.push('Exceeds the published banquet capacity.');
 if(p.maxGuests&&input.guests>p.maxGuests)reasons.push('Exceeds this package’s published venue capacity.');
 if(p.minGuests&&input.guests<p.minGuests)reasons.push('Below the published minimum guest count of '+p.minGuests+'.');
 if(p.validUntil&&start>p.validUntil)reasons.push('Published rate expires '+p.validUntil+'. A new quote is needed.');
 if(p.priceYear&&year!==p.priceYear)reasons.push('This brochure covers '+p.priceYear+'; a quote for your year is needed.');
 if(Date.parse(now+'T00:00:00Z')-Date.parse(venue.checkedAt+'T00:00:00Z')>90*86400000)reasons.push('Source was checked over 90 days ago; refresh pricing before matching.');
 if(p.restrictedDays&&!input.allowSpecialDays)reasons.push('Sunday / Poya offers are excluded by your filter.');
 // A non-Sunday may be a Poya day. Never infer Poya dates or confirm eligibility.
 const needsDayConfirmation=p.restrictedDays&&(!input.date||new Date(input.date+'T12:00:00Z').getUTCDay()!==0);
 let base=null;let fixed=p.fixedFees||0;
 if(p.kind==='perPerson')base=p.rate*input.guests;
 if(p.kind==='guestTiers'){base=p.tiers[input.guests]??null;if(base===null)reasons.push('Published totals cover '+Object.keys(p.tiers).join(', ')+' guests; no price is interpolated.');fixed+=(p.tierFixedFees?.[input.guests]||0);}
 const service=base===null?0:Math.round(base*(p.servicePercent||0)/100);
 const subtotal=base===null?null:Math.round(base+service+fixed);const planningTotal=subtotal===null?null:subtotal+input.reserve;
 const status=reasons.length?'quote':planningTotal>input.budget?'over':'potential';
 return {venue,package:p,id:p.id,base,fixed,service,subtotal,planningTotal,status,reasons,needsDayConfirmation,remaining:planningTotal===null?null:input.budget-planningTotal};
}
function canonicalCity(data,city){const key=city.trim().replace(/\s+/g,' ').toLowerCase();if(key==='all sri lanka')return 'All Sri Lanka';return data.cityAliases?.[key]||data.venues.find(v=>v.city.toLowerCase()===key)?.city||city.trim();}
function search(data,input){validate(input);const city=canonicalCity(data,input.city);const cityVenues=data.venues.filter(v=>city==='All Sri Lanka'||v.city===city);const packages=cityVenues.flatMap(v=>v.packages.map(p=>estimate(v,p,input)));const order=(a,b)=>(a.planningTotal??Infinity)-(b.planningTotal??Infinity)||a.venue.name.localeCompare(b.venue.name)||a.package.name.localeCompare(b.package.name);return {cityVenues,matching:packages.filter(p=>p.status==='potential').sort(order),over:packages.filter(p=>p.status==='over').sort(order),unconfirmed:packages.filter(p=>p.status==='quote').sort(order),quoteVenues:cityVenues.filter(v=>!v.packages.length)};}
const api={search,estimate,validate,today,canonicalCity};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SerandibVenueEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
