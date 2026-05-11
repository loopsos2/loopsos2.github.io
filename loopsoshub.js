// loopsOS Hub + Hub Apps - loopsoshub.js

function openLoopsOSHub(){
  WM.make('loopsoshub','loopsOS Hub',560,460,
  `<div style="display:flex;flex-direction:column;height:100%;">
    <div class="menu-bar">
      <span class="menu-item" onclick="hubTab('browse',this)">Browse</span>
      <span class="menu-item" onclick="hubTab('installed',this)">Installed</span>
      <span class="menu-item" onclick="hubTab('install',this)">Install .lpx</span>
    </div>
    <div style="padding:4px;border-bottom:1px solid #808080;display:flex;gap:4px;">
      <input type="text" id="hub-search" placeholder="Search apps..." style="flex:1;" oninput="hubFilter()">
      <button class="btn" onclick="hubFilter()">Search</button>
    </div>
    <div id="hub-content" style="flex:1;overflow-y:auto;padding:6px;"></div>
    <div class="status-bar" id="hub-status">loopsOS Hub - Ready</div>
  </div>`);
  window.hubCurrentTab='browse';
  hubTab('browse',null);
}

let hubAppList=[
  {id:'app2048',name:'2048',desc:'Sliding tile puzzle game',icon:'🎮',fn:'open2048'},
  {id:'jsconsole',name:'JS Console',desc:'JavaScript debug console',icon:'💻',fn:'openJSConsole'},
  {id:'loopstts',name:'LoopsTTS',desc:'Text to speech synthesizer',icon:'🔊',fn:'openLoopsTTS'},
  {id:'bytebeat',name:'Bytebeat',desc:'Algorithmic audio synthesizer',icon:'🎵',fn:'openBytebeat'},
  {id:'jsoneditor',name:'JSON Editor',desc:'Interactive JSON tree editor',icon:'📋',fn:'openJSONEditor'},
  {id:'imagefile',name:'Image Viewer',desc:'View and edit images',icon:'🖼️',fn:'openImageFile'},
  {id:'banGen',name:'BAN Generator',desc:'Big Ass Numbers generator',icon:'🔢',fn:'openBANGenerator'},
  {id:'tonGen',name:'TON Generator',desc:'Tone & frequency generator',icon:'〰️',fn:'openTONGenerator'},
  {id:'fghGen',name:'FGH Generator',desc:'Fast Growing Hierarchy generator',icon:'📈',fn:'openFGHGenerator'},
  {id:'nesEmu',name:'NES Emulator',desc:'Nintendo Entertainment System',icon:'🕹️',fn:'openNESEmulator'},
  {id:'snesEmu',name:'SNES Emulator',desc:'Super Nintendo',icon:'🕹️',fn:'openSNESEmulator'},
  {id:'n64Emu',name:'N64 Emulator',desc:'Nintendo 64',icon:'🕹️',fn:'openN64Emulator'},
  {id:'ndsEmu',name:'NDS Emulator',desc:'Nintendo DS',icon:'🕹️',fn:'openNDSEmulator'},
  {id:'wiiEmu',name:'Wii Emulator',desc:'Nintendo Wii',icon:'🕹️',fn:'openWiiEmulator'},
  {id:'ordinalGen',name:'Ordinal Notation Generator',desc:'Large ordinal arithmetic',icon:'Ω',fn:'openOrdinalNotation'},
  {id:'transfinite',name:'Transfinite Number Line',desc:'Visualize transfinite cardinals',icon:'∞',fn:'openTransfiniteNumberLine'}
];

let hubInstalled = JSON.parse(localStorage.getItem('hubInstalled')||'[]');
let hubUserApps = JSON.parse(localStorage.getItem('hubUserApps')||'[]');

function saveHubData(){
  localStorage.setItem('hubInstalled',JSON.stringify(hubInstalled));
  localStorage.setItem('hubUserApps',JSON.stringify(hubUserApps));
}

function hubTab(tab,el){
  window.hubCurrentTab=tab;
  let c=document.getElementById('hub-content');if(!c)return;
  if(tab==='browse'){
    hubRenderBrowse(hubAppList);
  } else if(tab==='installed'){
    hubRenderInstalled();
  } else if(tab==='install'){
    hubRenderInstall();
  }
}

function hubFilter(){
  let q=(document.getElementById('hub-search')||{}).value||'';
  q=q.toLowerCase();
  let filtered=hubAppList.filter(function(a){return a.name.toLowerCase().includes(q)||a.desc.toLowerCase().includes(q);});
  if(window.hubCurrentTab==='browse')hubRenderBrowse(filtered);
}

function hubRenderBrowse(apps){
  let c=document.getElementById('hub-content');if(!c)return;
  c.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">'+
    apps.map(function(a){
      let inst=hubInstalled.includes(a.id);
      return `<div style="border:2px outset #c0c0c0;padding:6px;background:#d0d0d0;">
        <div style="font-size:24px;text-align:center;">${a.icon}</div>
        <div style="font-weight:bold;font-size:11px;">${a.name}</div>
        <div style="font-size:10px;color:#404040;margin-bottom:4px;">${a.desc}</div>
        ${inst
          ?`<button class="btn" style="font-size:10px;" onclick="${a.fn}()">Open</button>
            <button class="btn" style="font-size:10px;" onclick="hubUninstall('${a.id}')">Remove</button>`
          :`<button class="btn" style="font-size:10px;" onclick="hubInstall('${a.id}','${a.fn}')">Install</button>`}
      </div>`;
    }).join('')+'</div>';
}

function hubRenderInstalled(){
  let c=document.getElementById('hub-content');if(!c)return;
  let installed=hubAppList.filter(function(a){return hubInstalled.includes(a.id);});
  let user=hubUserApps;
  c.innerHTML='<b>Installed Apps ('+installed.length+' built-in, '+user.length+' user)</b><br><br>'+
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">'+
    installed.map(function(a){
      return `<div style="border:1px inset #808080;padding:4px;display:flex;align-items:center;gap:4px;">
        <span style="font-size:18px;">${a.icon}</span>
        <span style="flex:1;font-size:11px;">${a.name}</span>
        <button class="btn" style="min-width:40px;font-size:10px;" onclick="${a.fn}()">Open</button>
        <button class="btn" style="min-width:40px;font-size:10px;" onclick="hubUninstall('${a.id}')">✕</button>
      </div>`;
    }).join('')+
    user.map(function(a,i){
      return `<div style="border:1px inset #808080;padding:4px;display:flex;align-items:center;gap:4px;">
        <span style="font-size:18px;">📦</span>
        <span style="flex:1;font-size:11px;">${a.name}</span>
        <button class="btn" style="min-width:40px;font-size:10px;" onclick="hubOpenUser(${i})">Open</button>
        <button class="btn" style="min-width:40px;font-size:10px;" onclick="hubUninstallUser(${i})">✕</button>
      </div>`;
    }).join('')+
    '</div>';
}

function hubRenderInstall(){
  let c=document.getElementById('hub-content');if(!c)return;
  c.innerHTML=`<div style="padding:8px;">
    <p><b>Install .lpx package</b></p><br>
    <input type="file" id="hub-lpx-file" accept=".lpx" style="width:100%;margin-bottom:8px;">
    <button class="btn" onclick="hubInstallLPX()">Install Package</button>
    <br><br>
    <p><b>Create .lpx package</b></p><br>
    <label>App Name: <input type="text" id="hub-pkg-name" style="width:200px;"></label><br><br>
    <label>HTML: <textarea id="hub-pkg-html" class="mono" style="width:100%;height:80px;"></textarea></label>
    <label>CSS: <textarea id="hub-pkg-css" class="mono" style="width:100%;height:60px;"></textarea></label>
    <label>JS: <textarea id="hub-pkg-js" class="mono" style="width:100%;height:80px;"></textarea></label>
    <button class="btn" onclick="hubCreateLPX()">Save as .lpx</button>
    <button class="btn" onclick="hubCreateAndInstall()">Create & Install</button>
  </div>`;
}

function hubInstall(id,fn){
  if(!hubInstalled.includes(id))hubInstalled.push(id);
  saveHubData();
  document.getElementById('hub-status').textContent='Installed: '+id;
  hubRenderBrowse(hubAppList);
  window[fn]&&window[fn]();
}

function hubUninstall(id){
  hubInstalled=hubInstalled.filter(function(i){return i!==id;});
  saveHubData();
  document.getElementById('hub-status').textContent='Removed: '+id;
  hubRenderBrowse(hubAppList);
}

function hubInstallLPX(){
  let inp=document.getElementById('hub-lpx-file');if(!inp||!inp.files[0])return;
  let r=new FileReader();
  r.onload=function(e){
    try{
      let data=JSON.parse(e.target.result);
      hubUserApps.push(data);saveHubData();
      document.getElementById('hub-status').textContent='Installed: '+data.name;
      hubRenderInstalled();
    }catch(err){document.getElementById('hub-status').textContent='Invalid .lpx file';}
  };r.readAsText(inp.files[0]);
}

function hubCreateLPX(){
  let name=document.getElementById('hub-pkg-name').value||'myapp';
  let html=document.getElementById('hub-pkg-html').value;
  let css=document.getElementById('hub-pkg-css').value;
  let js=document.getElementById('hub-pkg-js').value;
  let data=JSON.stringify({name,html,css,js,type:'webapp'});
  let blob=new Blob([data],{type:'application/octet-stream'});
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name+'.lpx';a.click();
}

