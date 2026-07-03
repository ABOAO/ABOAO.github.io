/* ============================================================
   CYBER-FX — behavior layer for wch.sys
   boot · matrix · cursor · click fx · scramble · tilt ·
   reveal · CLI · konami · sfx · ambient glitch
   ============================================================ */
(function(){
"use strict";
var html = document.documentElement;
html.classList.add('fx');
var RM   = matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE = matchMedia('(pointer: fine)').matches;

function mod(fn){ try{ fn(); }catch(e){ console.warn('[fx]', e); } }
function $(s,c){ return (c||document).querySelector(s); }
function $$(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }

/* ---------- toast ---------- */
var toastEl=null, toastT=null;
function toast(msg, ms){
  if(!toastEl){ toastEl=document.createElement('div'); toastEl.id='toast'; document.body.appendChild(toastEl); }
  toastEl.textContent=msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(function(){ toastEl.classList.remove('show'); }, ms||2600);
}

/* ---------- sfx (WebAudio, off by default) ---------- */
var SFX={ on: localStorage.getItem('abao_sfx')==='1', ctx:null };
function beep(freq,dur,type,vol){
  if(!SFX.on) return;
  try{
    if(!SFX.ctx) SFX.ctx=new (window.AudioContext||window.webkitAudioContext)();
    var ctx=SFX.ctx;
    if(ctx.state==='suspended') ctx.resume();
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type||'sine'; o.frequency.value=freq;
    g.gain.setValueAtTime(vol||0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+(dur||0.05));
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+(dur||0.05)+0.02);
  }catch(e){}
}
mod(function(){
  var btn=$('#sfxBtn'); if(!btn) return;
  function paint(){ btn.classList.toggle('on',SFX.on); btn.querySelector('b').textContent=SFX.on?'ON':'OFF'; }
  paint();
  btn.addEventListener('click',function(){
    SFX.on=!SFX.on;
    localStorage.setItem('abao_sfx',SFX.on?'1':'0');
    paint();
    if(SFX.on){ beep(880,.06,'square',.05); toast('SFX ENABLED — 音效已開啟'); }
  });
});

/* ---------- clock ---------- */
mod(function(){
  var el=$('#clock b'); if(!el) return;
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){ var d=new Date(); el.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds()); }
  tick(); setInterval(tick,1000);
});

/* ---------- matrix rain (rAF, pausable, speed factor) ---------- */
var MTX={ speed:1 };
mod(function(){
  var c=$('#matrix'); if(!c) return;
  var ctx=c.getContext('2d'), w,h,cols,drops;
  var chars='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ0123456789{}[]<>/*+-=_#$%';
  function resize(){
    w=c.width=innerWidth; h=c.height=innerHeight;
    cols=Math.floor(w/16);
    drops=Array(cols).fill(0).map(function(){return Math.random()*-100;});
  }
  resize(); addEventListener('resize',resize);
  function draw(){
    ctx.fillStyle='rgba(10,13,10,0.08)'; ctx.fillRect(0,0,w,h);
    ctx.font='14px JetBrains Mono, monospace';
    for(var i=0;i<cols;i++){
      var txt=chars[Math.floor(Math.random()*chars.length)];
      var x=i*16, y=drops[i]*16;
      ctx.fillStyle=y<20?'#caffe8':'#00ff9c';
      ctx.globalAlpha=y<20?0.9:0.55;
      ctx.fillText(txt,x,y);
      if(y>h && Math.random()>0.975) drops[i]=0;
      drops[i]+=1;
    }
    ctx.globalAlpha=1;
  }
  var last=0;
  function loop(t){
    requestAnimationFrame(loop);
    if(document.hidden) { last=t; return; }
    var interval = (RM?110:55)/MTX.speed;
    if(t-last>=interval){ last=t; draw(); }
  }
  requestAnimationFrame(loop);
});

