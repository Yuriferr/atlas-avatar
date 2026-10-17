(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
  const body=document.body,button=document.querySelector('#motion-button');
  let paused=reduced.matches;
  try{paused=paused||localStorage.getItem('atlas-motion')==='paused'}catch{}
  if(ELEMENTS[page]){
    body.style.setProperty('--accent',ELEMENTS[page].color);
    const art={agua:'katara-cut.webp',terra:'toph-cut.webp',fogo:'zuko-cut.webp',ar:'aang-cut.webp'};
    const portrait=document.querySelector('.element-hero figure img');
    if(portrait){portrait.src='assets/'+art[page];portrait.alt=ELEMENTS[page].people[0][0]+' em arte oficial do Avatar Studios'}
  }
  if(page==='seven-havens'){
    const banner=document.querySelector('.havens-banner');banner.dataset.parallaxScene='flow';
    banner.insertAdjacentHTML('beforeend','<img class="havens-cutout" src="assets/pavi-geet-transparent.png" alt="Pavi e Geet em recorte adaptado da imagem oficial" data-speed="-90" data-pointer="20">');
  }
  body.insertAdjacentHTML('afterbegin','<div class="reading-progress" aria-hidden="true"></div><div class="route-curtain" aria-hidden="true"></div>');
  const scenes=[...document.querySelectorAll('[data-parallax-scene]')].map(el=>({el,stage:el.querySelector('.painted-stage'),px:0,py:0,layers:[...el.querySelectorAll('[data-speed]')].map(node=>({node,speed:Number(node.dataset.speed)||0,pointer:Number(node.dataset.pointer)||0,x:0,y:0}))}));
  let frame=0;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function layoutHero(){
    for(const scene of scenes){
      if(!scene.stage)continue;
      const width=scene.stage.clientWidth,height=scene.stage.clientHeight;
      const scale=Math.max(width*1.16/1600,height*1.24/900);
      // Ground the finite character cutout just behind y=740 in the common SVG canvas.
      scene.stage.style.setProperty('--hero-character-bottom',Math.max(16,160*scale-height*.12).toFixed(2)+'px');
    }
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
  function render(){
    frame=0;let moving=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    body.style.setProperty('--reading-progress',max>0?Math.max(0,Math.min(1,scrollY/max)):0);
    body.classList.toggle('scrolled',scrollY>60);
    for(const scene of scenes){
      const r=scene.el.getBoundingClientRect();
      let progress=0;
      if(scene.el.dataset.parallaxScene==='sticky'){
        const distance=Math.max(1,r.height-(scene.stage?.offsetHeight||innerHeight));
        progress=Math.max(0,Math.min(1,-r.top/distance));
      }else{progress=Math.max(-1,Math.min(1,(innerHeight*.5-r.top-r.height*.5)/innerHeight))}
      const mobileFactor=innerWidth<=760?.5:1;
      const heroScale=scene.stage?clamp(scene.stage.offsetHeight/900,.65,1.2):1;
      for(const layer of scene.layers){
        const x=paused?0:scene.px*layer.pointer*mobileFactor;
        const y=paused?0:(progress*layer.speed*heroScale+scene.py*layer.pointer*.3)*mobileFactor;
        layer.x=paused?0:layer.x+(x-layer.x)*.13;
        layer.y=paused?0:layer.y+(y-layer.y)*.13;
        if(Math.abs(x-layer.x)>.1||Math.abs(y-layer.y)>.1)moving=true;
        layer.node.style.setProperty('--layer-x',layer.x.toFixed(2)+'px');
        layer.node.style.setProperty('--layer-y',layer.y.toFixed(2)+'px');
      }
    }
    if(moving)schedule();
  }
  function sync(){
    body.classList.toggle('motion-paused',paused);body.classList.toggle('motion-active',!paused);
    button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Reproduzir animações':'Pausar animações');button.querySelector('span').textContent=paused?'▷':'Ⅱ';
    if(paused)document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in-view'));
    schedule();
  }
  button.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('atlas-motion',paused?'paused':'playing')}catch{}sync()});
  reduced.addEventListener('change',e=>{paused=e.matches;sync()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()});
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{layoutHero();schedule()},{passive:true});
  if('ResizeObserver' in window){const observer=new ResizeObserver(()=>{layoutHero();schedule()});for(const scene of scenes)if(scene.stage)observer.observe(scene.stage)}
  for(const scene of scenes){scene.el.addEventListener('pointermove',e=>{if(paused||!fine.matches)return;const r=(scene.stage||scene.el).getBoundingClientRect();scene.px=clamp((e.clientX-r.left)/r.width-.5,-.5,.5);scene.py=clamp((e.clientY-r.top)/r.height-.5,-.5,.5);schedule()});scene.el.addEventListener('pointerleave',()=>{scene.px=scene.py=0;schedule()})}
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in-view');reveal.unobserve(e.target)}},{threshold:.07,rootMargin:'0px 0px -10px 0px'});
    document.querySelectorAll('.section-head,.world-intro>div,.spirit-card,.era-card,.new-era,.cycle-callout>h2,.book-card,.person-card,.avatar-card,.timeline article,.technique-grid article,.place-list article').forEach((e,i)=>{e.classList.add('reveal');e.style.setProperty('--reveal-delay',Math.min(i%4*55,165)+'ms');reveal.observe(e)});
  }
  document.querySelectorAll('.spirit-card').forEach(card=>{
    const flip=card.querySelector('.spirit-card-flip'),tilt=card.querySelector('.spirit-card-tilt');
    flip.addEventListener('click',()=>{const state=card.classList.toggle('is-flipped');flip.setAttribute('aria-pressed',String(state));flip.setAttribute('aria-label',(state?'Voltar à carta de ':'Revelar a carta de ')+ELEMENTS[[...card.classList].find(k=>ELEMENTS[k])].name)});
    card.addEventListener('pointermove',e=>{if(paused||!fine.matches)return;const r=card.getBoundingClientRect();tilt.style.transform=`perspective(1000px) rotateX(${(e.clientY-r.top-r.height/2)/r.height*-7}deg) rotateY(${(e.clientX-r.left-r.width/2)/r.width*10}deg)`});
    card.addEventListener('pointerleave',()=>{tilt.style.transform=''});
  });
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||paused||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||a.target||a.hasAttribute('download'))return;const url=new URL(a.href);if(url.origin!==location.origin||url.pathname===location.pathname||!url.pathname.endsWith('.html'))return;e.preventDefault();body.classList.add('page-leaving');setTimeout(()=>location.assign(url.href),180)});
  addEventListener('pageshow',()=>{body.classList.remove('page-leaving');schedule()});
  layoutHero();sync();body.classList.add('page-ready');
})();
