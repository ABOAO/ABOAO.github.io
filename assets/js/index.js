// ---- clock ----
(function(){
  const el = document.querySelector('#clock b');
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    const d = new Date();
    el.textContent = pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  }
  tick(); setInterval(tick,1000);
})();

// ---- matrix rain ----
(function(){
  const c = document.getElementById('matrix');
  const ctx = c.getContext('2d');
  let w,h,cols,drops;
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ0123456789{}[]<>/*+-=_#$%';
  function resize(){
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    cols = Math.floor(w/16);
    drops = Array(cols).fill(0).map(()=>Math.random()*-100);
  }
  resize();
  addEventListener('resize',resize);
  function draw(){
    ctx.fillStyle = 'rgba(10,13,10,0.08)';
    ctx.fillRect(0,0,w,h);
    ctx.font = '14px JetBrains Mono, monospace';
    for(let i=0;i<cols;i++){
      const txt = chars[Math.floor(Math.random()*chars.length)];
      const x = i*16, y = drops[i]*16;
      ctx.fillStyle = y<20 ? '#caffe8' : '#00ff9c';
      ctx.globalAlpha = y<20 ? 0.9 : 0.55;
      ctx.fillText(txt, x, y);
      if(y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
    ctx.globalAlpha = 1;
  }
  setInterval(draw,55);
})();

// ---- live HUD timer on portrait ----
(function(){
  const el = document.querySelector('.portrait-hud.tl .dim');
  if(!el) return;
  let t = 0;
  setInterval(()=>{
    t++;
    const h = String(Math.floor(t/3600)%24).padStart(2,'0');
    const m = String(Math.floor(t/60)%60).padStart(2,'0');
    const s = String(t%60).padStart(2,'0');
    el.textContent = h+':'+m+':'+s;
  }, 1000);
  // drift match %
  const match = document.querySelector('.portrait-hud.br');
  if(match){
    setInterval(()=>{
      const v = (99.3 + Math.random()*0.6).toFixed(1);
      match.innerHTML = 'MATCH '+v+'%<br><span class="dim">MASK_PATTERN</span>';
    }, 1200);
  }
})();

// ---- form submit animation (form still posts to Google Apps Script via hidden iframe) ----
function submitForm(f){
  const btn = f.querySelector('button[type=submit]');
  const orig = btn.textContent;
  btn.textContent = 'transmitting...';
  btn.disabled = true;
  setTimeout(()=>{
    btn.textContent = 'signal_received ✓';
    btn.style.background = 'var(--green)';
    btn.style.color = '#04160a';
    setTimeout(()=>{ btn.textContent = orig; btn.disabled=false; btn.style.background=''; btn.style.color=''; f.reset(); }, 2200);
  }, 900);
}
