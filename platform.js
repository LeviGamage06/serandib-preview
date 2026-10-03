(() => {
const menu=document.querySelector('.menu'),nav=document.getElementById('nav');
if(menu&&nav){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===(location.pathname.split('/').pop()||'index.html'))a.setAttribute('aria-current','page');a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open')})});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){menu.click();menu.focus()}})}
const request=async(path,options={})=>{
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const r=await fetch(path,{...options,signal:options.signal||controller.signal,headers:{'Content-Type':'application/json',...options.headers}});
  let data;try{data=await r.json()}catch{throw new Error('Online saving is not connected in this preview. You can still contact us on WhatsApp or email.')}
  if(!r.ok)throw Object.assign(new Error(data.error||'Please try again.'),{status:r.status});return data;
 }catch(error){if(error.name==='AbortError')throw new Error('The connection took too long. Please try again.');throw error}finally{clearTimeout(timeout)}
};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'LKR '+Math.round(n).toLocaleString('en-US');
const event=name=>request('/api/events',{method:'POST',body:JSON.stringify({event:name})}).catch(()=>{});
const session=request('/api/session').catch(()=>({savingAvailable:false}));
window.Serandib={request,escape,money,event,session,directory:async()=>{try{return await request('/api/venues')}catch{return window.SerandibVenueData}}};
document.querySelectorAll('a[href*="wa.me"]').forEach(a=>a.addEventListener('click',()=>event('whatsapp_opened')));
})();