function hubCreateAndInstall(){
  let name=document.getElementById('hub-pkg-name').value||'myapp';
  let html=document.getElementById('hub-pkg-html').value;
  let css=document.getElementById('hub-pkg-css').value;
  let js=document.getElementById('hub-pkg-js').value;
  let data={name,html,css,js,type:'webapp'};
  hubUserApps.push(data);saveHubData();
  document.getElementById('hub-status').textContent='Created and installed: '+name;
}

function hubOpenUser(i){
  let app=hubUserApps[i];if(!app)return;
  let id='user-'+i+'-'+Date.now();
  WM.make(id,app.name,500,400,
  `<style>${app.css}</style><div style="height:100%;overflow:auto;">${app.html}</div>`,{});
  let wb=WM.getContent(id);
  if(wb){let s=document.createElement('script');s.textContent=app.js;wb.appendChild(s);}
}

function hubUninstallUser(i){
  hubUserApps.splice(i,1);saveHubData();hubRenderInstalled();
}

// ─── 2048 ───
function open2048(){
  WM.make('app2048','2048',360,420,
  `<div style="display:flex;flex-direction:column;align-items:center;padding:8px;height:100%;gap:6px;">
    <div style="display:flex;gap:8px;align-items:center;">
      <span>Score: <b id="g2048-score">0</b></span>
      <span>Best: <b id="g2048-best">0</b></span>
      <button class="btn" onclick="g2048Init()">New Game</button>
    </div>
    <div id="g2048-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:#bbada0;padding:8px;width:300px;height:300px;"></div>
    <div id="g2048-msg" style="font-size:14px;font-weight:bold;"></div>
  </div>`);
  g2048Init();
  document.addEventListener('keydown',g2048Key);
}
function g2048Init(){
  window.g2048board=Array.from({length:4},function(){return Array(4).fill(0);});
  window.g2048score=0;window.g2048best=window.g2048best||0;
  document.getElementById('g2048-msg').textContent='';
  g2048Spawn();g2048Spawn();g2048Draw();
}
function g2048Spawn(){
  let empty=[];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!window.g2048board[r][c])empty.push([r,c]);
  if(!empty.length)return;
  let [r,c]=empty[Math.floor(Math.random()*empty.length)];
  window.g2048board[r][c]=Math.random()<0.9?2:4;
}
function g2048Draw(){
  let bd=document.getElementById('g2048-board');if(!bd)return;
  let colors={'0':'#cdc1b4','2':'#eee4da','4':'#ede0c8','8':'#f2b179','16':'#f59563','32':'#f67c5f','64':'#f65e3b','128':'#edcf72','256':'#edcc61','512':'#edc850','1024':'#edc53f','2048':'#edc22e'};
  bd.innerHTML=window.g2048board.flat().map(function(v){
    return `<div style="background:${colors[v]||'#3c3a32'};display:flex;align-items:center;justify-content:center;font-size:${v>999?18:22}px;font-weight:bold;color:${v<=4?'#776e65':'#f9f6f2'};border-radius:3px;">${v||''}</div>`;
  }).join('');
  document.getElementById('g2048-score').textContent=window.g2048score;
  document.getElementById('g2048-best').textContent=window.g2048best;
}
function g2048Key(e){
  if(!document.getElementById('g2048-board'))return;
  let dirs={ArrowUp:0,ArrowDown:1,ArrowLeft:2,ArrowRight:3};
  if(!(e.key in dirs))return;e.preventDefault();
  g2048Move(dirs[e.key]);
}
function g2048Move(dir){
  let b=window.g2048board;let moved=false;
  function slide(row){
    let filtered=row.filter(function(v){return v!==0;});
    for(let i=0;i<filtered.length-1;i++){
      if(filtered[i]===filtered[i+1]){filtered[i]*=2;window.g2048score+=filtered[i];if(window.g2048score>window.g2048best)window.g2048best=window.g2048score;filtered[i+1]=0;}
    }
    filtered=filtered.filter(function(v){return v!==0;});
    while(filtered.length<4)filtered.push(0);
    return filtered;
  }
  function getRow(r){return b[r].slice();}
  function getCol(c){return b.map(function(r){return r[c];});}
  function setRow(r,arr){b[r]=arr;moved=true;}
  function setCol(c,arr){arr.forEach(function(v,r){b[r][c]=v;});moved=true;}
  if(dir===2){for(let r=0;r<4;r++){let s=slide(getRow(r));if(s.join()!==getRow(r).join())setRow(r,s);}}
  else if(dir===3){for(let r=0;r<4;r++){let s=slide(getRow(r).reverse()).reverse();if(s.join()!==getRow(r).join())setRow(r,s);}}
  else if(dir===0){for(let c=0;c<4;c++){let s=slide(getCol(c));if(s.join()!==getCol(c).join())setCol(c,s);}}
  else if(dir===1){for(let c=0;c<4;c++){let s=slide(getCol(c).reverse()).reverse();if(s.join()!==getCol(c).join())setCol(c,s);}}
  if(moved)g2048Spawn();
  g2048Draw();
  if(b.flat().includes(2048))document.getElementById('g2048-msg').textContent='You win!';
}

// ─── JS CONSOLE ───
function openJSConsole(){
  WM.make('jsconsole','JS Console',520,420,
  `<div style="display:flex;flex-direction:column;height:100%;">
    <div id="jsc-output" style="flex:1;background:#1e1e1e;color:#d4d4d4;font-family:Consolas;font-size:12px;padding:6px;overflow-y:auto;white-space:pre-wrap;"></div>
    <div style="display:flex;gap:2px;padding:3px;background:#252526;">
      <span style="color:#569cd6;font-family:Consolas;padding:2px 4px;font-size:12px;">&gt;</span>
      <input type="text" id="jsc-input" class="mono" style="flex:1;background:#1e1e1e;color:#d4d4d4;border:none;outline:none;font-size:12px;"
        onkeydown="jscKey(event)" placeholder="JavaScript expression...">
      <button class="btn" onclick="jscRun()">Run</button>
      <button class="btn" onclick="jscClear()">Clear</button>
    </div>
  </div>`);
  window.jscHistory=[];window.jscHistIdx=-1;
  jscLog('loopsOS JS Console - Ready','#569cd6');
  jscLog('Type JavaScript expressions and press Enter','#808080');
}
function jscLog(msg,color){
  let out=document.getElementById('jsc-output');if(!out)return;
  let d=document.createElement('div');
  d.style.color=color||'#d4d4d4';d.textContent=msg;
  out.appendChild(d);out.scrollTop=out.scrollHeight;
}
function jscKey(e){
  if(e.key==='Enter'){jscRun();return;}
  if(e.key==='ArrowUp'){
    if(window.jscHistory.length&&window.jscHistIdx<window.jscHistory.length-1){
      window.jscHistIdx++;
      document.getElementById('jsc-input').value=window.jscHistory[window.jscHistory.length-1-window.jscHistIdx];
    }
  } else if(e.key==='ArrowDown'){
    if(window.jscHistIdx>0){window.jscHistIdx--;document.getElementById('jsc-input').value=window.jscHistory[window.jscHistory.length-1-window.jscHistIdx];}
    else{window.jscHistIdx=-1;document.getElementById('jsc-input').value='';}
  }
}
function jscRun(){
  let inp=document.getElementById('jsc-input');if(!inp)return;
  let code=inp.value.trim();if(!code)return;
  window.jscHistory.push(code);window.jscHistIdx=-1;
  jscLog('> '+code,'#9cdcfe');
  inp.value='';
  try{
    let origLog=console.log.bind(console);
    console.log=function(){jscLog(Array.from(arguments).map(function(a){return typeof a==='object'?JSON.stringify(a,null,2):String(a);}).join(' '),'#d4d4d4');origLog.apply(console,arguments);};
    let result=Function('"use strict";return ('+code+')')();
    console.log=origLog;
    if(result!==undefined)jscLog('← '+JSON.stringify(result),'#4ec9b0');
  }catch(e){jscLog('✗ '+e.message,'#f44747');}
}
function jscClear(){let out=document.getElementById('jsc-output');if(out)out.innerHTML='';}

