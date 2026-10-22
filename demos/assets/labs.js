/* Interactive laboratory. All protocol/queue calculations are delegated to C++ WASM. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const sections = ['telemetry', 'mission', 'binary', 'bus', 'embedded', 'scangui'];
  let wasm = null;
  let lastTelemetry = null;
  let current = sections[0];
  let mcpsHistory = [];
  let scanMode = 'local';
  const encoder = new TextEncoder();
  const titles = {telemetry: 'Telemetrie', mission: 'Mission Control', binary: 'Enregistreur', bus: 'Bus LHBD', embedded: 'Capteurs EDDS', scangui: 'ScanGUI'};

  function requireWasm(){
    if (!wasm) throw new Error('Moteur C++ indisponible. Ouvrez ce site via HTTP et non file://.');
    return wasm;
  }
  function setText(id,value){$(id).textContent=String(value);}
  function displayStatus(id,valid,positive,negative){
    const el=$(id);el.textContent=valid?positive:negative;
    el.classList.toggle('status-valid',valid);
    el.classList.toggle('status-invalid',!valid);
  }
  function hex32(v){return '0x'+(v>>>0).toString(16).padStart(8,'0').toUpperCase();}
  function hexByte(v){return v.toString(16).padStart(2,'0').toUpperCase();}
  function bytesOfFrame(){
    const e=requireWasm();
    return new Uint8Array(e.memory.buffer,e.frame_ptr(),e.frame_length()).slice();
  }
  function wireCRC(kind){
    const b=bytesOfFrame(),len=b.length;
    if(len<4)return 0;
    const d=new DataView(b.buffer);
    return d.getUint32(len-4,kind==='embedded');
  }
  function hexdump(target){
    const bytes=bytesOfFrame();const lines=[];
    for(let i=0;i<bytes.length;i+=16){
      const line=Array.from(bytes.slice(i,i+16),hexByte).join(' ');
      const ascii=Array.from(bytes.slice(i,i+16),v=>v>=32&&v<127?String.fromCharCode(v):'.').join('');
      lines.push(i.toString(16).padStart(4,'0').toUpperCase()+'   '+line.padEnd(47,' ')+'  '+ascii);
    }
    setText(target,lines.join('\n'));
  }
  function assignInputBytes(text){
    const e=requireWasm();
    const payload=encoder.encode(text);
    if(payload.length>512) throw new Error('La charge utile doit contenir au maximum 512 octets UTF-8.');
    new Uint8Array(e.memory.buffer,e.input_ptr(),512).fill(0);
    new Uint8Array(e.memory.buffer,e.input_ptr(),payload.length).set(payload);
    return payload.length;
  }
  function safeRun(fn){
    try {fn();$('wasm-error').hidden=true;}
    catch(err){$('wasm-error').hidden=false;setText('wasm-error',err instanceof Error?err.message:String(err));console.error(err);}
  }
  function number(id){return Number($(id).value);}

  function buildTelemetry(){
    const e=requireWasm();
    const ms=Date.now();
    const args=[number('stgs-satellite'),ms>>>0,Math.floor(ms/4294967296),number('stgs-temp'),number('stgs-battery'),number('stgs-status')];
    const payload=$('stgs-payload').value;
    const count=assignInputBytes(payload);
    const n=e.stgs_build(...args,count);
    if(!n)throw new Error('Parametres de trame STGS invalides.');
    lastTelemetry={args,payload};
    renderTelemetry();
  }
  function renderTelemetry(){
    const e=requireWasm(),res=e.stgs_check();
    hexdump('stgs-hex');
    setText('stgs-length',e.frame_length());
    setText('stgs-crc',hex32(e.frame_crc_actual()));
    displayStatus('stgs-result',res===1,'VALIDE','REJETEE');
    const errors={'-1':'Trame trop courte','-2':'Magic invalide','-3':'Version non supportee','-4':'Longueur incorrecte','-5':'CRC incorrect : donnees alterees','-6':'Valeurs metier invalides'};
    setText('stgs-description',res===1?'CRC et structure OK':(errors[res]||'Rejet de trame'));
    const flow=$('stgs-flow');flow.classList.toggle('is-invalid',res!==1);flow.textContent=res===1?'CRC VALIDE':'CRC / FORMAT KO';
  }
  function corruptTelemetry(){
    const e=requireWasm();
    if(e.frame_length()<27)throw new Error('Encodez une trame avant de la corrompre.');
    e.frame_flip(e.frame_length()>27?23:15);
    renderTelemetry();
  }
  function restoreTelemetry(){
    if(!lastTelemetry) return buildTelemetry();
    const e=requireWasm();const count=assignInputBytes(lastTelemetry.payload);
    e.stgs_build(...lastTelemetry.args,count);renderTelemetry();
  }
  function buildBus(){
    const e=requireWasm();
    if(!e.lhbd_build(number('bus-command'),number('bus-seq'),number('bus-sensor')))throw new Error('Trame LHBD invalide.');
    renderBus();
  }
  function renderBus(){
    const e=requireWasm(),ok=e.lhbd_check()===1;
    hexdump('bus-hex');setText('bus-sequence',(e.frame_byte(8)<<8)|e.frame_byte(9));
    displayStatus('bus-result',ok,'VALIDE','REJETEE');
    setText('bus-crc','Stocke '+hex32(wireCRC('bus'))+' / Calcule '+hex32(e.frame_crc_actual()));
  }
  function buildEmbedded(){
    const e=requireWasm();
    if(!e.edds_build(number('edds-seq'),number('edds-command'),number('edds-value')))throw new Error('Trame EDDS invalide.');
    renderEmbedded();
  }
  function renderEmbedded(){
    const e=requireWasm(),ok=e.edds_check()===1;
    hexdump('edds-hex');displayStatus('edds-result',ok,'VALIDE','REJETEE');
    setText('edds-crc','Stocke '+hex32(wireCRC('embedded'))+' / Calcule '+hex32(e.frame_crc_actual()));
  }

  const commandResult={1:'CONNECTED protocol=MCPS/1.0',2:'AUTHENTICATED role=operator',6:'MODE_SET',7:'STATUS',8:'STREAM_STARTED',9:'STREAM_STOPPED',10:'PONG',11:'BYE','-1':'NOT_CONNECTED: envoyez CONNECT','-2':'NOT_AUTHENTICATED: envoyez AUTH demo','-3':'AUTH_FAILED','-4':'INVALID_MODE','-5':'UNKNOWN_COMMAND'};
  function terminalLine(text,kind){
    mcpsHistory.push({text,kind});if(mcpsHistory.length>80)mcpsHistory=mcpsHistory.slice(-80);
    const log=$('mcps-lines');log.replaceChildren();
    for(const item of mcpsHistory){const line=document.createElement('span');line.className='terminal-line '+item.kind;line.textContent=item.text;log.append(line);}
    log.scrollTop=log.scrollHeight;
  }
  function renderMission(){
    const e=requireWasm();
    setText('mcps-session',e.mcps_connected()?'CONNECTEE':'FERMEE');
    setText('mcps-auth',e.mcps_authorized()?'Authentifiee (fictif)':'Non authentifiee');
    setText('mcps-mode',['SAFE','ACTIVE','MAINTENANCE'][e.mcps_mode()]||'INCONNU');
    setText('mcps-stream',e.mcps_stream()?'Flux simule actif':'Flux arrete');
    setText('mcps-errors',e.mcps_errors());setText('mcps-count',e.mcps_commands()+' commandes');
  }
  function issueCommand(value){
    const e=requireWasm(),raw=value.trim().replace(/\s+/g,' '),text=raw.toUpperCase();
    if(!raw)return;
    terminalLine('> '+(text.startsWith('AUTH ')?'AUTH <masque>':text),'command');
    if(text==='HELP'){
      terminalLine('OK HELP CONNECT, AUTH demo, GET_STATUS, START_STREAM, STOP_STREAM, SET_MODE SAFE|ACTIVE|MAINTENANCE, PING, QUIT','success');
      return;
    }
    let command=0,arg=0;
    if(text==='CONNECT')command=1;
    else if(text.startsWith('AUTH ')){command=2;arg=text==='AUTH DEMO'?1:0;}
    else if(text==='GET_STATUS')command=3;
    else if(text==='START_STREAM')command=4;
    else if(text==='STOP_STREAM')command=5;
    else if(text.startsWith('SET_MODE ')){command=6;const m=text.slice('SET_MODE '.length);arg=({'SAFE':0,'ACTIVE':1,'MAINTENANCE':2}[m]??-1);}
    else if(text==='PING')command=7;
    else if(text==='QUIT')command=8;
    else {terminalLine('ERR PARSE_ERROR (commande non prise en charge)','error');return;}
    const rc=e.mcps_command(command,arg);
    let response=commandResult[rc]||'UNKNOWN';
    if(rc===6)response+=' mode='+['SAFE','ACTIVE','MAINTENANCE'][e.mcps_mode()];
    if(rc===7)response+=' mode='+['SAFE','ACTIVE','MAINTENANCE'][e.mcps_mode()]+' active_stream='+Boolean(e.mcps_stream());
    terminalLine((rc>0?'OK ':'ERR ')+response,rc>0?'success':'error');renderMission();
  }
  function resetMission(){const e=requireWasm();e.mcps_reset();mcpsHistory=[];terminalLine('MCPS/1.0 : session simulee. Essayez GET_STATUS avant CONNECT.','success');renderMission();}

  function renderQueue(message){
    const e=requireWasm();
    const count=e.queue_count(),max=e.queue_capacity(),track=$('queue-track');track.replaceChildren();
    for(let i=0;i<max;i++){
      const box=document.createElement('div');box.className='queue-slot';
      if(i<count){const priority=e.queue_at(i);box.classList.add('is-full');if(priority>=4)box.classList.add('is-critical');else if(priority===3)box.classList.add('is-warning');box.textContent='P'+priority;box.title='Priorite '+priority;}
      else{box.textContent='--';box.title='Emplacement libre';}
      track.append(box);
    }
    setText('queue-fill',count+' / '+max);setText('queue-written',e.queue_processed());setText('queue-dropped',e.queue_dropped());
    setText('queue-load',Math.round(count*100/max)+'% OCCUPATION');
    if(message){setText('queue-message',message);$('queue-message').classList.toggle('is-alert',e.queue_dropped()>0);}
  }
  function resetQueue(){const e=requireWasm();e.queue_reset(number('queue-size'));renderQueue('File reinitialisee, aucun evenement en attente.');}
  function produceQueue(){
    const e=requireWasm();const n=Math.max(1,Math.min(64,number('queue-burst')||1));let accepted=0,rejected=0;
    for(let i=0;i<n;i++){
      const priority=[2,1,2,3,2,4,1,5][i%8];
      if(e.queue_enqueue(priority)===1)accepted++;else rejected++;
    }
    renderQueue(accepted+' evenements acceptes, '+rejected+' refuses : '+(rejected?'la file est saturee.':'encore de la capacite.'));
  }
  function consumeQueue(){const e=requireWasm();const n=Math.max(1,Math.min(64,number('queue-drain-count')||1));const count=e.queue_drain(n);renderQueue(count+' evenement(s) traites dans l ordre FIFO.');}

  const sampleData=[
    {name:'Atlas orbital',genre:'Science-fiction',author:'Bibliotheque locale',abbr:'AO'},
    {name:'Structures et reseaux',genre:'Technologie',author:'Documentation',abbr:'SR'},
    {name:'Journal de bord',genre:'Aventure',author:'Catalogue de test',abbr:'JB'},
    {name:'Univers profond',genre:'Science',author:'Collection fictive',abbr:'UP'}
  ];
  function renderScan(){
    const grid=$('scan-grid'),query=$('scan-query').value.trim().toLocaleLowerCase('fr');
    const filtered=sampleData.filter(v=>[v.name,v.genre,v.author].some(s=>s.toLocaleLowerCase('fr').includes(query)));
    grid.replaceChildren();
    for(const b of filtered){
      const article=document.createElement('article');article.className='scan-item';
      const icon=document.createElement('span');icon.className='scan-icon';icon.textContent=b.abbr;
      const content=document.createElement('div');const name=document.createElement('strong');name.textContent=b.name;
      const meta=document.createElement('small');meta.textContent=b.genre+' / '+b.author;
      content.append(name,meta);article.append(icon,content);grid.append(article);
    }
    if(!filtered.length){const empty=document.createElement('p');empty.className='scan-empty';empty.textContent='Aucun exemple ne correspond a votre recherche.';grid.append(empty);}
    setText('scan-counter',filtered.length+' entrees');
    setText('scan-status',({local:'Source locale (donnees fictives)',api:'API simulee (aucune requete reseau)',offline:'Cache hors-ligne fictif (en memoire)'}[scanMode]));
    for(const button of document.querySelectorAll('[data-scan-mode]')){
      const active=button.dataset.scanMode===scanMode;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
    }
  }

  function navigate(panel,push=true){
    if(!sections.includes(panel))panel='telemetry';current=panel;
    for(const name of sections){
      $('panel-'+name).hidden=name!==panel;
      const button=$('tab-'+name);button.classList.toggle('is-selected',name===panel);button.setAttribute('aria-selected',String(name===panel));button.tabIndex=name===panel?0:-1;
    }
    if(push){const url=new URL(window.location.href);url.searchParams.set('demo',panel);history.pushState({demo:panel},'',url);}
    document.title=titles[panel]+' | Laboratoire C++ | Guillaume Lemonnier';
    if(wasm && ['telemetry','bus','embedded'].includes(panel)){
      safeRun(()=>{if(panel==='telemetry')restoreTelemetry();else if(panel==='bus')buildBus();else buildEmbedded();});
    }
  }
  function initNavigation(){
    for(const button of document.querySelectorAll('[data-demo]')){
      button.addEventListener('click',()=>navigate(button.dataset.demo));
      button.addEventListener('keydown',event=>{
        if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft'&&event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
        event.preventDefault();const idx=sections.indexOf(button.dataset.demo),delta=(event.key==='ArrowRight'||event.key==='ArrowDown')?1:-1;
        const next=sections[(idx+sections.length+delta)%sections.length];navigate(next);$('tab-'+next).focus();
      });
    }
    const requested=new URLSearchParams(location.search).get('demo');navigate(requested||'telemetry',false);
    window.addEventListener('popstate',()=>navigate(new URLSearchParams(location.search).get('demo'),false));
  }
  function bindHandlers(){
    $('form-telemetry').addEventListener('submit',ev=>{ev.preventDefault();safeRun(buildTelemetry);});
    $('stgs-corrupt').addEventListener('click',()=>safeRun(corruptTelemetry));
    $('stgs-restore').addEventListener('click',()=>safeRun(restoreTelemetry));
    $('form-bus').addEventListener('submit',ev=>{ev.preventDefault();safeRun(buildBus);});
    $('bus-corrupt').addEventListener('click',()=>safeRun(()=>{requireWasm().frame_flip(16);renderBus();}));
    $('form-embedded').addEventListener('submit',ev=>{ev.preventDefault();safeRun(buildEmbedded);});
    $('edds-corrupt').addEventListener('click',()=>safeRun(()=>{requireWasm().frame_flip(10);renderEmbedded();}));
    $('form-mcps').addEventListener('submit',ev=>{ev.preventDefault();const v=$('mcps-input').value;$('mcps-input').value='';safeRun(()=>issueCommand(v));});
    $('mcps-clear').addEventListener('click',()=>{mcpsHistory=[];$('mcps-lines').replaceChildren();});
    $('mcps-reset').addEventListener('click',()=>safeRun(resetMission));
    for(const button of document.querySelectorAll('[data-command]'))button.addEventListener('click',()=>safeRun(()=>issueCommand(button.dataset.command)));
    $('queue-size').addEventListener('change',()=>safeRun(resetQueue));
    $('queue-produce').addEventListener('click',()=>safeRun(produceQueue));
    $('queue-consume').addEventListener('click',()=>safeRun(consumeQueue));
    $('queue-reset').addEventListener('click',()=>safeRun(resetQueue));
    $('scan-query').addEventListener('input',renderScan);
    for(const button of document.querySelectorAll('[data-scan-mode]'))button.addEventListener('click',()=>{scanMode=button.dataset.scanMode;renderScan();});
  }
  async function loadEngine(){
    try{
      if(location.protocol==='file:')throw new Error('Le navigateur bloque le chargement WASM depuis file://. Utilisez un serveur HTTP local ou GitHub Pages.');
      const response=await fetch('engine/labs.wasm');
      if(!response.ok)throw new Error('Erreur HTTP '+response.status+' sur labs.wasm');
      const bytes=await response.arrayBuffer();
      const module=await WebAssembly.instantiate(bytes,{});
      wasm=module.instance.exports;
      $('engine-led').classList.add('is-ready');
      setText('engine-state','Moteur C++ initialise');setText('runtime-label','WebAssembly / C++20 actif');
      for(const el of document.querySelectorAll('[data-wasm-action]'))el.disabled=false;
      safeRun(buildTelemetry);safeRun(buildBus);safeRun(buildEmbedded);safeRun(resetMission);safeRun(resetQueue);
      // All binary adapters share one frame buffer. The user creates/validates
      // a frame before modifying it. Initial hexdumps are only examples.
      safeRun(()=>{if(current==='telemetry')buildTelemetry();if(current==='bus')buildBus();if(current==='embedded')buildEmbedded();});
    }catch(err){
      $('engine-led').classList.add('is-error');
      setText('engine-state','Moteur non disponible');setText('runtime-label','WebAssembly indisponible');
      $('wasm-error').hidden=false;setText('wasm-error',(err instanceof Error?err.message:String(err))+' Les ateliers WASM ne peuvent pas fonctionner, mais la maquette ScanGUI reste accessible.');
    }
  }
  initNavigation();bindHandlers();renderScan();
  for(const el of document.querySelectorAll('[data-wasm-action]'))el.disabled=true;
  loadEngine();
})();
