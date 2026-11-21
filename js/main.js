/* Efectos de la web de BTI Software. Un solo archivo para todas las páginas: cada parte solo se activa si su sección está en la página. */
const $ = id => document.getElementById(id);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* Título de la portada: palabra a palabra */
const ht = $('hero-title');
if (ht) {
  ht.innerHTML = ht.textContent.split(' ').map((w, i) => `<span class="w" style="transition-delay:${.15 + i * .07}s">${w}</span>`).join(' ');
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector('.hero').classList.add('go')));
}

/* Revelado al entrar en pantalla y contadores */
function countUp(el) {
  const to = +el.dataset.count, t0 = performance.now(), d = calm ? 0 : 1400;
  const f = t => { const p = d ? clamp((t - t0) / d) : 1; el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  const n = e.target.querySelector('[data-count]');
  if (n) countUp(n);
}), { threshold: .12 });
document.querySelectorAll('.rv, .fl').forEach(el => io.observe(el));

/* Abanico de móviles de la portada: se abre al bajar y sigue un poco al ratón (en el móvil, solo con el desplazamiento) */
const fan = [...document.querySelectorAll('#fan .phone')];
let mx = 0, my = 0;
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; } }, { passive: true });
function paintFan() {
  if (!fan.length) return;
  const narrow = innerWidth < 600;
  const p = calm ? .6 : clamp(scrollY / (innerHeight * .8));
  const open = (.35 + p * .65) * (narrow ? .8 : 1);
  fan.forEach(ph => {
    const i = +ph.dataset.i;
    const x = i * 62 * open, y = Math.abs(i) * (40 - 26 * p) - p * 40, r = i * 9 * open, s = i ? .86 : 1 + p * .04;
    ph.style.transform = `translateX(calc(-50% + ${x}%)) translateY(${y}px) rotateZ(${r}deg) rotateY(${mx * 14 - i * 6 * open}deg) rotateX(${-my * 8}deg) scale(${s})`;
    ph.style.zIndex = i ? 1 : 2;
  });
}

/* Historia con el móvil fijo: cambia de apartado según lo bajado */
const story = $('story');
const sts = story ? [...story.querySelectorAll('.st')] : [], simgs = story ? [...story.querySelectorAll('#story-phone img')] : [], sdots = story ? [...$('story-dots').children] : [];
let sIdx = 0;
function paintStory() {
  if (!story) return;
  const r = story.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight));
  const i = Math.min(2, Math.floor(p * 3));
  if (i !== sIdx) { sIdx = i; [sts, simgs, sdots].forEach(list => list.forEach((el, k) => el.classList.toggle('on', k === i))); }
}