// ─── LOOPSTTS ───
function openLoopsTTS(){
  WM.make('loopstts','LoopsTTS',420,320,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;">
    <textarea id="tts-text" style="flex:1;resize:none;" placeholder="Enter text to speak...">Hello, welcome to loopsOS text to speech.</textarea>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
      <label>Voice: <select id="tts-voice" style="min-width:140px;"></select></label>
      <label>Rate: <input type="range" id="tts-rate" min="0.1" max="3" step="0.1" value="1" style="width:80px;"><span id="tts-rate-val">1</span></label>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
      <label>Pitch: <input type="range" id="tts-pitch" min="0" max="2" step="0.1" value="1" style="width:80px;"><span id="tts-pitch-val">1</span></label>
      <label>Vol: <input type="range" id="tts-vol" min="0" max="1" step="0.1" value="1" style="width:80px;"><span id="tts-vol-val">1</span></label>
    </div>
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="ttsSpeak()">▶ Speak</button>
      <button class="btn" onclick="ttsPause()">⏸ Pause</button>
      <button class="btn" onclick="ttsStop()">■ Stop</button>
    </div>
  </div>`);
  function loadVoices(){
    let sel=document.getElementById('tts-voice');if(!sel)return;
    let voices=speechSynthesis.getVoices();
    sel.innerHTML=voices.map(function(v,i){return `<option value="${i}">${v.name} (${v.lang})</option>`;}).join('');
  }
  loadVoices();speechSynthesis.onvoiceschanged=loadVoices;
  ['rate','pitch','vol'].forEach(function(id){
    let r=document.getElementById('tts-'+id);if(!r)return;
    r.oninput=function(){let v=document.getElementById('tts-'+id+'-val');if(v)v.textContent=this.value;};
  });
}
function ttsSpeak(){
  let text=document.getElementById('tts-text').value;if(!text)return;
  let u=new SpeechSynthesisUtterance(text);
  let voices=speechSynthesis.getVoices();
  let vi=parseInt(document.getElementById('tts-voice').value);
  if(voices[vi])u.voice=voices[vi];
  u.rate=parseFloat(document.getElementById('tts-rate').value);
  u.pitch=parseFloat(document.getElementById('tts-pitch').value);
  u.volume=parseFloat(document.getElementById('tts-vol').value);
  speechSynthesis.cancel();speechSynthesis.speak(u);
}
function ttsPause(){speechSynthesis.paused?speechSynthesis.resume():speechSynthesis.pause();}
function ttsStop(){speechSynthesis.cancel();}

// ─── BYTEBEAT ───
function openBytebeat(){
  WM.make('bytebeat','Bytebeat',480,360,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;">
    <label>Expression (t = sample counter):</label>
    <select onchange="document.getElementById('bb-expr').value=this.value;bbStop();bbStart();" style="width:100%;">
      <option value="((t>>10)&42)*t/4">Classic saw</option>
      <option value="t*(t>>5|t>>8)">Weird harmonics</option>
      <option value="(t*9&t>>4|t*5&t>>7|t*3&t/1024)-1">Melodic noise</option>
      <option value="t>>4|t&t>>5">Bass groove</option>
      <option value="((t<<1)^((t<<1)+(t>>7)&t>>12))|t>>(4-(1^7&(t>>19)))|t>>7">Complex</option>
    </select>
    <input type="text" id="bb-expr" value="((t>>10)&42)*t/4" class="mono" style="width:100%;">
    <canvas id="bb-canvas" style="height:80px;background:#000;width:100%;"></canvas>
    <div style="display:flex;gap:4px;align-items:center;">
      <button class="btn" onclick="bbStart()">▶ Play</button>
      <button class="btn" onclick="bbStop()">■ Stop</button>
      <label>Rate: <select id="bb-rate"><option value="8000">8kHz</option><option value="11025">11kHz</option><option value="22050" selected>22kHz</option><option value="44100">44kHz</option></select></label>
    </div>
    <div class="status-bar" id="bb-status">Ready</div>
  </div>`);
}
function bbStart(){
  bbStop();
  let expr=document.getElementById('bb-expr').value;
  let rate=parseInt(document.getElementById('bb-rate').value);
  window.bbCtx=new (window.AudioContext||window.webkitAudioContext)({sampleRate:rate});
  let bufSize=4096;
  let proc=window.bbCtx.createScriptProcessor(bufSize,0,1);
  window.bbT=0;
  proc.onaudioprocess=function(e){
    let buf=e.outputBuffer.getChannelData(0);
    let fn;try{fn=new Function('t','return ('+expr+')&255;');}catch(err){bbStop();return;}
    for(let i=0;i<buf.length;i++){try{buf[i]=(fn(window.bbT)/127.5)-1;}catch(err){buf[i]=0;}window.bbT++;}
    let c=document.getElementById('bb-canvas');if(c){
      let ctx=c.getContext('2d');let w=c.offsetWidth||440,h=80;c.width=w;c.height=h;
      ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#0f0';ctx.beginPath();
      for(let i=0;i<w;i++){let v=buf[Math.floor(i/w*buf.length)];let y=h/2-v*h/2;i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);}ctx.stroke();
    }
  };
  proc.connect(window.bbCtx.destination);window.bbProc=proc;
  document.getElementById('bb-status').textContent='Playing at '+rate+' Hz';
}
function bbStop(){
  if(window.bbProc){try{window.bbProc.disconnect();}catch(e){}}
  if(window.bbCtx){try{window.bbCtx.close();}catch(e){}}
  window.bbProc=null;window.bbCtx=null;
  let s=document.getElementById('bb-status');if(s)s.textContent='Stopped';
}

// ─── JSON EDITOR ───
function openJSONEditor(){
  WM.make('jsoneditor','JSON Editor',520,440,
  `<div style="display:flex;flex-direction:column;height:100%;padding:4px;gap:3px;">
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="jsonLoad()">Load File</button>
      <button class="btn" onclick="jsonValidate()">Validate</button>
      <button class="btn" onclick="jsonFormat()">Format</button>
      <button class="btn" onclick="jsonMinify()">Minify</button>
      <button class="btn" onclick="jsonSave()">Save</button>
    </div>
    <div style="display:flex;flex:1;min-height:0;gap:3px;">
      <textarea id="json-raw" class="mono" style="flex:1;resize:none;" placeholder='{"key":"value"}'></textarea>
      <div id="json-tree" style="flex:1;border:2px inset #808080;background:#fff;overflow:auto;padding:4px;font-family:Consolas;font-size:11px;"></div>
    </div>
    <div class="status-bar" id="json-status">Ready</div>
  </div>`);
}
function jsonValidate(){
  let src=document.getElementById('json-raw').value;
  try{JSON.parse(src);document.getElementById('json-status').textContent='✔ Valid JSON';jsonRenderTree();}
  catch(e){document.getElementById('json-status').textContent='✗ '+e.message;}
}
function jsonFormat(){
  try{
    let o=JSON.parse(document.getElementById('json-raw').value);
    document.getElementById('json-raw').value=JSON.stringify(o,null,2);
    document.getElementById('json-status').textContent='Formatted';
  }catch(e){document.getElementById('json-status').textContent='✗ '+e.message;}
}
function jsonMinify(){
  try{
    let o=JSON.parse(document.getElementById('json-raw').value);
    document.getElementById('json-raw').value=JSON.stringify(o);
    document.getElementById('json-status').textContent='Minified';
  }catch(e){document.getElementById('json-status').textContent='✗ '+e.message;}
}
function jsonLoad(){
  let inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';
  inp.onchange=function(){let r=new FileReader();r.onload=function(e){document.getElementById('json-raw').value=e.target.result;jsonRenderTree();};r.readAsText(inp.files[0]);};
  inp.click();
}
function jsonSave(){
  let blob=new Blob([document.getElementById('json-raw').value],{type:'application/json'});
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='data.json';a.click();
}
function jsonRenderTree(){
  let tree=document.getElementById('json-tree');if(!tree)return;
  try{
    let o=JSON.parse(document.getElementById('json-raw').value);
    tree.innerHTML=jsonNodeHTML(o,0);
  }catch(e){tree.innerHTML='<span style="color:red;">Invalid JSON</span>';}
}
function jsonNodeHTML(val,depth){
  if(val===null)return '<span style="color:#569cd6;">null</span>';
  if(typeof val==='boolean')return '<span style="color:#569cd6;">'+val+'</span>';
  if(typeof val==='number')return '<span style="color:#b5cea8;">'+val+'</span>';
  if(typeof val==='string')return '<span style="color:#ce9178;">"'+val.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'"</span>';
  if(Array.isArray(val)){
    if(!val.length)return '[]';
    let pad='&nbsp;'.repeat((depth+1)*4);
    return '[<br>'+val.map(function(v){return pad+jsonNodeHTML(v,depth+1);}).join(',<br>')+'<br>'+'&nbsp;'.repeat(depth*4)+']';
  }
  if(typeof val==='object'){
    let keys=Object.keys(val);if(!keys.length)return '{}';
    let pad='&nbsp;'.repeat((depth+1)*4);
    return '{<br>'+keys.map(function(k){return pad+'<span style="color:#9cdcfe;">"'+k+'"</span>: '+jsonNodeHTML(val[k],depth+1);}).join(',<br>')+'<br>'+'&nbsp;'.repeat(depth*4)+'}';
  }
  return String(val);
}

// ─── IMAGE FILE ───
function openImageFile(){
  WM.make('imagefile','Image Viewer',500,420,
  `<div style="display:flex;flex-direction:column;height:100%;">
    <div style="padding:3px;display:flex;gap:3px;background:#c0c0c0;">
      <button class="btn" onclick="imgOpen()">Open</button>
      <button class="btn" onclick="imgZoom(1.2)">Zoom +</button>
      <button class="btn" onclick="imgZoom(0.8)">Zoom -</button>
      <button class="btn" onclick="imgReset()">1:1</button>
      <button class="btn" onclick="imgRotate()">Rotate</button>
      <button class="btn" onclick="imgFlip()">Flip H</button>
      <button class="btn" onclick="imgSave()">Save</button>
    </div>
    <div id="img-container" style="flex:1;overflow:auto;background:#404040;display:flex;align-items:center;justify-content:center;">
      <canvas id="img-canvas" style="image-rendering:pixelated;cursor:crosshair;"></canvas>
    </div>
    <div class="status-bar" id="img-status">No image loaded</div>
  </div>`);
  window.imgScale=1;window.imgAngle=0;window.imgFlipH=false;window.imgSrc=null;
}
function imgOpen(){
  let inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=function(){
    let f=inp.files[0];let r=new FileReader();
    r.onload=function(e){
      window.imgSrc=e.target.result;window.imgScale=1;window.imgAngle=0;window.imgFlipH=false;
      let img=new Image();img.onload=function(){window.imgOrig=img;imgDraw();};img.src=e.target.result;
      document.getElementById('img-status').textContent=f.name+' ('+f.size+' bytes)';
    };r.readAsDataURL(f);
  };inp.click();
}
function imgDraw(){
  let c=document.getElementById('img-canvas');if(!c||!window.imgOrig)return;
  let img=window.imgOrig;
  c.width=img.width*window.imgScale;c.height=img.height*window.imgScale;
  let ctx=c.getContext('2d');
  ctx.save();
  ctx.translate(c.width/2,c.height/2);
  ctx.rotate(window.imgAngle*Math.PI/180);
  if(window.imgFlipH)ctx.scale(-1,1);
  ctx.drawImage(img,-img.width*window.imgScale/2,-img.height*window.imgScale/2,img.width*window.imgScale,img.height*window.imgScale);
  ctx.restore();
}
function imgZoom(f){window.imgScale*=f;imgDraw();}
function imgReset(){window.imgScale=1;imgDraw();}
function imgRotate(){window.imgAngle=(window.imgAngle+90)%360;imgDraw();}
function imgFlip(){window.imgFlipH=!window.imgFlipH;imgDraw();}
function imgSave(){
  let c=document.getElementById('img-canvas');if(!c)return;
  let a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='image.png';a.click();
}

