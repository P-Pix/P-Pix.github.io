/* Neural C++ WASM: UI, dataset generator and visualization only. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas=$('nn-canvas'),ctx=canvas.getContext('2d'),chart=$('nn-chart'),chartCtx=chart.getContext('2d');
  const netCanvas=$('nn-network'),netCtx=netCanvas.getContext('2d');
  let probeX=0,probeY=0;
  const heat=document.createElement('canvas');const res=88;heat.width=res;heat.height=res;
  const heatCtx=heat.getContext('2d');
  let e=null,points=[],history=[],running=false,last=0,drawPending=true;
  const status=(message,isError=false)=>{$('nn-status').textContent=message;$('nn-status').classList.toggle('error',isError);};
  const setText=(id,text)=>{$(id).textContent=String(text);};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function seeded(seed){let n=seed||1;return()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296;};}
  function makeData(kind,seed,noise){
    const rand=seeded(seed),pi=Math.PI,data=[],seen=[0,0];
    const gauss=()=>Math.sqrt(-2*Math.log(Math.max(1e-12,rand())))*Math.cos(2*pi*rand());
    for(let i=0;i<320;i++){
      const label=i%2,isTest=seen[label]++%5===0;
      let x,y;
      if(kind==='linear'){
        const center=label===0?-0.7:0.7;x=center+(0.3+noise*0.4)*gauss();y=center*0.6+(0.28+noise*0.4)*gauss();
      }else if(kind==='xor'){
        const sx=Math.floor(i/2)%2===0?-0.8:0.8,sy=label===0?sx:-sx;
        x=sx+(0.18+noise*0.42)*gauss();y=sy+(0.18+noise*0.42)*gauss();
      }else if(kind==='circles'){
        const angle=2*pi*rand(),radius=label===0?0.47*Math.sqrt(rand()):0.97+0.18*rand();
        x=radius*Math.cos(angle)+noise*gauss();y=radius*Math.sin(angle)+noise*gauss();
      }else{
        const angle=pi*rand();
        if(label===0){x=Math.cos(angle)-0.5;y=Math.sin(angle)-0.3;}
        else{x=0.5-Math.cos(angle);y=0.25-Math.sin(angle);}
        x+=noise*gauss();y+=noise*gauss();
      }
      data.push({x:clamp(x,-1.78,1.78),y:clamp(y,-1.78,1.78),label,isTest});
    }
    return data;
  }
  function regenerate(){
    if(!e)return;
    running=false;setText('nn-play','▶ Entraîner');
    e.nn_clear_samples();
    const layers=Number($('nn-layers').value),rate=Number($('nn-rate').value);
    e.nn_reset(layers,rate,2026);
    points=makeData($('nn-dataset').value,42,Number($('nn-noise').value));
    for(const p of points)e.nn_add_point(p.x,p.y,p.label,p.isTest?1:0);
    history=[];recordHistory();drawPending=true;
    setText('nn-arch',layers===1?'2 → 8 → 1':'2 → 8 → 8 → 1');
    status('Nouveau dataset généré. Appuyez sur Entraîner pour voir la frontière évoluer.');
    render();
  }
  function recordHistory(){if(!e)return;history.push({epoch:e.nn_epoch(),loss:e.nn_loss(0)});if(history.length>240)history.shift();}
  function metrics(){
    if(!e)return;
    setText('nn-epoch',e.nn_epoch());setText('nn-accuracy',`${(e.nn_accuracy(1)*100).toFixed(1).replace('.',',')} %`);
    setText('nn-loss',e.nn_loss(1).toFixed(3).replace('.',','));
  }
  function drawHeat(){
    const n=e.nn_compute_field(res);if(n!==res*res)throw Error('Carte de probabilité invalide.');
    const src=new Uint8Array(e.memory.buffer,e.nn_field_ptr(),n);
    const image=heatCtx.createImageData(res,res);
    for(let i=0;i<n;i++){
      const p=src[i]/255,fade=p<.5?p*2:(p-.5)*2,lo=p<.5;
      const a=lo?[184,217,242]:[249,251,253];const b=lo?[249,251,253]:[255,207,176];
      for(let c=0;c<3;c++)image.data[i*4+c]=Math.round(a[c]*(1-fade)+b[c]*fade);
      image.data[i*4+3]=255;
    }
    heatCtx.putImageData(image,0,0);
    ctx.clearRect(0,0,520,520);
    ctx.imageSmoothingEnabled=true;ctx.drawImage(heat,0,0,520,520);
    ctx.strokeStyle='rgba(77,115,150,.11)';ctx.lineWidth=1;
    for(let k=1;k<8;k++){let pos=520*k/8;ctx.beginPath();ctx.moveTo(pos,0);ctx.lineTo(pos,520);ctx.moveTo(0,pos);ctx.lineTo(520,pos);ctx.stroke();}
    ctx.strokeStyle='rgba(23,61,92,.42)';ctx.beginPath();ctx.moveTo(260,0);ctx.lineTo(260,520);ctx.moveTo(0,260);ctx.lineTo(520,260);ctx.stroke();
    // Contour P(class B) = 0.5, interpolated from the WASM probability grid.
    ctx.strokeStyle='rgba(45,79,114,.75)';ctx.lineWidth=1.35;ctx.beginPath();
    const threshold=127.5;const cell=520/(res-1);
    for(let y=0;y<res-1;y++)for(let x=0;x<res-1;x++){
      const p0=src[y*res+x],p1=src[y*res+x+1],p2=src[(y+1)*res+x+1],p3=src[(y+1)*res+x];
      const edges=[];
      const cross=(u,v,a,b)=>{if((u<threshold)!==(v<threshold)){const t=(threshold-u)/(v-u);edges.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}};
      cross(p0,p1,[x,y],[x+1,y]);cross(p1,p2,[x+1,y],[x+1,y+1]);cross(p2,p3,[x+1,y+1],[x,y+1]);cross(p3,p0,[x,y+1],[x,y]);
      for(let i=0;i+1<edges.length;i+=2){ctx.moveTo((edges[i][0]+.5)*cell,(edges[i][1]+.5)*cell);ctx.lineTo((edges[i+1][0]+.5)*cell,(edges[i+1][1]+.5)*cell);}
    }ctx.stroke();
    for(const p of points){let x=(p.x+1.8)/3.6*520,y=(1.8-p.y)/3.6*520;
      ctx.beginPath();ctx.arc(x,y,p.isTest?3.6:4.4,0,2*Math.PI);
      ctx.fillStyle=p.label===0?'#337cbc':'#dd865b';ctx.fill();
      ctx.strokeStyle=p.isTest?'rgba(255,255,255,.65)':'#fff';ctx.lineWidth=p.isTest?1:1.5;ctx.stroke();
    }
  }
  function drawNetwork(){
    const w=netCanvas.width,h=netCanvas.height,L=e.nn_layer_count();
    netCtx.clearRect(0,0,w,h);netCtx.fillStyle='#fbfdff';netCtx.fillRect(0,0,w,h);
    e.nn_probe(probeX,probeY);
    const activ=new Float64Array(e.memory.buffer,e.nn_probe_ptr(),32),nodes=[];
    for(let l=0;l<L;l++){
      const count=e.nn_layer_width(l);const x=48+(w-96)*l/(L-1);const arr=[];
      for(let j=0;j<count;j++){
        const y=h/2+(j-(count-1)/2)*(count===8?29:40);
        arr.push({x,y,v:activ[l*8+j]});
      }nodes.push(arr);
    }
    for(let l=0;l<L-1;l++)for(let j=0;j<nodes[l+1].length;j++)for(let i=0;i<nodes[l].length;i++){
      const weight=e.nn_weight(l,j,i),a=nodes[l][i],b=nodes[l+1][j];
      netCtx.strokeStyle=weight<0?'rgba(224,124,105,.44)':'rgba(56,120,183,.44)';
      netCtx.lineWidth=Math.min(2.7,0.6+Math.abs(weight)*1.1);
      netCtx.beginPath();netCtx.moveTo(a.x+8,a.y);netCtx.lineTo(b.x-8,b.y);netCtx.stroke();
    }
    netCtx.font='12px ui-monospace,Consolas,monospace';
    nodes.forEach((layer,l)=>{layer.forEach(({x,y,v},j)=>{
      netCtx.beginPath();netCtx.arc(x,y,8,0,Math.PI*2);
      netCtx.fillStyle=v>=0?'#548dc1':'#df9a78';netCtx.fill();
      netCtx.strokeStyle='#fff';netCtx.lineWidth=2;netCtx.stroke();
    });netCtx.textAlign='center';netCtx.fillStyle='#67809b';netCtx.fillText(l===0?'INPUT':l===L-1?'OUTPUT':`HIDDEN ${l}`,layer[0].x,18);});
    netCtx.textAlign='left';
  }
  function drawChart(){
    const width=chart.width,height=chart.height;chartCtx.clearRect(0,0,width,height);chartCtx.fillStyle='#fbfdff';chartCtx.fillRect(0,0,width,height);
    const margin={left:44,right:14,top:16,bottom:30};const cw=width-margin.left-margin.right,ch=height-margin.top-margin.bottom;
    chartCtx.strokeStyle='#dfe8f1';chartCtx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=margin.top+i*ch/4;chartCtx.beginPath();chartCtx.moveTo(margin.left,y);chartCtx.lineTo(width-margin.right,y);chartCtx.stroke();}
    chartCtx.fillStyle='#69839b';chartCtx.font='12px ui-monospace, monospace';
    const maxLoss=Math.max(.8,...history.map(v=>v.loss))*1.08;
    for(let i=0;i<=4;i++)chartCtx.fillText((maxLoss*(1-i/4)).toFixed(2),5,margin.top+i*ch/4+4);
    chartCtx.fillText('0',margin.left,height-9);
    chartCtx.fillText(`ÉPOQUE ${e?e.nn_epoch():0}`,width-135,height-9);
    if(!history.length)return;
    let first=history[0].epoch,lastEpoch=history[history.length-1].epoch;
    chartCtx.strokeStyle='#357fba';chartCtx.lineWidth=2.4;chartCtx.beginPath();
    history.forEach((d,i)=>{const x=margin.left+(lastEpoch===first?0:(d.epoch-first)/(lastEpoch-first))*cw,y=margin.top+ch*(1-d.loss/maxLoss);if(i===0)chartCtx.moveTo(x,y);else chartCtx.lineTo(x,y);});chartCtx.stroke();
  }
  function render(){if(!e)return;try{drawHeat();drawNetwork();drawChart();metrics();drawPending=false;}catch(error){status(`Erreur de rendu : ${error.message}`,true);console.error(error);}}
  function step(epochs=10){if(!e)return;e.nn_train(epochs);recordHistory();drawPending=true;render();}
  $('nn-step').addEventListener('click',()=>{if(!e)return;running=false;setText('nn-play','▶ Entraîner');step(10);status('10 époques effectuées par le moteur C++.');});
  $('nn-play').addEventListener('click',()=>{if(!e)return;running=!running;setText('nn-play',running?'⏸ Suspendre':'▶ Entraîner');status(running?'Entraînement C++ en cours.':'Entraînement suspendu.');});
  $('nn-reset').addEventListener('click',regenerate);
  $('nn-generate').addEventListener('click',regenerate);
  $('nn-noise').addEventListener('input',()=>setText('nn-noise-value',Number($('nn-noise').value).toFixed(2).replace('.',',')));
  function toCoord(event){const rect=canvas.getBoundingClientRect();let x=clamp((event.clientX-rect.left)/rect.width,0,1),y=clamp((event.clientY-rect.top)/rect.height,0,1);return {x:-1.8+3.6*x,y:1.8-3.6*y};}
  canvas.addEventListener('click',event=>{
    if(!e)return;const {x,y}=toCoord(event),label=Number($('nn-class').value);
    if(!e.nn_add_point(x,y,label,0)){status('Nombre maximum de 512 points atteint.',true);return;}
    points.push({x,y,label,isTest:false});status(`Point de classe ${label===0?'A':'B'} ajouté à l'entraînement.`);drawPending=true;render();
  });
  canvas.addEventListener('pointermove',event=>{if(!e)return;const {x,y}=toCoord(event);probeX=x;probeY=y;setText('nn-probe',`x=${x.toFixed(2)}, y=${y.toFixed(2)} → P(B)=${(e.nn_predict(x,y)*100).toFixed(1)} %`);drawNetwork();});
  canvas.addEventListener('pointerleave',()=>setText('nn-probe','Survolez la carte pour inspecter P(classe B).'));
  function frame(time){if(e&&!document.hidden){if(running&&time-last>100){e.nn_train(Number($('nn-speed').value));recordHistory();drawPending=true;last=time;}if(drawPending)render();}requestAnimationFrame(frame);}
  async function init(){
    try{const response=await fetch('../engine/neural.wasm');if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const imports={env:{js_exp:Math.exp,js_tanh:Math.tanh,js_log:Math.log,js_sqrt:Math.sqrt}};
      const {instance}=await WebAssembly.instantiate(await response.arrayBuffer(),imports);e=instance.exports;
      $('nn-led').classList.add('ready');setText('nn-engine','Moteur C++ actif');
      for(const id of ['nn-play','nn-step','nn-reset','nn-generate'])$(id).disabled=false;
      regenerate();
    }catch(error){setText('nn-engine','WASM indisponible');status(`Chargement impossible : ${error.message}. Utilisez HTTP, pas file://.`,true);console.error(error);}
  }
  requestAnimationFrame(frame);init();
})();
