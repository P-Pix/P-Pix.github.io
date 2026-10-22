/* Tetris game C++ WebAssembly frontend. SDL and LAN are intentionally absent. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ctx = $('tt-board').getContext('2d');
  const types = ['','I','J','L','O','S','T','Z'];
  const colors = ['','#62cddd','#5189d1','#f4b66b','#edcf79','#6ebea8','#a689d2','#e27d85'];
  let e=null,paused=false,auto=false,last=0,aiElapsed=0,speed=1;
  const status = (text,isError=false) => {$('tt-status').textContent=text;$('tt-status').classList.toggle('error',isError);};
  const setText=(id,v)=>{$(id).textContent=String(v);};
  const format=n=>new Intl.NumberFormat('fr-FR').format(n);
  function reset(){
    if(!e)return;
    e.tg_reset((Date.now()>>>0)||1);paused=false;auto=false;aiElapsed=0;
    setText('tt-pause','Pause');setText('tt-auto',"Lancer l'IA");status('Nouvelle partie — commandes clavier ou tactiles.');render();
  }
  function draw(){
    const s=32,view=new Uint8Array(e.memory.buffer,e.tg_view_ptr(),200);
    ctx.fillStyle='#0e2237';ctx.fillRect(0,0,320,640);
    for(let y=0;y<20;y++)for(let x=0;x<10;x++){
      const idx=view[y*10+x];const px=x*s,py=y*s;
      ctx.fillStyle=(x+y)%2?'#122942':'#11263d';ctx.fillRect(px+1,py+1,30,30);
      if(idx){const ghost=idx>7;const t=ghost?idx-7:idx;
        if(ghost){ctx.strokeStyle=colors[t];ctx.lineWidth=2;ctx.strokeRect(px+5,py+5,22,22);}
        else{ctx.fillStyle=colors[t];ctx.fillRect(px+2,py+2,28,28);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(px+5,py+5,22,4);ctx.fillStyle='rgba(11,34,54,.16)';ctx.fillRect(px+5,py+25,22,3);}
      }
    }
  }
  function render(){
    if(!e)return;draw();
    setText('tt-score',format(e.tg_score()));setText('tt-lines',e.tg_lines());setText('tt-level',e.tg_level());setText('tt-pieces',e.tg_pieces());
    const held=e.tg_hold();setText('tt-hold',types[held]||'—');$('tt-hold').style.color=colors[held]||'#54738f';
    const next=$('tt-next');next.replaceChildren();for(let i=0;i<5;i++){
      const n=e.tg_next(i),el=document.createElement('span');el.textContent=types[n]||'?';el.style.color=colors[n]||'#52718c';next.appendChild(el);
    }
    const isOver=Boolean(e.tg_game_over());$('tt-overlay').hidden=!isOver;
    if(isOver&&auto){auto=false;setText('tt-auto',"Lancer l'IA");status('Partie terminée. Relancez une manche.');}
  }
  function action(n){if(!e||paused||auto||e.tg_game_over())return;e.tg_act(n);render();}
  function frame(now){
    if(e){let dt=last?Math.min(100,now-last):0;last=now;
      if(!paused&&!e.tg_game_over()){
        if(auto){aiElapsed+=dt*speed;let count=0;
          while(aiElapsed>=190&&count++<3&&!e.tg_game_over()){e.tg_ai();aiElapsed-=190;render();}
        }else{e.tg_tick(Math.round(dt*speed));}
      }
      if(!auto)draw();
      const isOver=Boolean(e.tg_game_over());if(isOver)$('tt-overlay').hidden=false;
      setText('tt-score',format(e.tg_score()));setText('tt-lines',e.tg_lines());setText('tt-level',e.tg_level());setText('tt-pieces',e.tg_pieces());
    }else{last=now;}requestAnimationFrame(frame);
  }
  $('tt-reset').addEventListener('click',reset);
  $('tt-pause').addEventListener('click',()=>{if(!e||e.tg_game_over())return;paused=!paused;setText('tt-pause',paused?'Reprendre':'Pause');status(paused?'Partie en pause.':auto?'Pilote automatique actif.':'Jeu repris.');});
  $('tt-auto').addEventListener('click',()=>{if(!e||e.tg_game_over())return;auto=!auto;paused=false;aiElapsed=0;setText('tt-pause','Pause');setText('tt-auto',auto?'Arrêter l’IA':"Lancer l'IA");status(auto?'IA heuristique 2-ply active.':'Mode manuel actif.');render();});
  $('tt-step').addEventListener('click',()=>{if(!e||auto||e.tg_game_over())return;e.tg_ai();status('Placement IA effectué en C++.');render();});
  $('tt-speed').addEventListener('input',()=>{speed=Number($('tt-speed').value);setText('tt-speed-label',`${speed}×`);});
  document.querySelectorAll('[data-tetris-action]').forEach(b=>b.addEventListener('click',()=>action(Number(b.dataset.tetrisAction))));
  const bindings={ArrowLeft:0,ArrowRight:1,ArrowUp:2,KeyZ:3,ArrowDown:4,Space:5,KeyC:6};
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input, select, textarea, button'))return;
    if(event.code==='KeyP'){event.preventDefault();$('tt-pause').click();return;}
    if(event.code==='KeyR'){event.preventDefault();$('tt-reset').click();return;}
    if(Object.hasOwn(bindings,event.code)){event.preventDefault();action(bindings[event.code]);}
  });
  async function start(){
    try{const response=await fetch('../engine/tetris.wasm');if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const {instance}=await WebAssembly.instantiate(await response.arrayBuffer(),{});e=instance.exports;
      e.tg_reset(2026);$('tt-led').classList.add('ready');setText('tt-engine','Moteur C++ actif');
      for(const id of ['tt-pause','tt-reset','tt-step','tt-auto'])$(id).disabled=false;
      status('Prêt : le moteur C++ s’exécute dans votre navigateur.');render();
    }catch(error){setText('tt-engine','WASM indisponible');status(`Chargement impossible : ${error.message}. Utilisez HTTP, pas file://.`,true);console.error(error);}
  }
  requestAnimationFrame(frame);start();
})();
