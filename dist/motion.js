(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  try{paused=paused||localStorage.getItem('atlas-motion')==='paused'}catch{}
  const body=document.body,button=document.querySelector('#motion-button'),video=document.querySelector('.landscape-video');
  let heroVisible=true;
  if(ELEMENTS[page]){
    body.style.setProperty('--accent',ELEMENTS[page].color);
    const art={agua:'katara-cut.webp',terra:'toph-cut.webp',fogo:'zuko-cut.webp',ar:'aang-cut.webp'};
    const portrait=document.querySelector('.element-hero figure img');
    if(portrait){portrait.src='assets/'+art[page];portrait.alt=ELEMENTS[page].people[0][0]+' em arte oficial do Avatar Studios'}
  }
  body.insertAdjacentHTML('afterbegin','<div class="reading-progress" aria-hidden="true"></div><div class="route-curtain" aria-hidden="true"></div>');
  function syncVideo(){if(!video)return;if(paused||document.hidden||!heroVisible){video.pause()}else{video.play().catch(()=>{})}}
  function sync(){body.classList.toggle('motion-paused',paused);body.classList.toggle('motion-active',!paused);button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Reproduzir animações':'Pausar animações');button.querySelector('span').textContent=paused?'▷':'Ⅱ';syncVideo();if(paused)document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in-view'))}
  button.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('atlas-motion',paused?'paused':'playing')}catch{}sync()});
  reduced.addEventListener('change',e=>{paused=e.matches;sync()});
  document.addEventListener('visibilitychange',syncVideo);
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');reveal.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -15px 0px'});
    document.querySelectorAll('.section-head,.world-intro>div,.spirit-card,.era-card,.new-era,.cycle-callout>h2,.book-card,.person-card,.avatar-card,.timeline article,.technique-grid article,.place-list article').forEach((e,i)=>{e.classList.add('reveal');e.style.setProperty('--reveal-delay',`${Math.min(i%4*65,195)}ms`);reveal.observe(e)});
    if(video)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncVideo()},{threshold:0}).observe(video);
  }
  sync();
  let frame=0;
  function scrollUpdate(){frame=0;const max=document.documentElement.scrollHeight-innerHeight;body.style.setProperty('--reading-progress',max>0?Math.min(1,scrollY/max):0);body.classList.toggle('scrolled',scrollY>60);if(!paused)body.style.setProperty('--scene-scroll',Math.min(1,scrollY/innerHeight))}
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(scrollUpdate)},{passive:true});scrollUpdate();
  const hero=document.querySelector('.cinema-hero');
  if(hero&&matchMedia('(pointer:fine)').matches){let pointerFrame=0;hero.addEventListener('pointermove',e=>{if(paused||pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{hero.style.setProperty('--pointer-x',((e.clientX/innerWidth)-.5)*2);hero.style.setProperty('--pointer-y',((e.clientY/innerHeight)-.5)*2);pointerFrame=0})});hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--pointer-x',0);hero.style.setProperty('--pointer-y',0)})}
  document.querySelectorAll('.spirit-card').forEach(card=>{const flip=card.querySelector('.spirit-card-flip'),tilt=card.querySelector('.spirit-card-tilt');flip.addEventListener('click',()=>{const state=card.classList.toggle('is-flipped');flip.setAttribute('aria-pressed',String(state));flip.setAttribute('aria-label',(state?'Voltar à carta de ':'Revelar a carta de ')+ELEMENTS[[...card.classList].find(k=>ELEMENTS[k])].name)});if(matchMedia('(pointer:fine)').matches){card.addEventListener('pointermove',e=>{if(paused)return;const r=card.getBoundingClientRect();tilt.style.transform=`perspective(1000px) rotateX(${(e.clientY-r.top-r.height/2)/r.height*-9}deg) rotateY(${(e.clientX-r.left-r.width/2)/r.width*12}deg)`});card.addEventListener('pointerleave',()=>{tilt.style.transform=''})}});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||paused||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||a.target||a.hasAttribute('download'))return;const url=new URL(a.href);if(url.origin!==location.origin||url.pathname===location.pathname||!url.pathname.endsWith('.html'))return;e.preventDefault();body.classList.add('page-leaving');setTimeout(()=>location.assign(url.href),220)});
  addEventListener('pageshow',()=>body.classList.remove('page-leaving'));
  requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.add('page-ready')));
})();