/* ---------- smooth section jump (no scrollIntoView) ---------- */
function goTo(sel){
  var el=$(sel); if(!el) return false;
  var y=el.getBoundingClientRect().top + window.scrollY - 58;
  window.scrollTo({top:Math.max(0,y), behavior:RM?'auto':'smooth'});
  return true;
}

/* ---------- boot sequence ---------- */
mod(function(){
  var boot=$('#boot'); if(!boot) return;
  var skipStored = sessionStorage.getItem('abao_boot')==='1';
  function kill(){
    html.classList.remove('booting');
    boot.classList.add('done');
    setTimeout(function(){ boot.remove(); },500);
    sessionStorage.setItem('abao_boot','1');
    removeEventListener('keydown',skip,true);
    removeEventListener('pointerdown',skip,true);
  }
  if(skipStored || RM){ boot.remove(); return; }
  html.classList.add('booting');
  var log=$('#bootLog'), bar=$('#bootBar');
  var LINES=[
    '> POST self_test ................ OK',
    '> mem_check 31y_experience ...... OK',
    '> mount /skills ................. OK',
    '> load rebellion.mod ............ OK',
    '> decrypt identity_0xA8A0 ....... OK',
    '> uplink TAIPEI.TW · UTC+08 ..... OK',
    '> exec session: abao@wch  █'
  ];
  var total=LINES.join('').length, typed=0, li=0, ci=0, killed=false;
  function skip(){ if(killed) return; killed=true; kill(); }
  addEventListener('keydown',skip,true);
  addEventListener('pointerdown',skip,true);
  function step(){
    if(killed) return;
    if(li>=LINES.length){
      bar.style.width='100%';
      beep(1320,.09,'square',.05);
      setTimeout(function(){ killed=true; kill(); },420);
      return;
    }
    var line=LINES[li];
    if(ci<line.length){
      log.textContent+=line[ci++]; typed++;
      bar.style.width=Math.min(100, typed/total*100)+'%';
      if(ci%3===0) beep(2100+Math.random()*400,.012,'square',.012);
      setTimeout(step, 7+Math.random()*10);
    }else{
      log.textContent+='\n'; li++; ci=0;
      setTimeout(step, 90+Math.random()*110);
    }
  }
  setTimeout(step, 250);
});

/* ---------- scroll progress + active nav ---------- */
mod(function(){
  var prog=$('#scrollProg');
  var links=$$('.tb-nav a');
  var map={};
  links.forEach(function(a){ map[a.getAttribute('href')]=a; });
  function onScroll(){
    if(prog){
      var max=document.documentElement.scrollHeight-innerHeight;
      prog.style.width=(max>0? (scrollY/max*100):0)+'%';
    }
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  // active section
  var secs=$$('section[id]');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(a){ a.classList.remove('active'); });
          var a=map['#'+e.target.id]; if(a) a.classList.add('active');
        }
      });
    },{rootMargin:'-38% 0px -55% 0px'});
    secs.forEach(function(s){ io.observe(s); });
  }
  // intercept nav clicks for offset-aware smooth scroll
  links.forEach(function(a){
    a.addEventListener('click',function(ev){
      var href=a.getAttribute('href');
      if(href && href[0]==='#'){ ev.preventDefault(); goTo(href); history.replaceState(null,'',href); }
      beep(1500,.03,'sine',.03);
    });
  });
});