// ─── BAN GENERATOR (Big Ass Numbers) ───
function openBANGenerator(){
  WM.make('bangenerator','BAN Generator',460,400,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;">
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      <button class="btn" onclick="banCalc('power')">a^b</button>
      <button class="btn" onclick="banCalc('tetration')">a^^b</button>
      <button class="btn" onclick="banCalc('pentation')">a^^^b</button>
      <button class="btn" onclick="banCalc('ackermann')">Ackermann</button>
      <button class="btn" onclick="banCalc('graham')">Graham</button>
      <button class="btn" onclick="banCalc('busy')">Busy Beaver</button>
      <button class="btn" onclick="banCalc('TREE')">TREE(n)</button>
      <button class="btn" onclick="banCalc('SCG')">SCG(n)</button>
    </div>
    <div style="display:flex;gap:4px;align-items:center;">
      <label>a: <input type="number" id="ban-a" value="3" style="width:60px;"></label>
      <label>b: <input type="number" id="ban-b" value="3" style="width:60px;"></label>
    </div>
    <div id="ban-result" style="flex:1;background:#fff;border:2px inset #808080;padding:6px;overflow-y:auto;font-family:Consolas;font-size:11px;white-space:pre-wrap;"></div>
  </div>`);
}
function banCalc(type){
  let a=parseInt(document.getElementById('ban-a').value)||3;
  let b=parseInt(document.getElementById('ban-b').value)||3;
  let out=document.getElementById('ban-result');if(!out)return;
  let res='';
  if(type==='power'){
    res=`${a}^${b} = ${Math.pow(a,b)}\n≈ 10^${(Math.log10(Math.pow(a,b))).toFixed(2)}`;
  } else if(type==='tetration'){
    res=`${a}^^${b} (a tetrated to b)\n`;
    if(b===1)res+=a;
    else if(b===2)res+=a+'^'+a+' = '+Math.pow(a,a);
    else if(b===3)res+=a+'^'+a+'^'+a+' = '+a+'^'+Math.pow(a,a)+' ≈ 10^(10^'+Math.log10(Math.pow(a,a)).toFixed(2)+')';
    else res+=`Astronomically large — tower of ${b} copies of ${a}`;
    res+='\n\nNotation: ';
    for(let i=0;i<Math.min(b,8);i++)res+=i<b-1?a+'^(':`${a}`;
    for(let i=0;i<Math.min(b-1,7);i++)res+=')';
  } else if(type==='pentation'){
    res=`${a}^^^${b} (pentation)\n= ${a} tetrated ${b} times\n`;
    res+=`${a}^^${a}^^...^^${a} (${b} ${a}s)\n`;
    res+=`Incomprehensibly large. Even ${a}^^${a} = ${a}^${Math.pow(a,a)} has ${Math.pow(a,a).toString().length}+ digits.`;
  } else if(type==='ackermann'){
    function ack(m,n){
      if(m===0)return n+1;if(n===0)return ack(m-1,1);return ack(m-1,ack(m,n-1));
    }
    let am=Math.min(a,4),bn=Math.min(b,4);
    try{res=`A(${am},${bn}) = ${ack(am,bn)}\n\nA(4,1) ≈ 2^65536\nA(4,2) ≈ 2^(2^65536)\nA(5,1) is already incomprehensible.`;}
    catch(e){res='Overflow for A('+am+','+bn+') — too large!';}
  } else if(type==='graham'){
    res=`Graham's Number:\n\ng1 = 3^^^^3\ng2 = 3 (↑^g1) 3\n...and so on...\ng64 = Graham's Number G\n\nThe number of up-arrows in g(k) equals g(k-1).\ng1 = 3^^^^3 has a tower of 3's of height 3^^3 = 7625597484987\n\nFor comparison:\n- The observable universe has ~10^80 atoms\n- Graham's number is so large that even the number of digits, the number of digits of the number of digits... (repeated 64 times) cannot fit in the universe.\n\nLast digits of Graham's number: ...2464195387`;
  } else if(type==='busy'){
    let known=[0,1,4,6,13,4098];
    res=`Busy Beaver function Σ(n):\n`;
    for(let i=1;i<=Math.min(a,6);i++){res+=(i<known.length?`Σ(${i}) = ${known[i]}`:`Σ(${i}) = unknown (non-computable)`)+'\n';}
    res+='\nΣ is non-computable — grows faster than any computable function.\nΣ(7) > 10^(10^(10^18705))';
  } else if(type==='TREE'){
    res=`TREE(n):\nTREE(1) = 1\nTREE(2) = 3\nTREE(3) = beyond description\n\nTREE(3) >> Graham's Number\nTREE(3) is a finite number provably much larger than G.\nIts exact value is non-computable for practical purposes.\nEven in terms of the fast-growing hierarchy,\nTREE(3) sits at fΓ_0(n) level or higher.`;
  } else if(type==='SCG'){
    res=`SCG(n) - Subcubic Graph Numbers:\nSCG(1) = 6\nSCG(2) = 3 × 2^(3 × 2^(3 × 2^(3 × ...) )) (insanely large)\nSCG(3) >> TREE(TREE(TREE(...)))\n\nSCG grows faster than TREE.\nSCG(2) already surpasses TREE(3) by an incomprehensible margin.\nSCG is proven finite but non-elementary.`;
  }
  out.textContent=res;
}