/* Barra: progreso de lectura y modo oscuro sobre las secciones oscuras */
const nav = $('nav'), prog = $('progress'), darks = [...document.querySelectorAll('section.dark')];
function paintNav() {
  const h = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  nav.classList.toggle('on-dark', darks.some(d => { const r = d.getBoundingClientRect(); return r.top < 52 && r.bottom > 52; }));
}
/* Manifiesto de la filosofía: las palabras se encienden según lo bajado */
const mani = $('mani'), mt = $('mani-text');
const KEYS = ['entender,', 'porqué.', 'bolsillo.', 'persona.'];
const mws = mt ? (mt.innerHTML = mt.textContent.trim().split(/\s+/).map(w => `<span class="w${KEYS.includes(w) ? ' key' : ''}">${w}</span>`).join(' '), [...mt.children]) : [];
function paintMani() {
  if (!mani) return;
  const r = mani.getBoundingClientRect();
  const n = calm ? mws.length : Math.round(clamp(-r.top / (r.height - innerHeight) * 1.15) * mws.length);
  mws.forEach((w, k) => w.classList.toggle('on', k < n));
}
/* Escena 3D de TermikAI: se carga al acercarse y el scroll mueve el tiempo de la escena (con un poco de inercia) */
const film = $('film');
const fcaps = film ? [...film.querySelectorAll('.fc')] : [];
const FILM_DUR = 20.6, FILM_T0 = 1.3;   // el tráiler empieza en negro: se arranca con el salón ya a la vista
let fw = null, fcur = 1.3, flast = -1;
if (film) new IntersectionObserver((es, o) => {
  if (!es[0].isIntersecting) return; o.disconnect();
  const fr = $('film-frame'), ss = innerWidth < 700 ? 0.6 : Math.min(1.25, devicePixelRatio || 1);
  fr.onload = () => { const cw = fr.contentWindow; Promise.resolve(cw.READY).then(() => { cw.render(FILM_T0); fw = cw; film.classList.add('ready'); }); };
  fr.src = `3d/escena.html?t=0&ss=${ss}&web`;
}, { rootMargin: '150% 0px' }).observe(film);
function paintFilm() {
  if (!film) return;
  const r = film.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight)), tgt = FILM_T0 + p * (FILM_DUR - FILM_T0);
  fcur = calm ? tgt : fcur + (tgt - fcur) * .14;
  if (Math.abs(tgt - fcur) < .005) fcur = tgt;
  $('film-bar').style.transform = `scaleX(${p})`;
  film.classList.toggle('moved', p > .01);
  fcaps.forEach(c => c.classList.toggle('on', fcur >= +c.dataset.a && fcur < +c.dataset.b));
  if (fw && r.top < innerHeight && r.bottom > 0 && Math.abs(fcur - flast) > .004) { fw.render(fcur); flast = fcur; }
}
/* Filosofía: título palabra a palabra, cabecera que se aleja al bajar y siglas que se despliegan */
const pt = $('phil-title'), ph = $('phil-head');
if (pt) {
  let i = 0;
  const wrap = node => [...node.childNodes].forEach(c => {
    if (c.nodeType === 3) {
      const f = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) { f.append(w); return; }
        const s = document.createElement('span'); s.className = 'w'; s.textContent = w; s.style.transitionDelay = `${.15 + i++ * .12}s`; f.append(s);
      });
      c.replaceWith(f);
    } else wrap(c);
  });
  wrap(pt);
  requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.add('go')));
}
function paintPhil() {
  if (!ph || calm) return;
  const p = clamp(scrollY / (innerHeight * .7));
  ph.style.transform = `translateY(${p * 60}px) scale(${1 - p * .08})`;
  ph.style.opacity = 1 - p * .9;
}
const nameSec = $('name'), acro = nameSec ? [...nameSec.querySelectorAll('.acro > div')] : [];
function paintName() {
  if (!nameSec) return;
  const r = nameSec.getBoundingClientRect(), span = r.height - innerHeight;
  const p = calm || span < innerHeight * .3 ? 1 : clamp(-r.top / span);
  acro.forEach((d, k) => d.style.setProperty('--p', clamp((p - .08 - k * .24) / .3).toFixed(3)));
}
/* Recorrido de las seis ideas: la línea se rellena hasta el 60 % de la pantalla y enciende cada número */
const route = $('route'), rfill = $('route-fill'), ideas = route ? [...route.querySelectorAll('.idea')] : [];
function paintRoute() {
  if (!route) return;
  const r = route.getBoundingClientRect(), mid = innerHeight * .6;
  rfill.style.transform = `scaleY(${calm ? 1 : clamp((mid - r.top) / r.height)})`;
  ideas.forEach(d => { const t = d.querySelector('.dot').getBoundingClientRect(); d.classList.toggle('lit', calm || t.top + t.height / 2 < mid); });
}
function frame() { paintFan(); paintStory(); paintNav(); paintMani(); paintFilm(); paintPhil(); paintName(); paintRoute(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);

/* Brillo que sigue al ratón en las tarjetas */
/* Iconos de los principios: se dibujan al aparecer (cada trazo mide 1) */
document.querySelectorAll('.pr svg').forEach(s => s.querySelectorAll('path, circle, rect').forEach(el => { el.setAttribute('pathLength', 1); el.classList.add('draw'); }));
/* Inclinación 3D de las tarjetas de principios, solo con ratón */
document.querySelectorAll('.pr').forEach(c => {
  c.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || calm) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`); c.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    c.classList.add('tilt');
  });
  c.addEventListener('pointerleave', () => c.classList.remove('tilt'));
});
document.querySelectorAll('.branch, .pr').forEach(b => b.addEventListener('pointermove', e => {
  const r = b.getBoundingClientRect(); b.style.setProperty('--mx', `${e.clientX - r.left}px`); b.style.setProperty('--my', `${e.clientY - r.top}px`);
}));

/* Demo en vivo: se carga solo al pulsar, para no gastar datos */
const liveBtn = $('live-btn');
if (liveBtn) liveBtn.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = 'https://erikhvacdev.github.io/repelega-demo/'; f.title = 'Demo de la app de Fluidos'; f.allow = 'autoplay';
  liveBtn.replaceWith(f);
});

/* ---------- Lección de Eki: el cierre hidráulico (datos ya comprobados en la demo, CTE DB HS 5) ---------- */
if ($('board')) {
  const G = { block: 'M428 330 V196 H205', leak: 'M428 330 V196 H195 V215 Q195 252 163 252 Q131 252 131 215 V60', none: '' };
  const SCENES = [
    { say: '<b>¡Kaixo! Soy Eki.</b> Esto es un lavabo, su sifón y la bajante del edificio. ¿Por qué no huele a alcantarilla?', water: false, gas: 'none' },
    { say: 'Cada vez que usas el lavabo, un poco de agua se queda en la curva del sifón. Es el <b>cierre hidráulico</b>.', water: true, gas: 'none' },
    { say: 'Los gases de la red suben por la bajante… y el agua les <b>cierra el paso</b>. Por eso no huele.', water: true, gas: 'block', stop: true },
    { say: 'Pero si el tubo baja lleno de agua, tira de la que queda detrás y vacía el cierre. Es el <b>sifonado</b>. Sin agua, ¡huele!', water: false, gas: 'leak', smell: true },
    { say: 'La solución: dejar entrar aire justo después del sifón. Es la <b>ventilación terciaria</b>. El cierre conserva su agua.', water: true, gas: 'block', stop: true, vent: true },
    { say: 'Última pregunta. Lavabos y fregaderos, ¿a cuánta distancia de la bajante pueden ir <b>como mucho</b>?', water: true, gas: 'block', vent: true, quiz: true },
  ];
  const QUIZ = [['2,00 m', false], ['4,00 m', true], ['6,00 m', false]];
  let sc = 0, typing = 0;
  const ld = $('ldots'); ld.innerHTML = SCENES.map(() => '<i></i>').join('');
  const gases = kind => {
    const g = $('gases'); g.innerHTML = '';
    if (!G[kind]) return;
    for (let k = 0; k < 5; k++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', 6 + (k % 2) * 2); c.setAttribute('fill', '#A3B07A'); c.setAttribute('opacity', '.75');
      const a = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      a.setAttribute('dur', kind === 'leak' ? '3.6s' : '3s'); a.setAttribute('repeatCount', 'indefinite'); a.setAttribute('path', G[kind]);
      a.setAttribute('begin', `${-k * .6}s`);
      c.appendChild(a); g.appendChild(c);
    }
  };
  const type = html => {
    const box = $('say'), id = ++typing;
    if (calm) { box.innerHTML = html; return; }
    // Escribe letra a letra respetando las etiquetas <b>
    const parts = html.split(/(<[^>]+>)/); let out = '', pi = 0, ci = 0;
    const step = () => {
      if (id !== typing) return;
      if (pi >= parts.length) { box.innerHTML = out; return; }
      const part = parts[pi];
      if (part.startsWith('<')) { out += part; pi++; ci = 0; }
      else if (ci < part.length) out += part[ci++];
      else { pi++; ci = 0; }
      box.innerHTML = out + '<span class="caret"></span>';
      setTimeout(step, part.startsWith('<') ? 0 : 18);
    };
    step();
  };
  const confetti = () => {
    if (calm) return;
    const box = $('confetti'), cols = ['#0071E3', '#5E5CE6', '#2F8BDB', '#1E9E5A', '#2C7FA0'];
    for (let k = 0; k < 40; k++) {
      const i = document.createElement('i');
      i.style.background = cols[k % cols.length];
      i.style.setProperty('--x', `${(Math.random() - .5) * 520}px`); i.style.setProperty('--y', `${(Math.random() - .3) * 360}px`); i.style.setProperty('--r', `${Math.random() * 720}deg`);
      box.appendChild(i); setTimeout(() => i.remove(), 1300);
    }
  };
  const answer = b => {
    if (QUIZ[+b.dataset.k][1]) {
      b.classList.add('ok'); $('quiz').querySelectorAll('.opt').forEach(o => o.disabled = true);
      type('<b>¡Eso es! 4,00 m.</b> Más lejos, el sifonado se nota más y el cierre se vacía. Así es cada lección de la app.');
      confetti();
    } else {
      b.classList.add('ko'); b.disabled = true;
      type(b.textContent.startsWith('2') ? 'Casi: 2,00 m es lo que puede estar el <b>bote sifónico</b>. Para lavabos y fregaderos hay algo más de margen.' : 'Demasiado lejos: el sifonado vaciaría el cierre. Prueba con menos.');
    }
  };
  const show = i => {
    sc = i; const s = SCENES[i];
    $('water').classList.toggle('full', !!s.water);
    $('vent').classList.toggle('on', !!s.vent);
    $('stop').classList.toggle('on', !!s.stop);
    $('smell').classList.toggle('on', !!s.smell);
    gases(s.gas);
    type(s.say);
    const e = $('eki-img'); e.classList.remove('talk'); void e.offsetWidth; e.classList.add('talk');
    [...ld.children].forEach((d, k) => d.classList.toggle('on', k === i));
    $('prev').disabled = i === 0;
    $('next').textContent = i === SCENES.length - 1 ? 'Empezar otra vez' : 'Siguiente';
    const q = $('quiz'); q.hidden = !s.quiz;
    if (s.quiz) {
      q.innerHTML = QUIZ.map(([t], k) => `<button class="btn opt" data-k="${k}">${t}</button>`).join('');
      q.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(b));
    }
  };
  $('next').onclick = () => show(sc === SCENES.length - 1 ? 0 : sc + 1);
  $('prev').onclick = () => sc > 0 && show(sc - 1);
  // La lección arranca cuando se ve, para que la frase de Eki no se escriba sin que nadie mire
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { show(0); o.disconnect(); } }, { threshold: .35 }).observe($('board'));
}

/* QR (solo en la página de informes, que carga qrcodejs) */
if (window.QRCode) document.querySelectorAll('[data-qr]').forEach(el => {
  try { new QRCode(el, { text: el.dataset.qr, width: 260, height: 260, colorDark: '#1D1D1F', colorLight: '#FFFFFF', correctLevel: QRCode.CorrectLevel.M }); }
  catch (e) { el.textContent = el.dataset.qr; }
});

/* Contacto: copiar el email */
const mc = $('mail-copy');
if (mc) mc.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('mail-addr').textContent); mc.textContent = 'Copiado ✓'; }
  catch (e) { getSelection().selectAllChildren($('mail-addr')); mc.textContent = 'Seleccionado'; }
  setTimeout(() => mc.textContent = 'Copiar', 2000);
});
