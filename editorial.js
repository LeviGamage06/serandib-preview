(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const elements=document.querySelectorAll('.island-copy,.island-visual,.home-discovery>div,.section-head,.principles article,.service-grid article,.tradition-copy,.steps article');
 if(!reduce.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-enter');observer.unobserve(entry.target)}})},{threshold:.12});
  elements.forEach(el=>observer.observe(el));
 }
 const menu=document.querySelector('.menu'),nav=document.getElementById('nav');
 if(menu&&nav){
  const close=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')};
  document.addEventListener('click',event=>{if(!event.target.closest('header'))close()});
  matchMedia('(min-width: 1001px)').addEventListener('change',event=>{if(event.matches)close()});
 }
})();