// ─── TON GENERATOR ───
function openTONGenerator(){
  WM.make('tongenerator','TON Generator',420,360,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;">
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <label>Freq: <input type="number" id="ton-freq" value="440" min="1" max="22000" style="width:80px;"> Hz</label>
      <label>Wave: <select id="ton-wave"><option>sine</option><option>square</option><option>sawtooth</option><option>triangle</option></select></label>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <label>Vol: <input type="range" id="ton-vol" min="0" max="1" step="0.01" value="0.5" style="width:100px;"></label>
      <label>Duration: <input type="number" id="ton-dur" value="0" style="width:60px;"> s (0=∞)</label>
    </div>
    <div id="ton-presets" style="display:flex;gap:3px;flex-wrap:wrap;">
      ${[['A4','440'],['C4','261.63'],['A3','220'],['A5','880'],['1kHz','1000'],['10kHz','10000'],['20kHz','20000'],['Sub','40'],['Bass','100'],['DTMF-1','697'],['DTMF-2','770']].map(function(p){
        return `<button class="btn" style="font-size:10px;" onclick="tonPreset(${p[1]})">${p[0]}</button>`;
      }).join('')}
    </div>
    <canvas id="ton-canvas" style="flex:1;background:#000;width:100%;min-height:80px;"></canvas>
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="tonPlay()">▶ Play</button>
      <button class="btn" onclick="tonStop()">■ Stop</button>
      <button class="btn" onclick="tonSweep()">Sweep</button>
      <button class="btn" onclick="tonBinaural()">Binaural</button>
    </div>
    <div class="status-bar" id="ton-status">Ready</div>
  </div>`);
}
function tonPlay(){
  tonStop();
  let freq=parseFloat(document.getElementById('ton-freq').value)||440;
  let wave=document.getElementById('ton-wave').value;
  let vol=parseFloat(document.getElementById('ton-vol').value)||0.5;
  let dur=parseFloat(document.getElementById('ton-dur').value)||0;
  window.tonCtx=new (window.AudioContext||window.webkitAudioContext)();
  let osc=window.tonCtx.createOscillator();
  let gain=window.tonCtx.createGain();
  osc.type=wave;osc.frequency.value=freq;gain.gain.value=vol;
  osc.connect(gain);gain.connect(window.tonCtx.destination);osc.start();
  window.tonOsc=osc;window.tonGain=gain;
  if(dur>0)setTimeout(tonStop,dur*1000);
  document.getElementById('ton-status').textContent='Playing: '+freq+' Hz '+wave;
  tonAnimate(freq);
}
function tonAnimate(freq){
  let c=document.getElementById('ton-canvas');if(!c)return;
  let ctx=c.getContext('2d');let t=0;
  function frame(){
    if(!window.tonOsc)return;
    let w=c.offsetWidth||380,h=Math.max(80,c.offsetHeight||80);c.width=w;c.height=h;
    ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#0f0';ctx.lineWidth=2;ctx.beginPath();
    for(let x=0;x<w;x++){let v=Math.sin((x/w)*freq/10+t);let y=h/2+v*h*0.4;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();t+=0.1;window.tonAnimId=requestAnimationFrame(frame);
  }frame();
}
function tonStop(){
  if(window.tonOsc){try{window.tonOsc.stop();}catch(e){}window.tonOsc=null;}
  if(window.tonCtx){try{window.tonCtx.close();}catch(e){}window.tonCtx=null;}
  if(window.tonAnimId)cancelAnimationFrame(window.tonAnimId);
  let s=document.getElementById('ton-status');if(s)s.textContent='Stopped';
}
function tonPreset(f){let el=document.getElementById('ton-freq');if(el){el.value=f;}tonPlay();}
function tonSweep(){
  tonStop();
  window.tonCtx=new (window.AudioContext||window.webkitAudioContext)();
  let osc=window.tonCtx.createOscillator();
  let gain=window.tonCtx.createGain();
  osc.type=document.getElementById('ton-wave').value;
  osc.frequency.setValueAtTime(20,window.tonCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(20000,window.tonCtx.currentTime+5);
  gain.gain.value=parseFloat(document.getElementById('ton-vol').value)||0.5;
  osc.connect(gain);gain.connect(window.tonCtx.destination);
  osc.start();window.tonOsc=osc;
  setTimeout(tonStop,5500);
  document.getElementById('ton-status').textContent='Sweeping 20Hz→20kHz...';
}
function tonBinaural(){
  tonStop();
  window.tonCtx=new (window.AudioContext||window.webkitAudioContext)();
  let freq=parseFloat(document.getElementById('ton-freq').value)||440;
  let beat=10;
  let oL=window.tonCtx.createOscillator(),oR=window.tonCtx.createOscillator();
  let mL=window.tonCtx.createChannelMerger(2);
  let pL=window.tonCtx.createStereoPanner(),pR=window.tonCtx.createStereoPanner();
  oL.frequency.value=freq;oR.frequency.value=freq+beat;
  pL.pan.value=-1;pR.pan.value=1;
  oL.connect(pL);oR.connect(pR);pL.connect(window.tonCtx.destination);pR.connect(window.tonCtx.destination);
  oL.start();oR.start();window.tonOsc={stop:function(){oL.stop();oR.stop();}};
  document.getElementById('ton-status').textContent=`Binaural: ${freq}Hz L | ${freq+beat}Hz R (${beat}Hz beat)`;
}

// ─── FGH GENERATOR ───
function openFGHGenerator(){
  WM.make('fghgenerator','FGH Generator',520,440,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;">
    <p>Fast Growing Hierarchy: f_α(n)</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
      <label>α (level): <input type="number" id="fgh-alpha" value="2" min="0" max="10" style="width:60px;"></label>
      <label>n: <input type="number" id="fgh-n" value="3" min="1" max="100" style="width:60px;"></label>
      <button class="btn" onclick="fghCalc()">Calculate</button>
      <button class="btn" onclick="fghTable()">Show Table</button>
      <button class="btn" onclick="fghExplain()">Explain</button>
    </div>
    <div id="fgh-result" style="flex:1;background:#fff;border:2px inset #808080;padding:6px;overflow-y:auto;font-family:Consolas;font-size:11px;white-space:pre-wrap;"></div>
  </div>`);
}
function fghCalc(){
  let alpha=parseInt(document.getElementById('fgh-alpha').value)||2;
  let n=parseInt(document.getElementById('fgh-n').value)||3;
  let out=document.getElementById('fgh-result');if(!out)return;
  let res='f_'+alpha+'('+n+') = ';
  if(alpha===0){res+=n+1;}
  else if(alpha===1){res+='f_0^n(n) = n + n = '+(2*n)+' (applies f_0 n times)';}
  else if(alpha===2){res+='f_1^n(n) = n * 2^n = '+(n*Math.pow(2,n))+'\n(applies f_1 n times)';}
  else if(alpha===3){
    let val=n*Math.pow(2,n);
    for(let i=1;i<n;i++){if(val>1e15){val=Infinity;break;}val=val*Math.pow(2,val);}
    res+=val===Infinity?`Beyond JavaScript number range\n≈ tower of exponents of height ${n}`:`${val}`;
  } else {
    res+=`(α=${alpha},n=${n}) is incomprehensibly large.\nFor reference:\n- f_3(3) >> Graham's Number\n- f_ω(n) applies f_n n times\n- f_(ω+1)(n) applies f_ω n times\n- f_ε0(n) and beyond are used in proof theory`;
  }
  out.textContent=res;
}
function fghTable(){
  let out=document.getElementById('fgh-result');if(!out)return;
  let tbl='Fast Growing Hierarchy Table:\n\n';
  tbl+='α\\n |    1    |    2    |    3    |    4    |\n';
  tbl+='------+----------+----------+----------+----------+\n';
  function fghVal(a,n){
    if(a===0)return n+1;
    if(a===1)return 2*n;
    if(a===2)return n*Math.pow(2,n);
    return Infinity;
  }
  for(let a=0;a<=4;a++){
    let row='f_'+a+'    |';
    for(let n=1;n<=4;n++){
      let v=fghVal(a,n);
      let s=v===Infinity?'  ???  ':String(v).padStart(8);
      row+=s+'|';
    }
    tbl+=row+'\n';
  }
  tbl+='\nf_ω(n)   = f_n(n)\nf_ω+1(n) = f_ω^n(n)\nf_ε0(n)  ≈ Ackermann function level\nf_Γ0(n)  ≈ TREE function level';
  out.textContent=tbl;
}
function fghExplain(){
  let out=document.getElementById('fgh-result');if(!out)return;
  out.textContent=`Fast Growing Hierarchy Explanation:
  
Base cases:
  f_0(n) = n + 1

Successor ordinals:
  f_(α+1)(n) = f_α^n(n)
  (apply f_α exactly n times)

Limit ordinals (like ω):
  f_ω(n) = f_n(n)

Growth rates:
  f_0(n) = n+1           (successor)
  f_1(n) = 2n            (linear)
  f_2(n) = n·2^n         (exponential-ish)
  f_3(n) = massive tower  (already > Graham at n=3)
  f_ω(n) = n-th level applied n times
  f_(ω^ω)(n) ≈ Ackermann
  f_ε0(n) ≈ proof-theoretic strength of PA
  f_Γ0(n) ≈ ATR_0 proof theory (TREE level)
  f_(small Veblen ordinal)(n) ≈ SCG

Ordinal hierarchy:
  0 < 1 < 2 < ... < ω < ω+1 < ... < ω^2 < ... < ω^ω < ... < ε0 < ... < Γ0 < ...`;
}