/* ---------- custom cursor ---------- */
mod(function(){
  if(!FINE || RM) return;
  html.classList.add('cur');
  var dot=document.createElement('div'); dot.id='curDot';
  var ring=document.createElement('div'); ring.id='curRing';
  document.body.appendChild(ring); document.body.appendChild(dot);
  var mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,seen=false;
  addEventListener('mousemove',function(e){
    mx=e.clientX; my=e.clientY;
    if(!seen){ seen=true; rx=mx; ry=my; }
    dot.style.transform='translate('+(mx-2.5)+'px,'+(my-2.5)+'px)';
    var t=e.target;
    var hov = t.closest && t.closest('a,button,.btn,.note,.chip,.sfx-btn,label');
    var txt = t.closest && t.closest('input,textarea');
    dot.classList.toggle('hov',!!hov); ring.classList.toggle('hov',!!hov);
    dot.classList.toggle('txt',!!txt); ring.classList.toggle('txt',!!txt);
  },{passive:true});
  (function follow(){
    rx+=(mx-rx)*0.16; ry+=(my-ry)*0.16;
    ring.style.transform='translate('+(rx-16-(ring.classList.contains('hov')?7:0))+'px,'+(ry-16-(ring.classList.contains('hov')?7:0))+'px)';
    requestAnimationFrame(follow);
  })();
  document.addEventListener('mouseleave',function(){ dot.style.opacity=ring.style.opacity='0'; });
  document.addEventListener('mouseenter',function(){ dot.style.opacity=ring.style.opacity='1'; });
});

/* ---------- click fx: ring + particles + occasional jolt ---------- */
function jolt(){
  var w=$('.wrap'); if(!w) return;
  w.classList.remove('jolt'); void w.offsetWidth; w.classList.add('jolt');
  setTimeout(function(){ w.classList.remove('jolt'); },200);
}
mod(function(){
  if(RM) return;
  addEventListener('pointerdown',function(e){
    if(e.pointerType==='touch') return;
    var ring=document.createElement('div'); ring.className='fx-ring';
    ring.style.left=e.clientX+'px'; ring.style.top=e.clientY+'px';
    document.body.appendChild(ring);
    setTimeout(function(){ ring.remove(); },520);
    for(var i=0;i<6;i++){
      var p=document.createElement('div'); p.className='fx-p';
      p.style.left=e.clientX+'px'; p.style.top=e.clientY+'px';
      document.body.appendChild(p);
      var ang=Math.random()*Math.PI*2, dist=22+Math.random()*30;
      p.animate([
        {transform:'translate(0,0)',opacity:1},
        {transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px)',opacity:0}
      ],{duration:380+Math.random()*180,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=function(){ this.effect.target.remove(); };
    }
    beep(160,.05,'square',.035);
    if(Math.random()<0.16) jolt();
  },{passive:true});
  // hover blips
  document.addEventListener('mouseover',function(e){
    if(e.target.closest && e.target.closest('a,button,.btn,.cap,.wcard,.note')) beep(1400,.02,'sine',.015);
  },{passive:true});
});

/* ---------- text scramble / decode ---------- */
var GLYPHS='!<>-_\\/[]{}—=+*^?#01アイウエオ';
function scramble(el,speed){
  if(RM) return;
  if(el.__scr) clearInterval(el.__scr);
  var orig=el.dataset.orig||(el.dataset.orig=el.textContent);
  var len=orig.length, frames=Math.min(16,6+len), f=0;
  el.__scr=setInterval(function(){
    f++;
    var s='';
    for(var i=0;i<len;i++){
      s += (i < f/frames*len) ? orig[i] : (orig[i]===' '?' ':GLYPHS[(Math.random()*GLYPHS.length)|0]);
    }
    el.textContent=s;
    if(f>=frames){ clearInterval(el.__scr); el.__scr=null; el.textContent=orig; }
  }, speed||30);
}
mod(function(){
  // decode section titles on first view
  var els=$$('[data-decode]');
  if('IntersectionObserver' in window && !RM){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ scramble(e.target); io.unobserve(e.target); }
      });
    },{threshold:.4});
    els.forEach(function(el){ io.observe(el); });
  }
  // nav link scramble on hover
  $$('.tb-nav a').forEach(function(a){
    a.addEventListener('mouseenter',function(){ scramble(a,22); });
  });
});

/* ---------- scroll reveal (staggered per section) ---------- */
mod(function(){
  var sel='.sec-tag,.sec-title,.sec-sub,.who-card,.cap,.wcard,.note,.form,.contact-left';
  var els=$$(sel);
  if(!('IntersectionObserver' in window)) return;
  var counts=new Map();
  els.forEach(function(el){
    var s=el.closest('.sec')||document.body;
    var n=counts.get(s)||0; counts.set(s,n+1);
    el.classList.add('rv');
    el.style.setProperty('--rvd', Math.min(n*0.08,0.45)+'s');
  });
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(el){ io.observe(el); });
});

