(() => {
 'use strict';
 const projects = window.nolhanProjects || [];
 const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const titleOf = card => card.querySelector('h3')?.textContent.trim() || '';
 const cards = [...document.querySelectorAll('.project-card')];
 const indexPage = document.querySelector('.page-intro') && cards.length;
 if(indexPage){
  const intro=document.querySelector('.page-intro');
  const toolbar=document.createElement('div');toolbar.className='project-toolbar';
  const filters=document.createElement('div');filters.className='project-filters';filters.setAttribute('aria-label','Filtrer les projets');
  const search=document.createElement('input');search.className='project-search';search.type='search';search.placeholder='Rechercher un projet…';search.setAttribute('aria-label','Rechercher un projet');
  const count=document.createElement('p');count.className='result-count';count.setAttribute('role','status');count.setAttribute('aria-live','polite');
  let selected='Tous';
  const categories=['Tous','Design','Vidéo','Communication','Web','Photo'];
  const update=()=>{
   let total=0;
   cards.forEach(card=>{
    const meta=projects.find(p=>p.title===titleOf(card));
    const match=(selected==='Tous'||meta?.categories.some(c=>normalize(c)===normalize(selected)))&&normalize(card.textContent).includes(normalize(search.value));
    const item=card.closest('.wp-block-post')||card;item.hidden=!match;if(match)total++;
   });
   count.textContent=total+' projet'+(total!==1?'s':'')+(total===0?' · Essaie une autre recherche.':'');
  };
  categories.forEach(category=>{
   const button=document.createElement('button');button.type='button';button.textContent=category;button.setAttribute('aria-pressed',String(category===selected));
   button.addEventListener('click',()=>{selected=category;filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update()});filters.append(button);
  });
  search.addEventListener('input',update);toolbar.append(filters,search);intro.append(toolbar,count);update();
 }
 document.querySelectorAll('.site-header nav a').forEach(link=>{
  const current=new URL(location.href).pathname.replace(/\/$/,'').replace(/\/index\.html$/,'');
  const target=new URL(link.href).pathname.replace(/\/$/,'').replace(/\/index\.html$/,'');
  if(current===target)link.setAttribute('aria-current','page');
 });
 const reading=document.querySelector('.reading-page');
 const title=reading?.querySelector('h1');
 const project=projects.find(p=>p.title===title?.textContent.trim());
 if(!reading||!project)return;
 const staticMode=location.pathname.endsWith('.html');
 const route=slug=>staticMode?slug+'.html':'/'+slug+'/';
 const backHref=staticMode?'projets.html':'/projets/';
 const source=reading.querySelector('.wp-block-post-content')||reading;
 const gallery=source.querySelector('.gallery-grid');
 let pictures=gallery?[...gallery.querySelectorAll('img')]:[];
 if(!pictures.length)pictures=[...source.querySelectorAll('figure img')].slice(0,1);
 if(!pictures.length)return;
 const imageData=pictures.map(img=>({src:img.currentSrc||img.src,alt:img.alt}));
 const outer=document.createElement('div');outer.className='detail-layout';
 const viewer=document.createElement('section');viewer.className='detail-viewer';viewer.setAttribute('aria-label','Galerie du projet');
 const caption=document.createElement('div');caption.className='detail-caption';caption.innerHTML='<span>Galerie · '+imageData.length+' visuel'+(imageData.length>1?'s':'')+'</span><span>Voir en grand</span>';
 const stage=document.createElement('button');stage.className='detail-stage';stage.type='button';stage.setAttribute('aria-label','Agrandir le visuel');
 const image=document.createElement('img');stage.append(image);
 const controls=document.createElement('div');controls.className='detail-controls';
 const prev=document.createElement('button');prev.type='button';prev.textContent='Précédent';prev.setAttribute('aria-label','Image précédente');
 const counter=document.createElement('span');counter.setAttribute('aria-live','polite');
 const next=document.createElement('button');next.type='button';next.textContent='Suivant';next.setAttribute('aria-label','Image suivante');controls.append(prev,counter,next);
 const thumbs=document.createElement('div');thumbs.className='detail-thumbs';let active=0;
 const show=i=>{active=(i+imageData.length)%imageData.length;image.src=imageData[active].src;image.alt=imageData[active].alt;counter.textContent=(active+1)+' / '+imageData.length;thumbs.querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===active)))};
 imageData.forEach((picture,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Afficher le visuel '+(i+1));const thumb=document.createElement('img');thumb.src=picture.src;thumb.alt='';thumb.loading='lazy';b.append(thumb);b.addEventListener('click',()=>show(i));thumbs.append(b)});
 prev.addEventListener('click',()=>show(active-1));next.addEventListener('click',()=>show(active+1));prev.disabled=next.disabled=imageData.length<2;
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(active-1)}if(e.key==='ArrowRight'){e.preventDefault();show(active+1)}});
 viewer.append(caption,stage,controls,thumbs);show(0);
 const dialog=document.createElement('dialog');dialog.className='image-dialog';dialog.setAttribute('aria-label','Visuel du projet en grand');
 const large=document.createElement('img');const close=document.createElement('button');close.type='button';close.textContent='Fermer';close.addEventListener('click',()=>dialog.close());dialog.append(large,close);document.body.append(dialog);
 stage.addEventListener('click',()=>{large.src=image.src;large.alt=image.alt;dialog.showModal()});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 const info=document.createElement('section');info.className='detail-info';
 const meta=document.createElement('p');meta.className='detail-meta';meta.textContent=String(projects.indexOf(project)+1).padStart(2,'0')+' / '+project.year;
 info.append(meta,title);
 const tags=document.createElement('div');tags.className='detail-tags';project.categories.forEach(c=>{const tag=document.createElement('span');tag.textContent=c;tags.append(tag)});info.append(tags);
 [...source.children].forEach(node=>{
  if(node===title||node.tagName==='FIGURE'||node===gallery||node.classList.contains('wp-block-post-terms'))return;
  if(node.tagName==='H2'&&node.textContent.trim()==='Réalisations')return;
  if(node.tagName==='P'&&node.querySelector('a')?.textContent.includes('Retour aux projets'))return;
  info.append(node);
 });
 const nav=document.createElement('nav');nav.className='detail-nav';nav.setAttribute('aria-label','Navigation entre les projets');
 const at=projects.indexOf(project);[[-1,'Projet précédent'],[1,'Projet suivant']].forEach(([offset,label])=>{const adjacent=projects[(at+offset+projects.length)%projects.length];const link=document.createElement('a');link.href=route(adjacent.slug);link.textContent=label;link.setAttribute('aria-label',label+' : '+adjacent.title);nav.append(link)});info.append(nav);
 const back=document.createElement('a');back.href=backHref;back.className='project-back';back.textContent='← Tous les projets';
 outer.append(viewer,info);reading.replaceChildren(back,outer);reading.classList.add('project-detail');
})();

(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animated = new Set();
  const reveal = (element, delay = 0) => {
    if (preference.matches || !element.animate) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(22px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    animated.add(animation);
    animation.finished.then(() => animated.delete(animation)).catch(() => animated.delete(animation));
  };
  const hero = document.querySelector('main .hero');
  if (hero) Array.from(hero.children).forEach((child, index) => reveal(child, index * 70));
  const targets = document.querySelectorAll('main .project-card, main .section > h2, main .about-band, main .contact-band, main .skills-grid > div, main .gallery-grid > figure');
  let observer;
  if ('IntersectionObserver' in window && !preference.matches) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    targets.forEach(target => observer.observe(target));
  }
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    observer?.disconnect();
    animated.forEach(animation => animation.cancel());
    animated.clear();
  });
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    scheduled = false;
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', update);
  update();
})();