// ─── NES EMULATOR ───
function openNESEmulator(){
  WM.make('nesemu','NES Emulator',520,460,
  `<div style="display:flex;flex-direction:column;height:100%;background:#222;">
    <div style="background:#333;padding:4px;display:flex;gap:4px;align-items:center;">
      <button class="btn" onclick="nesLoad()">Load ROM (.nes)</button>
      <button class="btn" onclick="nesReset()">Reset</button>
      <span id="nes-title" style="color:#fff;font-family:Consolas;font-size:11px;flex:1;">No ROM loaded</span>
      <span style="color:#888;font-size:10px;">Arrow Keys + Z/X</span>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;">
      <canvas id="nes-canvas" width="256" height="240" style="image-rendering:pixelated;width:512px;height:480px;max-width:100%;max-height:100%;"></canvas>
    </div>
    <div style="background:#333;padding:4px;display:flex;gap:8px;align-items:center;">
      <span style="color:#aaa;font-size:10px;">D-Pad: Arrow Keys | A: Z | B: X | Select: Shift | Start: Enter</span>
    </div>
  </div>`);
  nesInitCanvas();
}
function nesInitCanvas(){
  let c=document.getElementById('nes-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  ctx.fillStyle='#000';ctx.fillRect(0,0,256,240);
  ctx.fillStyle='#00f';ctx.font='14px Consolas';
  ctx.fillStyle='#0f0';ctx.fillText('NES Emulator',60,100);
  ctx.fillText('Load a .nes ROM file',40,120);
  ctx.fillText('Controls:',80,150);
  ctx.fillStyle='#aaa';
  ctx.fillText('Arrows = D-Pad',60,170);
  ctx.fillText('Z = A  X = B',60,185);
  ctx.fillText('Enter = Start',60,200);
  ctx.fillText('Shift = Select',60,215);
}
function nesLoad(){
  let inp=document.createElement('input');inp.type='file';inp.accept='.nes';
  inp.onchange=function(){
    let f=inp.files[0];if(!f)return;
    document.getElementById('nes-title').textContent=f.name;
    let r=new FileReader();r.onload=function(e){nesRun(new Uint8Array(e.target.result),f.name);};
    r.readAsArrayBuffer(f);
  };inp.click();
}
function nesRun(rom,name){
  let c=document.getElementById('nes-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  let header=rom.slice(0,16);
  let prg=header[4];let chr=header[5];
  let mapperNum=(header[6]>>4)|(header[7]&0xF0);
  ctx.fillStyle='#000';ctx.fillRect(0,0,256,240);
  ctx.fillStyle='#0f8';ctx.font='12px Consolas';
  ctx.fillText('ROM: '+name,4,16);
  ctx.fillText('PRG banks: '+prg,4,32);
  ctx.fillText('CHR banks: '+chr,4,48);
  ctx.fillText('Mapper: '+mapperNum,4,64);
  ctx.fillText('Full NES emulation requires',4,100);
  ctx.fillText('integration of JSNes or similar.',4,116);
  ctx.fillText('ROM parsed successfully.',4,132);
  for(let i=0;i<200;i++){
    ctx.fillStyle='hsl('+(i*7)+',80%,50%)';
    ctx.fillRect(Math.random()*256,160+Math.random()*70,2,2);
  }
}
function nesReset(){nesInitCanvas();document.getElementById('nes-title').textContent='No ROM loaded';}

// ─── SNES EMULATOR ───
function openSNESEmulator(){
  WM.make('snesemu','SNES Emulator',560,480,
  `<div style="display:flex;flex-direction:column;height:100%;background:#1a1a1a;">
    <div style="background:#2a2a2a;padding:4px;display:flex;gap:4px;">
      <button class="btn" onclick="snesLoad()">Load ROM (.sfc/.smc)</button>
      <button class="btn" onclick="snesReset()">Reset</button>
      <span id="snes-title" style="color:#fff;font-family:Consolas;font-size:11px;flex:1;">No ROM loaded</span>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;">
      <canvas id="snes-canvas" width="256" height="224" style="image-rendering:pixelated;width:512px;height:448px;max-width:100%;max-height:100%;"></canvas>
    </div>
    <div style="background:#2a2a2a;padding:2px;font-size:10px;color:#888;text-align:center;">
      Arrows=D-Pad | Z=B | X=Y | A=A | S=X | Enter=Start | Shift=Select | Q=L | E=R
    </div>
  </div>`);
  snesInitCanvas();
}
function snesInitCanvas(){
  let c=document.getElementById('snes-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  ctx.fillStyle='#1a0050';ctx.fillRect(0,0,256,224);
  let g=ctx.createLinearGradient(0,0,256,224);
  g.addColorStop(0,'#200080');g.addColorStop(1,'#000040');
  ctx.fillStyle=g;ctx.fillRect(0,0,256,224);
  ctx.fillStyle='#a0a0ff';ctx.font='bold 14px Consolas';
  ctx.fillText('SNES Emulator',50,80);
  ctx.fillStyle='#8080ff';ctx.font='12px Consolas';
  ctx.fillText('Load a .sfc or .smc ROM',30,100);
  ctx.fillText('Arrows + ZXAS + Enter',40,140);
}
function snesLoad(){
  let inp=document.createElement('input');inp.type='file';inp.accept='.sfc,.smc,.zip';
  inp.onchange=function(){
    let f=inp.files[0];if(!f)return;
    document.getElementById('snes-title').textContent=f.name;
    let r=new FileReader();r.onload=function(e){snesRun(new Uint8Array(e.target.result),f.name);};
    r.readAsArrayBuffer(f);
  };inp.click();
}
function snesRun(rom,name){
  let c=document.getElementById('snes-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  ctx.fillStyle='#1a0050';ctx.fillRect(0,0,256,224);
  ctx.fillStyle='#a0a0ff';ctx.font='12px Consolas';
  ctx.fillText(name,4,16);
  ctx.fillText('ROM size: '+(rom.length/1024).toFixed(0)+' KB',4,32);
  ctx.fillText('Header: '+Array.from(rom.slice(0,4)).map(function(b){return b.toString(16).padStart(2,'0');}).join(' '),4,48);
  ctx.fillText('Full SNES emulation requires',4,80);
  ctx.fillText('SNES9x-like core integration.',4,96);
  ctx.fillText('ROM detected and parsed.',4,112);
}
function snesReset(){snesInitCanvas();document.getElementById('snes-title').textContent='No ROM loaded';}

// ─── N64 EMULATOR ───
function openN64Emulator(){
  WM.make('n64emu','N64 Emulator',560,480,
  `<div style="display:flex;flex-direction:column;height:100%;background:#111;">
    <div style="background:#222;padding:4px;display:flex;gap:4px;">
      <button class="btn" onclick="n64Load()">Load ROM (.n64/.z64/.v64)</button>
      <button class="btn" onclick="n64Reset()">Reset</button>
      <span id="n64-title" style="color:#fff;font-family:Consolas;font-size:11px;flex:1;">No ROM loaded</span>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;">
      <canvas id="n64-canvas" width="320" height="240" style="image-rendering:pixelated;width:480px;height:360px;max-width:100%;max-height:100%;"></canvas>
    </div>
    <div style="background:#222;padding:2px;font-size:10px;color:#888;text-align:center;">
      Arrows=Stick | ZXAS=ABCR | Enter=Start | Shift=Z
    </div>
  </div>`);
  n64InitCanvas();
}
function n64InitCanvas(){
  let c=document.getElementById('n64-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  ctx.fillStyle='#000';ctx.fillRect(0,0,320,240);
  ctx.fillStyle='#f00';ctx.font='bold 16px Consolas';
  ctx.fillText('N64 Emulator',90,100);
  ctx.fillStyle='#fff';ctx.font='12px Consolas';
  ctx.fillText('Load a .n64, .z64, or .v64 ROM',30,130);
}
function n64Load(){
  let inp=document.createElement('input');inp.type='file';inp.accept='.n64,.z64,.v64,.rom';
  inp.onchange=function(){
    let f=inp.files[0];if(!f)return;
    document.getElementById('n64-title').textContent=f.name;
    let r=new FileReader();r.onload=function(e){n64Run(new Uint8Array(e.target.result),f.name);};
    r.readAsArrayBuffer(f);
  };inp.click();
}
function n64Run(rom,name){
  let c=document.getElementById('n64-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  let g=ctx.createLinearGradient(0,0,0,240);g.addColorStop(0,'#003');g.addColorStop(1,'#030');
  ctx.fillStyle=g;ctx.fillRect(0,0,320,240);
  ctx.fillStyle='#f88';ctx.font='12px Consolas';
  ctx.fillText(name.slice(0,36),4,16);
  ctx.fillText('Size: '+(rom.length/1048576).toFixed(1)+' MB',4,32);
  let magic=Array.from(rom.slice(0,4)).map(function(b){return '0x'+b.toString(16).padStart(2,'0');}).join(' ');
  ctx.fillText('Magic: '+magic,4,48);
  ctx.fillText('N64 emulation needs Mupen64-like',4,80);
  ctx.fillText('MIPS R4300i + RDP integration.',4,96);
}
function n64Reset(){n64InitCanvas();document.getElementById('n64-title').textContent='No ROM loaded';}

// ─── NDS EMULATOR ───
function openNDSEmulator(){
  WM.make('ndsemu','NDS Emulator',520,500,
  `<div style="display:flex;flex-direction:column;height:100%;background:#2a2a2a;">
    <div style="background:#333;padding:4px;display:flex;gap:4px;">
      <button class="btn" onclick="ndsLoad()">Load ROM (.nds)</button>
      <button class="btn" onclick="ndsReset()">Reset</button>
      <span id="nds-title" style="color:#fff;font-family:Consolas;font-size:11px;flex:1;">No ROM loaded</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:0;flex:1;">
      <canvas id="nds-top" width="256" height="192" style="image-rendering:pixelated;width:384px;height:288px;background:#000;"></canvas>
      <div style="width:384px;height:2px;background:#888;"></div>
      <canvas id="nds-bot" width="256" height="192" style="image-rendering:pixelated;width:384px;height:288px;background:#111;cursor:crosshair;" onclick="ndsTap(event)"></canvas>
    </div>
    <div style="background:#333;padding:2px;font-size:10px;color:#888;text-align:center;">
      Arrows=D-Pad | Z=A | X=B | A=X | S=Y | Enter=Start | Click bottom screen=Touch
    </div>
  </div>`);
  ndsInitCanvas();
}
function ndsInitCanvas(){
  let top=document.getElementById('nds-top');let bot=document.getElementById('nds-bot');
  if(!top||!bot)return;
  let ct=top.getContext('2d');let cb=bot.getContext('2d');
  ct.fillStyle='#000';ct.fillRect(0,0,256,192);ct.fillStyle='#aaf';ct.font='12px Consolas';ct.fillText('NDS Emulator - Top Screen',20,90);ct.fillText('Load a .nds ROM',50,110);
  cb.fillStyle='#111';cb.fillRect(0,0,256,192);cb.fillStyle='#888';cb.font='11px Consolas';cb.fillText('Bottom / Touch Screen',40,90);cb.fillText('Click to send touch input',30,110);
}
function ndsLoad(){
  let inp=document.createElement('input');inp.type='file';inp.accept='.nds';
  inp.onchange=function(){
    let f=inp.files[0];if(!f)return;
    document.getElementById('nds-title').textContent=f.name;
    let r=new FileReader();r.onload=function(e){ndsRun(new Uint8Array(e.target.result),f.name);};
    r.readAsArrayBuffer(f);
  };inp.click();
}
function ndsRun(rom,name){
  let top=document.getElementById('nds-top');if(!top)return;
  let ctx=top.getContext('2d');
  ctx.fillStyle='#001';ctx.fillRect(0,0,256,192);
  ctx.fillStyle='#88f';ctx.font='11px Consolas';
  ctx.fillText(name.slice(0,30),4,16);ctx.fillText('Size: '+(rom.length/1024).toFixed(0)+' KB',4,32);
  ctx.fillText('ARM9 offset: 0x'+rom[0x20].toString(16),4,48);
  ctx.fillText('Needs ARM9+ARM7 dual CPU',4,80);ctx.fillText('emulation (DeSmuME-like).',4,96);
}
function ndsTap(e){
  let c=document.getElementById('nds-bot');if(!c)return;
  let rect=c.getBoundingClientRect();
  let x=Math.floor((e.clientX-rect.left)/rect.width*256);
  let y=Math.floor((e.clientY-rect.top)/rect.height*192);
  let ctx=c.getContext('2d');ctx.fillStyle='rgba(255,255,0,0.5)';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();
}
function ndsReset(){ndsInitCanvas();document.getElementById('nds-title').textContent='No ROM loaded';}

// ─── WII EMULATOR ───
function openWiiEmulator(){
  WM.make('wiiemu','Wii Emulator',580,480,
  `<div style="display:flex;flex-direction:column;height:100%;background:#0a0a1a;">
    <div style="background:#15152a;padding:4px;display:flex;gap:4px;">
      <button class="btn" onclick="wiiLoad()">Load ISO/WBFS</button>
      <button class="btn" onclick="wiiReset()">Reset</button>
      <span id="wii-title" style="color:#fff;font-family:Consolas;font-size:11px;flex:1;">No game loaded</span>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;">
      <canvas id="wii-canvas" width="480" height="270" style="image-rendering:pixelated;width:480px;height:270px;max-width:100%;max-height:100%;"></canvas>
    </div>
    <div style="background:#15152a;padding:2px;font-size:10px;color:#666;text-align:center;">
      Arrows=Nunchuk | WASD=Wiimote | Z/X=A/B | C/V=+/- | Enter=Home
    </div>
  </div>`);
  wiiInitCanvas();
}
function wiiInitCanvas(){
  let c=document.getElementById('wii-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  let g=ctx.createLinearGradient(0,0,0,270);g.addColorStop(0,'#003060');g.addColorStop(1,'#001030');
  ctx.fillStyle=g;ctx.fillRect(0,0,480,270);
  ctx.fillStyle='#60c0ff';ctx.font='bold 18px Consolas';ctx.fillText('Wii Emulator',160,120);
  ctx.fillStyle='#a0d0ff';ctx.font='12px Consolas';ctx.fillText('Load a Wii ISO or WBFS image',110,150);
  ctx.fillText('Dolphin-compatible ROMs',130,170);
}
function wiiLoad(){
  let inp=document.createElement('input');inp.type='file';inp.accept='.iso,.wbfs,.rvz,.wia,.gcm,.gcz';
  inp.onchange=function(){
    let f=inp.files[0];if(!f)return;
    document.getElementById('wii-title').textContent=f.name;
    let r=new FileReader();r.onload=function(e){wiiRun(new Uint8Array(e.target.result.slice(0,0x60)),f.name,f.size);};
    r.readAsArrayBuffer(f.slice(0,0x60));
  };inp.click();
}
function wiiRun(header,name,size){
  let c=document.getElementById('wii-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  let g=ctx.createLinearGradient(0,0,0,270);g.addColorStop(0,'#001');g.addColorStop(1,'#010020');
  ctx.fillStyle=g;ctx.fillRect(0,0,480,270);
  let gameId=String.fromCharCode.apply(null,header.slice(0,6));
  ctx.fillStyle='#60c0ff';ctx.font='12px Consolas';
  ctx.fillText(name.slice(0,50),4,20);ctx.fillText('Size: '+(size/1073741824).toFixed(2)+' GB',4,36);
  ctx.fillText('Game ID: '+gameId,4,52);
  ctx.fillText('Wii emulation requires PowerPC 750CL',4,88);
  ctx.fillText('+ Broadway GPU + IOS simulation.',4,104);
  ctx.fillText('Full implementation: integrate Dolphin-emu.',4,120);
}
function wiiReset(){wiiInitCanvas();document.getElementById('wii-title').textContent='No game loaded';}

// ─── ORDINAL NOTATION GENERATOR ───
function openOrdinalNotation(){
  WM.make('ordinalgen','Ordinal Notation Generator',540,480,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;">
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      <button class="btn" onclick="ordNotation('CNF')">Cantor NF</button>
      <button class="btn" onclick="ordNotation('Veblen')">Veblen φ</button>
      <button class="btn" onclick="ordNotation('BHO')">BHO ψ</button>
      <button class="btn" onclick="ordNotation('OCF')">OCF</button>
      <button class="btn" onclick="ordNotation('compare')">Compare</button>
      <button class="btn" onclick="ordNotation('FundSeq')">Fund. Seq.</button>
    </div>
    <textarea id="ord-input" class="mono" style="height:60px;resize:none;" placeholder="Enter ordinal (e.g.: w^w^w, phi(1,0), psi(Omega))"></textarea>
    <div id="ord-output" style="flex:1;background:#fff;border:2px inset #808080;padding:6px;overflow-y:auto;font-family:Consolas;font-size:11px;white-space:pre-wrap;"></div>
  </div>`);
}
function ordNotation(type){
  let inp=(document.getElementById('ord-input').value||'').trim();
  let out=document.getElementById('ord-output');if(!out)return;
  if(type==='CNF'){
    out.textContent=`Cantor Normal Form (CNF):

Every ordinal α can be written uniquely as:
  α = ω^β₁·c₁ + ω^β₂·c₂ + ... + ω^βₙ·cₙ
where β₁ > β₂ > ... > βₙ ≥ 0 and cᵢ are positive integers.

Examples:
  0 = 0
  1 = ω^0 = ω^0·1
  2 = ω^0·2
  ω = ω^1
  ω+1 = ω^1 + ω^0
  ω·2 = ω^1·2
  ω² = ω^2
  ω^ω = ω^ω (transcends finite iteration)
  ε₀ = lim(ω, ω^ω, ω^ω^ω, ...) — fixed point of α↦ω^α

Input: "${inp||'ω^ω'}"
CNF form: ω^ω (already in CNF, limit ordinal)
Fundamental sequence: ω^ω[n] = ω^n`;
  } else if(type==='Veblen'){
    out.textContent=`Veblen Hierarchy φ(α,β):

φ(0,β) = ω^β          (ordinary powers of ω)
φ(1,0) = ε₀           (first fixed point of ω^x=x)
φ(1,β) = ε_β          (β-th epsilon number)
φ(2,0) = ζ₀           (first fixed point of ε_x=x)
φ(α,0) = Γ₀ when α=Γ₀ (Feferman-Schütte ordinal)

Multi-variable Veblen:
  φ(1,0,0) = Γ₀       (Feferman-Schütte)
  Small Veblen Ordinal = φ(1,0,0,0,0,...) (finite)

Hierarchy:
  ω < ε₀ < ε₁ < ζ₀ < Γ₀ < SVO < LVO

Fundamental sequences:
  φ(1,0)[n] = ε₀[n]: 0,1,ω,ω^ω,ω^ω^ω,...
  Γ₀[n]: Γ₀[0]=0, Γ₀[n+1]=φ(Γ₀[n],0)`;
  } else if(type==='BHO'){
    out.textContent=`Bachmann-Howard Ordinal ψ(Ω):

The Bachmann-Howard Ordinal (BHO) is the proof-theoretic
ordinal of KPω (Kripke-Platek set theory + ω).

Collapsing function ψ:
  Ω = ω₁ (first uncountable ordinal)
  ψ(0) = 1
  ψ(1) = ω
  ψ(Ω) = ε₀ ... eventually ε_0
  ψ(Ω^Ω) = BHO itself

BHO < next admissible ordinal > ε₀

ψ(α) is defined as the smallest ordinal not reachable
from {0, ω, Ω} using +, ψ, and ordinals < α.

Comparison:
  ε₀ < Γ₀ < SVO < LVO < BHO < Takeuti-Feferman-Buchholz`;
  } else if(type==='OCF'){
    out.textContent=`Ordinal Collapsing Functions (OCF):

These define ordinals far beyond BHO using large cardinals.

Buchholz ψ_k:
  ψ_0 = countable closure
  ψ_k(α) = collapse using Ω_k (k-th regular cardinal)
  TFB = Takeuti-Feferman-Buchholz ordinal

Rathjen's ψ (using Mahlo cardinals):
  M = first Mahlo cardinal
  ψ_M(α) gives ordinals at proof-theoretic strength of KPM

Stegert / Rathjen (weakly compact cardinals):
  Further collapsing past Π³₀-refl

Ordinal strength summary:
  PA:       ε₀
  ATR₀:     Γ₀
  Π¹₁-CA₀: BHO
  KPM:      ψ_M(ε_{M+1})
  KP+Π₃:   beyond Mahlo
  ZFC:      non-elementary (incomprehensible in OCF)`;
  } else if(type==='compare'){
    out.textContent=`Ordinal Comparison Table:

< means strictly less than, all are countable unless noted.

0 < 1 < 2 < ... < ω
ω < ω+1 < ... < ω·2 < ... < ω² < ... < ω^ω < ... < ε₀
ε₀ < ε₁ < ... < ζ₀ < ... < Γ₀
Γ₀ < φ(1,0,0) = Γ₀ < SVO (Small Veblen Ordinal)
SVO < LVO (Large Veblen Ordinal)
LVO < BHO (Bachmann-Howard)
BHO < TFB (Takeuti-Feferman-Buchholz)
TFB < ψ_M(ε_{M+1}) (Rathjen, Mahlo)
... < ψ_W(...) (weakly compact)
... < ZFC proof-theoretic ordinal (unknown, enormous)

Fast-growing hierarchy connection:
  f_{ε₀}(n) ≈ PA strength
  f_{Γ₀}(n) ≈ ATR₀ / TREE(n) region
  f_{BHO}(n) ≈ Π¹₁-CA₀ strength`;
  } else if(type==='FundSeq'){
    out.textContent=`Fundamental Sequences:

For a limit ordinal λ, the fundamental sequence λ[n]
is the n-th approximation to λ from below.

ω[n]    = n
ω²[n]   = ω·n
ω^ω[n]  = ω^n
ε₀[0]   = 0
ε₀[n+1] = ω^(ε₀[n])   → ε₀[n]: 0, 1, ω, ω^ω, ω^ω^ω, ...

Γ₀[0]   = 0
Γ₀[n+1] = φ(Γ₀[n], 0)

ψ(Ω)[n] = ... (defined by collapsing)

The Wainer hierarchy uses these sequences to define f_α(n):
  f_0(n)   = n+1
  f_{α+1}(n) = f_α^n(n)
  f_λ(n)   = f_{λ[n]}(n)   ← uses fundamental sequence`;
  }
}

// ─── TRANSFINITE NUMBER LINE ───
function openTransfiniteNumberLine(){
  WM.make('transfinite','Transfinite Number Line',600,480,
  `<div style="display:flex;flex-direction:column;height:100%;padding:4px;gap:4px;">
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      <button class="btn" onclick="tnlView('finite')">Finite</button>
      <button class="btn" onclick="tnlView('countable')">Countable Ordinals</button>
      <button class="btn" onclick="tnlView('cardinals')">Cardinals</button>
      <button class="btn" onclick="tnlView('large')">Large Cardinals</button>
      <button class="btn" onclick="tnlView('surreal')">Surreals</button>
    </div>
    <canvas id="tnl-canvas" style="flex:1;background:#fff;width:100%;border:2px inset #808080;cursor:crosshair;" onclick="tnlClick(event)"></canvas>
    <div id="tnl-label" style="font-family:Consolas;font-size:11px;padding:2px;border:1px inset #808080;background:#fff;"></div>
  </div>`);
  tnlView('countable');
}
function tnlView(mode){
  window.tnlMode=mode;
  let c=document.getElementById('tnl-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  let w=c.offsetWidth||560,h=c.offsetHeight||300;c.width=w;c.height=h;
  ctx.fillStyle='#f8f8ff';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(20,h/2);ctx.lineTo(w-20,h/2);ctx.stroke();
  ctx.fillStyle='#000';ctx.font='10px Consolas';
  if(mode==='finite'){
    window.tnlPoints=[];
    for(let i=0;i<=20;i++){
      let x=20+i*(w-40)/20;
      ctx.beginPath();ctx.moveTo(x,h/2-8);ctx.lineTo(x,h/2+8);ctx.stroke();
      ctx.fillText(i,x-4,h/2+20);
      window.tnlPoints.push({x,label:String(i)});
    }
    ctx.fillText('→ ...',w-30,h/2-12);
    ctx.fillStyle='#00a';ctx.font='13px Consolas';ctx.fillText('Finite Natural Numbers',20,30);
  } else if(mode==='countable'){
    let pts=[
      {label:'0'},{label:'1'},{label:'2'},{label:'...'},{label:'ω'},
      {label:'ω+1'},{label:'...'},{label:'ω·2'},{label:'...'},{label:'ω²'},
      {label:'...'},{label:'ω^ω'},{label:'...'},{label:'ε₀'},{label:'...'},{label:'Γ₀'},{label:'...'},{label:'BHO'}
    ];
    window.tnlPoints=pts.map(function(p,i){
      let x=20+i*(w-40)/(pts.length-1);
      return {x,label:p.label};
    });
    ctx.font='10px Consolas';
    window.tnlPoints.forEach(function(p){
      ctx.beginPath();ctx.moveTo(p.x,h/2-8);ctx.lineTo(p.x,h/2+8);ctx.stroke();
      ctx.fillStyle='#000';ctx.fillText(p.label,p.x-p.label.length*3,h/2+(p.label.includes('ω')||p.label==='ε₀'||p.label==='Γ₀'||p.label==='BHO'?-14:20));
    });
    ctx.fillStyle='#00a';ctx.font='13px Consolas';ctx.fillText('Countable Ordinals (0 → ω₁)',20,30);
    ctx.font='10px Consolas';ctx.fillStyle='#808080';ctx.fillText('(Each gap contains infinitely many ordinals)',20,50);
  } else if(mode==='cardinals'){
    let pts=[
      {label:'ℵ₀=ω'},{label:'ℵ₁=ω₁'},{label:'ℵ₂'},{label:'...'},{label:'ℵ_ω'},
      {label:'...'},{label:'ℶ₁=𝔠'},{label:'ℶ₂'},{label:'...'},{label:'ℶ_ω'}
    ];
    window.tnlPoints=pts.map(function(p,i){let x=20+i*(w-40)/(pts.length-1);return {x,label:p.label};});
    ctx.font='10px Consolas';
    window.tnlPoints.forEach(function(p){
      ctx.beginPath();ctx.moveTo(p.x,h/2-8);ctx.lineTo(p.x,h/2+8);ctx.stroke();
      ctx.fillStyle='#00008b';ctx.fillText(p.label,p.x-p.label.length*3,h/2-14);
    });
    ctx.fillStyle='#00a';ctx.font='13px Consolas';ctx.fillText('Infinite Cardinals (Aleph / Beth)',20,30);
    ctx.font='10px Consolas';ctx.fillStyle='#404040';
    ctx.fillText('ℵ₀ = countable infinity | ℵ₁ = first uncountable | GCH: ℶₙ = ℵₙ',20,50);
  } else if(mode==='large'){
    let pts=[
      {label:'ω₁'},{label:'ω₂'},{label:'...'},{label:'inacc.'},{label:'Mahlo'},
      {label:'w.comp.'},{label:'indesc.'},{label:'...'},{label:'meas.'},{label:'...'},{label:'supercomp.'},{label:'huge'},{label:'rank-into-rank'}
    ];
    window.tnlPoints=pts.map(function(p,i){let x=20+i*(w-40)/(pts.length-1);return {x,label:p.label};});
    ctx.font='9px Consolas';
    window.tnlPoints.forEach(function(p){
      ctx.beginPath();ctx.moveTo(p.x,h/2-6);ctx.lineTo(p.x,h/2+6);ctx.stroke();
      ctx.fillStyle='#600';ctx.fillText(p.label,p.x-p.label.length*2.5,h/2+(p.label.length>6?-12:20));
    });
    ctx.fillStyle='#600';ctx.font='13px Consolas';ctx.fillText('Large Cardinal Hierarchy',20,30);
    ctx.font='10px Consolas';ctx.fillStyle='#404040';
    ctx.fillText('Each step is unprovably consistent from the step below (Gödel incompleteness)',20,50);
  } else if(mode==='surreal'){
    let pts=[
      {label:'-∞'},{label:'...'},{label:'-ω'},{label:'-1'},{label:'-1/2'},
      {label:'0'},{label:'1/2'},{label:'1'},{label:'ω'},{label:'ω+π'},{label:'ω²'},{label:'ε₀'},{label:'...'},{label:'+∞'}
    ];
    window.tnlPoints=pts.map(function(p,i){let x=20+i*(w-40)/(pts.length-1);return {x,label:p.label};});
    ctx.font='9px Consolas';
    window.tnlPoints.forEach(function(p){
      ctx.beginPath();ctx.moveTo(p.x,h/2-6);ctx.lineTo(p.x,h/2+6);ctx.stroke();
      ctx.fillStyle='#005500';ctx.fillText(p.label,p.x-p.label.length*2.5,h/2-14);
    });
    ctx.fillStyle='#005500';ctx.font='13px Consolas';ctx.fillText('Surreal Number Line No',20,30);
    ctx.font='10px Consolas';ctx.fillStyle='#404040';
    ctx.fillText('Surreals contain all reals, ordinals, infinitesimals, and more',20,50);
    ctx.fillText('ε = 1/ω (infinitesimal) | ω-1, ω/2, √ω all exist',20,65);
  }
}
function tnlClick(e){
  let c=document.getElementById('tnl-canvas');if(!c||!window.tnlPoints)return;
  let rect=c.getBoundingClientRect();
  let mx=e.clientX-rect.left;
  let closest=window.tnlPoints.reduce(function(a,b){return Math.abs(b.x-mx)<Math.abs(a.x-mx)?b:a;});
  let desc={
    '0':'Zero — the additive identity, and the smallest ordinal.',
    '1':'One — the multiplicative identity, and the first successor ordinal.',
    'ω':'Omega — the first infinite ordinal, the set of all natural numbers.',
    'ω+1':'The successor of ω — still countable.',
    'ω·2':'ω doubled — ω many steps after ω.',
    'ω²':'ω squared — the limit of ω, ω·2, ω·3, ...',
    'ω^ω':'ω to the ω — limit of ω, ω², ω³, ...',
    'ε₀':'Epsilon-naught — fixed point of x↦ωˣ. Proof-theoretic ordinal of PA.',
    'Γ₀':'Gamma-naught — Feferman-Schütte ordinal, proof strength of ATR₀.',
    'BHO':'Bachmann-Howard Ordinal — proof strength of KPω.',
    'ℵ₀=ω':'Aleph-null — cardinality of natural numbers, smallest infinity.',
    'ℵ₁=ω₁':'Aleph-one — the first uncountable cardinal.',
    'ℶ₁=𝔠':'Beth-one — cardinality of the reals (continuum). GCH: ℶ₁ = ℵ₁.',
    'inacc.':'Inaccessible Cardinal — cannot be reached by standard set operations.',
    'Mahlo':'Mahlo Cardinal — stationary many inaccessibles below.',
    'meas.':'Measurable Cardinal — admits a non-trivial κ-complete ultrafilter.',
    'huge':'Huge Cardinal — j: V→M with critical point κ, M^(j(κ)) ⊆ M.'
  };
  let label=document.getElementById('tnl-label');
  if(label)label.textContent=(closest.label)+': '+(desc[closest.label]||'A point on the transfinite number line.');
}
