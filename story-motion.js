/* Progressive enhancement: the photographs and links work without animation. */
(() => {
 const section=document.querySelector('.selected-stories');
 if(!section||!('IntersectionObserver' in window))return;
 const cards=[...section.querySelectorAll('.story-trio>a')];
 const button=section.querySelector('.story-motion-toggle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(min-width: 761px)');
 const animations=new Set();
 let paused=false,near=false,frame=0;
 const enabled=()=>!paused&&!reduced.matches;
 function cancelAnimations(){animations.forEach(a=>a.cancel());animations.clear()}
 function paint(){
  frame=0;if(!enabled()||!near||document.hidden||!desktop.matches)return;
  const rect=section.getBoundingClientRect();
  const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));
  cards.forEach((card,i)=>card.style.setProperty('--story-drift',`${((progress-.5)*[44,-32,56][i]).toFixed(2)}px`));
 }
 function schedule(){if(!frame&&enabled()&&near&&!document.hidden&&desktop.matches)frame=requestAnimationFrame(paint)}
 function sync(){
  cancelAnimations();cancelAnimationFrame(frame);frame=0;
  section.classList.toggle('story-motion-on',enabled());
  cards.forEach(card=>card.style.removeProperty('--story-drift'));
  button.hidden=reduced.matches;
  button.textContent=paused?'Play motion':'Pause motion';
  button.setAttribute('aria-pressed',String(paused));schedule();
 }
 const reveal=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   reveal.unobserve(entry.target);
   if(!enabled()||typeof entry.target.animate!=='function')return;
   const index=cards.indexOf(entry.target);
   const visual=entry.target.querySelector('.story-visual');
   const animation=visual.animate([{opacity:.15,transform:'translateY(42px) scale(.965)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:1100,delay:desktop.matches?index*120:0,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
   animations.add(animation);animation.onfinish=()=>animations.delete(animation);
  });
 },{threshold:.12});
 cards.forEach(card=>reveal.observe(card));
 const visibility=new IntersectionObserver(entries=>{near=entries[0].isIntersecting;schedule()},{rootMargin:'100px'});
 visibility.observe(section);
 button.addEventListener('click',()=>{paused=!paused;sync()});
 reduced.addEventListener('change',sync);desktop.addEventListener('change',sync);
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimations();cancelAnimationFrame(frame);frame=0}else schedule()});
 window.addEventListener('pagehide',()=>{cancelAnimations();cancelAnimationFrame(frame)});
 window.addEventListener('pageshow',schedule);
 sync();
})();
