(() => {
  const labels=['Overview','Trends','Photos','Calendar','Your month'];
  const tracks=[...document.querySelectorAll('.copy-track, .detail-track')];
  const screens=[...document.querySelectorAll('.screen-slide')];
  const stage=document.querySelector('#stage'), journey=document.querySelector('#tour-journey');
  const prev=document.querySelector('#prev'), next=document.querySelector('#next'), status=document.querySelector('#status');
  const hero=document.querySelector('#brief'), reduced=matchMedia('(prefers-reduced-motion: reduce)'), mobile=matchMedia('(max-width: 800px)');
  let index=0, scheduled=false, snapTimer;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function announce(i){
    const target=clamp(i,0,labels.length-1);if(target===index && status.dataset.ready)return;
    index=target;status.dataset.ready='true';status.textContent=`${String(index+1).padStart(2,'0')} / 05 — ${labels[index]}`;
    prev.disabled=index===0;next.disabled=index===labels.length-1;
    document.querySelectorAll('.copy-track .slide, .detail-track .slide').forEach((slide,j)=>slide.setAttribute('aria-hidden',j%labels.length===index?'false':'true'));
  }
  function setPosition(pos){
    tracks.forEach(track=>track.style.transform=`translate3d(0, ${-100*pos}%, 0)`);
    screens.forEach((screen,i)=>{screen.style.transform=`translate3d(0, ${clamp(i-pos,0,1)*100}%, 0)`;});
    announce(Math.round(pos));
  }
  function update(){
    scheduled=false;
    if(!mobile.matches){
      const heroRect=hero.getBoundingClientRect();
      const heroTravel=Math.max(1,Math.min(hero.offsetHeight-innerHeight,innerHeight*.9));
      const p=reduced.matches?1:clamp(-heroRect.top/heroTravel,0,1);
      hero.style.setProperty('--intro-progress',p.toFixed(4));
      const rect=journey.getBoundingClientRect(), travel=Math.max(1,journey.offsetHeight-innerHeight);
      const pos=clamp(-rect.top/travel,0,1)*(labels.length-1);
      setPosition(reduced.matches ? Math.round(pos) : pos);
    } else {
      hero.style.removeProperty('--intro-progress');
    }
  }
  function requestUpdate(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
  function settleTour(){
    if(mobile.matches)return;
    const rect=journey.getBoundingClientRect(), travel=journey.offsetHeight-innerHeight;
    if(travel<=0 || rect.top>0 || -rect.top>travel)return;
    const pos=clamp(-rect.top/travel,0,1)*(labels.length-1);
    const nearest=Math.round(pos);
    if(Math.abs(pos-nearest)>.003)goTo(nearest);
  }
  function onScroll(){
    requestUpdate();
    clearTimeout(snapTimer);
    snapTimer=setTimeout(settleTour,160);
  }
  function goTo(i){
    const target=clamp(i,0,labels.length-1);
    if(mobile.matches){setPosition(target);return;}
    const top=journey.getBoundingClientRect().top+window.scrollY;
    const travel=Math.max(0,journey.offsetHeight-innerHeight);
    window.scrollTo({top:top+travel*target/(labels.length-1),behavior:reduced.matches?'instant':'smooth'});
  }
  prev.addEventListener('click',()=>goTo(index-1));next.addEventListener('click',()=>goTo(index+1));
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',requestUpdate,{passive:true});
  document.addEventListener('keydown',e=>{
    const rect=stage.getBoundingClientRect();
    if(rect.top>innerHeight*.65||rect.bottom<innerHeight*.35||e.target.matches('input,textarea,select,button,a'))return;
    if(e.key==='ArrowRight'){e.preventDefault();goTo(index+1)}else if(e.key==='ArrowLeft'){e.preventDefault();goTo(index-1)}
  });
  const views={overview:{position:0,alt:'Lumeria overview screen',tag:'Latest scan',description:'Your latest score, change, and scan are together on the overview.'},trends:{position:1,alt:'Lumeria trends screen',tag:'Scores over time',description:'See scores next to product dates and other events.'},recap:{position:2,alt:'Lumeria monthly recap screen',tag:'Your month',description:'Review the scans, scores, and notes from the month.'}};
  const screen=document.querySelector('#highlight-screen'),tag=document.querySelector('#highlight-tag'),description=document.querySelector('#highlight-description');
  document.querySelectorAll('.highlight-choice').forEach(button=>button.addEventListener('click',()=>{
    const data=views[button.dataset.view];
    document.querySelectorAll('.highlight-choice').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
    screen.querySelectorAll('.highlight-screen-track img').forEach((image,i)=>{image.style.transform=`translate3d(0, ${i<=data.position ? 0 : 100}%, 0)`;});screen.setAttribute('aria-label',data.alt);tag.textContent=data.tag;description.textContent=data.description;
  }));
  announce(0);requestUpdate();
})();