/* ---------- idcard 3d tilt + holo ---------- */
mod(function(){
  if(!FINE || RM) return;
  var card=$('.idcard'); if(!card) return;
  var holo=document.createElement('div'); holo.className='holo'; card.appendChild(holo);
  card.addEventListener('pointermove',function(e){
    var r=card.getBoundingClientRect();
    var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    card.classList.add('tilting');
    card.style.transform='rotateY('+((px-.5)*9).toFixed(2)+'deg) rotateX('+((.5-py)*7).toFixed(2)+'deg)';
    card.style.setProperty('--hx',(px*100)+'%');
    card.style.setProperty('--hy',(py*100)+'%');
  });
  card.addEventListener('pointerleave',function(){
    card.classList.remove('tilting');
    card.style.transform='';
  });
});

/* ---------- ambient glitch bursts ---------- */
mod(function(){
  if(RM) return;
  var g=$('.hero-title .glitch');
  (function amb(){
    setTimeout(function(){
      if(!document.hidden){
        if(g){ g.classList.add('burst'); setTimeout(function(){ g.classList.remove('burst'); },340); }
        if(Math.random()<0.3) jolt();
      }
      amb();
    }, 6000+Math.random()*8000);
  })();
});

/* ---------- portrait HUD timers ---------- */
mod(function(){
  var el=$('.portrait-hud.tl .dim');
  if(el){
    var t=0;
    setInterval(function(){
      t++;
      var h=String(Math.floor(t/3600)%24).padStart(2,'0');
      var m=String(Math.floor(t/60)%60).padStart(2,'0');
      var s=String(t%60).padStart(2,'0');
      el.textContent=h+':'+m+':'+s;
    },1000);
  }
  var match=$('.portrait-hud.br');
  if(match){
    setInterval(function(){
      var v=(99.3+Math.random()*0.6).toFixed(1);
      match.innerHTML='MATCH '+v+'%<br><span class="dim">MASK_PATTERN</span>';
    },1200);
  }
});

/* ---------- overdrive mode ---------- */
var OD=false, odT=null;
function overdrive(on,ms){
  OD=on;
  html.classList.toggle('overdrive',on);
  MTX.speed=on?3:1;
  clearTimeout(odT);
  if(on){
    toast('⚡ OVERDRIVE ENGAGED — system unchained');
    jolt(); beep(440,.12,'sawtooth',.05);
    if(ms) odT=setTimeout(function(){ overdrive(false); },ms);
  }
}

