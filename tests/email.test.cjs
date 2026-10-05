const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../consultation.html'),'utf8');
const script=fs.readFileSync(path.join(__dirname,'../consultation.js'),'utf8');
function fixture({shared=null,valid=true,honey='',protocol='https:'}={}) {
 const events={}, windowEvents={};
 const field=(value='')=>({value,addEventListener(){},setCustomValidity(message){this.validationMessage=message;}});
 const elements=Object.fromEntries(['_next','_url','names','email','phone','location','guests','date','shortlisted_venues','shortlist_link'].map(n=>[n,field()]));
 elements.names.value='  Test Couple  ';elements.email.value=' test@example.com ';
 elements._honey=field(honey);elements.service={value:'Help us find the right support',options:[]};
 const button={disabled:false,textContent:'Send enquiry'};
 const form={elements,querySelector:()=>button,querySelectorAll:()=>[button],prepend(){},reportValidity:()=>valid,addEventListener:(name,fn)=>events[name]=fn};
 const status={textContent:''};
 const context={window:{addEventListener:(name,fn)=>windowEvents[name]=fn,SerandibVenueData:{venues:[{id:'test',name:'Test Venue',packages:[{id:'test-package',name:'Test package'}]}]}},
 document:{getElementById:id=>id==='consultation-form'?form:id==='consultation-status'?status:{addEventListener(){}},createElement:()=>({})},
 location:{href:'https://example.com/weddings/consultation.html#list=example',protocol,search:''}, URL,URLSearchParams,
 Serandib:{readShared:()=>shared,shortlistURL:()=> 'https://example.com/weddings/shortlist.html#list=public'}};
 vm.runInNewContext(script,context);
 const submit=()=>{let prevented=false;events.submit({preventDefault(){prevented=true;}});return prevented;};
 return {elements,button,status,submit,windowEvents};
}
test('real form posts to the intended email service with CAPTCHA retained',()=>{
 assert.match(html,/<form[^>]+action="https:\/\/formsubmit.co\/serandib.enquiries@gmail.com"[^>]+method="POST"/);
 assert.match(html,/<input type="email" name="email" required/);
 assert.match(html,/name="_honey"/);
 assert.doesNotMatch(html,/name="_captcha"[^>]*value="false"/);
 assert.match(html,/<button type="submit" class="button">Send enquiry<\/button>/);
});
test('valid submission uses native POST, protects against duplicates and preserves reply email',()=>{
 const f=fixture();assert.equal(f.submit(),false);assert.equal(f.button.disabled,true);assert.equal(f.elements.email.value,'test@example.com');
 assert.equal(f.submit(),true);
 f.windowEvents.pageshow();assert.equal(f.button.disabled,false);assert.equal(f.submit(),false);
});
test('invalid, honeypot and file-preview submissions are blocked',()=>{
 for(const options of [{valid:false},{honey:'bot'},{protocol:'file:'}])assert.equal(fixture(options).submit(),true);
});
test('return URL stays inside the project subpath with no private data in the URL',()=>{
 const f=fixture();assert.equal(f.elements._next.value,'https://example.com/weddings/thank-you.html');
 assert.equal(f.elements._url.value,'https://example.com/weddings/consultation.html');
});
test('email includes both priced and quote-only shortlisted venue names',()=>{
 const f=fixture({shared:{ids:['test-package','venue__test'],settings:{city:'Colombo',guests:150,year:2027,date:''}}});
 assert.equal(f.elements.shortlisted_venues.value,'Test Venue — Test package\nTest Venue');
 assert.match(f.elements.shortlist_link.value,/#list=/);assert.equal(f.elements.guests.value,150);
});