/* ---------- konami code ---------- */
mod(function(){
  var seq=['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  var pos=0;
  addEventListener('keydown',function(e){
    var tag=(e.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea') return;
    var k=(e.key||'').toLowerCase();
    pos = (k===seq[pos]) ? pos+1 : (k===seq[0]?1:0);
    if(pos===seq.length){ pos=0; overdrive(!OD, OD?0:12000); }
  });
});

/* ---------- interactive CLI ---------- */
mod(function(){
  var out=$('#cliOut'), input=$('#cliInput');
  if(!out || !input) return;
  var hist=[], hi=-1;
  function print(txt,cls,asHTML){
    var d=document.createElement('div');
    d.className=cls||'res';
    if(asHTML) d.innerHTML=txt; else d.textContent=txt;
    out.appendChild(d);
    out.scrollTop=out.scrollHeight;
  }
  var SECTIONS=['hero','info','cap','work','notes','contact'];
  var CMDS={
    help:function(){
      return 'available commands:\n'+
        '  whoami          identity dump\n'+
        '  ls              list sections\n'+
        '  cd <section>    jump to section\n'+
        '  matrix          toggle overdrive mode\n'+
        '  hack            attempt intrusion\n'+
        '  rebel           daily mantra\n'+
        '  sudo <cmd>      try your luck\n'+
        '  uptime / date   system time\n'+
        '  clear / reboot  housekeeping\n'+
        '  hint: ↑↑↓↓←→←→BA';
    },
    whoami:function(){
      return '王承皓 / WANG CHEN HAO — a.k.a. <b>ABAO(阿寶)</b>\nrole: product_manager · origin: TAIPEI.TW\nmantra: <b>keep_rebellious()</b> · be_maverick()';
    },
    ls:function(){ return SECTIONS.map(function(s){return '<b>'+s+'/</b>';}).join('  '); },
    cd:function(a){
      var t=(a[0]||'').replace(/\/$/,'');
      if(!t) return '<i>usage: cd &lt;section&gt; — try `ls`</i>';
      if(SECTIONS.indexOf(t)<0) return {err:'cd: no such directory: '+t};
      goTo('#'+t); return 'jumping → /'+t;
    },
    matrix:function(){ overdrive(!OD); return OD?'overdrive: <b>ON</b>':'overdrive: OFF'; },
    rebel:function(){ jolt(); return '<b>保持叛逆，特立獨行。</b>\nkeep rebellious · be maverick ⚡'; },
    sudo:function(a){
      if(a.join(' ')==='make coffee') return '☕ brewing… permission granted, this once.';
      return {err:'permission denied: you are not root. (nobody is)'};
    },
    hack:function(){
      var steps=['> bypassing firewall …','> injecting payload …','> spoofing identity 0xA8A0 …','> ACCESS GRANTED ✔ welcome, operator.'];
      steps.forEach(function(s,i){
        setTimeout(function(){
          print(s, i===steps.length-1?'res':'res', true);
          if(i===steps.length-1){ jolt(); overdrive(true,6000); }
          else beep(300+i*160,.05,'square',.03);
          out.scrollTop=out.scrollHeight;
        }, 350*(i+1));
      });
      return 'initiating intrusion sequence…';
    },
    uptime:function(){ return '31 years — still rebellious.'; },
    date:function(){ return new Date().toString(); },
    clear:function(){ out.innerHTML=''; return null; },
    reboot:function(){ sessionStorage.removeItem('abao_boot'); location.reload(); return null; },
    exit:function(){ return {err:'nice try. there is no exit.'}; }
  };
  CMDS.open=CMDS.cd; CMDS.goto=CMDS.cd;
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'){
      var raw=input.value.trim(); input.value='';
      if(!raw) return;
      hist.push(raw); hi=hist.length;
      print(raw,'in');
      var parts=raw.split(/\s+/), cmd=parts[0].toLowerCase(), args=parts.slice(1);
      beep(180,.04,'square',.03);
      if(CMDS[cmd]){
        var r=CMDS[cmd](args);
        if(r && r.err) print(r.err,'err');
        else if(typeof r==='string') print(r,'res',true);
      }else{
        print('command not found: '+cmd+' — try `help`','err');
      }
    }else if(e.key==='ArrowUp'){
      if(hi>0){ hi--; input.value=hist[hi]; e.preventDefault(); }
    }else if(e.key==='ArrowDown'){
      if(hi<hist.length-1){ hi++; input.value=hist[hi]; }
      else { hi=hist.length; input.value=''; }
    }else{
      beep(2400,.008,'square',.008);
    }
  });
});

/* ---------- contact form stub ---------- */
window.submitForm=function(f){
  var btn=f.querySelector('button[type=submit]');
  var orig=btn.textContent;
  btn.textContent='transmitting...';
  btn.disabled=true;
  beep(600,.08,'sine',.04);
  setTimeout(function(){
    btn.textContent='signal_received ✓';
    btn.style.background='var(--green)';
    btn.style.color='#04160a';
    beep(1200,.12,'sine',.05);
    toast('SIGNAL RECEIVED — 訊號已送出');
    setTimeout(function(){
      btn.textContent=orig; btn.disabled=false;
      btn.style.background=''; btn.style.color='';
      f.reset();
    },2200);
  },900);
};

})();
