// loopsOS apps-system.js

window.WM = (function(){
  let windows = {};
  let zCounter = 100;
  let activeWin = null;
  let dragState = null;
  let resizeState = null;

  function make(id, title, w, h, content, opts){
    opts = opts||{};
    if(windows[id]){focus(id);return;}
    let el = document.createElement('div');
    el.className = 'window';
    el.id = 'win-'+id;
    el.style.width = (w||400)+'px';
    el.style.height = (h||300)+'px';
    el.style.left = (100+Math.random()*200)+'px';
    el.style.top = (60+Math.random()*100)+'px';
    el.style.zIndex = ++zCounter;
    el.innerHTML = `<div class="title-bar" data-winid="${id}">
      <span class="title-bar-text">${title}</span>
      <div class="title-bar-controls">
        ${opts.noMin?'':'<button onclick="WM.minimize(\''+id+'\')">_</button>'}
        ${opts.noMax?'':'<button onclick="WM.maximize(\''+id+'\')">&#9633;</button>'}
        <button onclick="WM.close('${id}')">✕</button>
      </div>
    </div>
    ${opts.menuBar||''}
    <div class="window-body" id="wb-${id}" style="position:relative;overflow:hidden;height:calc(100% - 20px${opts.menuBar?' - 18px':''});">
    ${content}
    </div>
    ${opts.noResize?'':'<div class="resize-handle" data-winid="'+id+'">&#8990;</div>'}`;
    document.getElementById('desktop').appendChild(el);
    windows[id]={el,title,minimized:false,origRect:null};
    el.addEventListener('mousedown',function(e){if(!e.target.closest('.title-bar-controls'))focus(id);});
    el.querySelector('.title-bar').addEventListener('mousedown',function(e){startDrag(e,id);});
    let rh = el.querySelector('.resize-handle');
    if(rh)rh.addEventListener('mousedown',function(e){startResize(e,id);});
    focus(id);
    addTaskBtn(id,title);
    if(opts.onOpen)opts.onOpen(id);
  }

  function focus(id){
    if(!windows[id])return;
    Object.values(windows).forEach(function(w){w.el.classList.remove('active');});
    windows[id].el.classList.add('active');
    windows[id].el.style.zIndex = ++zCounter;
    activeWin = id;
    document.querySelectorAll('.task-btn').forEach(function(b){b.classList.remove('active');});
    let tb = document.getElementById('tb-'+id);
    if(tb)tb.classList.add('active');
  }

  function close(id){
    if(!windows[id])return;
    windows[id].el.remove();
    delete windows[id];
    let tb = document.getElementById('tb-'+id);
    if(tb)tb.remove();
  }

  function minimize(id){
    if(!windows[id])return;
    windows[id].minimized = !windows[id].minimized;
    windows[id].el.style.display = windows[id].minimized?'none':'';
    let tb = document.getElementById('tb-'+id);
    if(tb)tb.classList.toggle('active',!windows[id].minimized);
  }

  function maximize(id){
    if(!windows[id])return;
    let el = windows[id].el;
    if(windows[id].origRect){
      el.style.left=windows[id].origRect.left;
      el.style.top=windows[id].origRect.top;
      el.style.width=windows[id].origRect.width;
      el.style.height=windows[id].origRect.height;
      windows[id].origRect=null;
    } else {
      windows[id].origRect={left:el.style.left,top:el.style.top,width:el.style.width,height:el.style.height};
      el.style.left='0';el.style.top='0';
      el.style.width='100vw';el.style.height='calc(100vh - 30px)';
    }
  }

  function startDrag(e,id){
    if(e.target.tagName==='BUTTON')return;
    let el=windows[id].el;
    let ox=e.clientX-el.offsetLeft,oy=e.clientY-el.offsetTop;
    dragState={id,ox,oy};
    function mv(e){
      if(!dragState)return;
      let el=windows[dragState.id].el;
      el.style.left=Math.max(0,e.clientX-dragState.ox)+'px';
      el.style.top=Math.max(0,Math.min(e.clientY-dragState.oy,window.innerHeight-50))+'px';
    }
    function up(){dragState=null;document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);}
    document.addEventListener('mousemove',mv);
    document.addEventListener('mouseup',up);
  }

  function startResize(e,id){
    let el=windows[id].el;
    let ox=e.clientX,oy=e.clientY,ow=el.offsetWidth,oh=el.offsetHeight;
    resizeState={id,ox,oy,ow,oh};
    function mv(e){
      if(!resizeState)return;
      let el=windows[resizeState.id].el;
      el.style.width=Math.max(200,resizeState.ow+(e.clientX-resizeState.ox))+'px';
      el.style.height=Math.max(150,resizeState.oh+(e.clientY-resizeState.oy))+'px';
    }
    function up(){resizeState=null;document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);}
    document.addEventListener('mousemove',mv);
    document.addEventListener('mouseup',up);
    e.preventDefault();
  }

  function addTaskBtn(id,title){
    let btn=document.createElement('button');
    btn.className='task-btn active';
    btn.id='tb-'+id;
    btn.textContent=title;
    btn.onclick=function(){
      if(windows[id]&&windows[id].minimized){WM.minimize(id);WM.focus(id);}
      else if(activeWin===id){WM.minimize(id);}
      else WM.focus(id);
    };
    document.getElementById('taskbarTasks').appendChild(btn);
  }

  function getContent(id){return document.getElementById('wb-'+id);}

  return {make,close,focus,minimize,maximize,getContent,
    dialog:function(title,msg,btns){
      let id='dlg'+Date.now();
      let bhtml=btns.map(function(b){return `<button class="btn" onclick="WM.close('${id}');${b.action||''}">${b.label}</button>`;}).join(' ');
      make(id,title,320,150,`<div style="padding:16px;"><p style="margin-bottom:16px;">${msg}</p><div style="text-align:center;">${bhtml}</div></div>`,{noMin:true,noMax:true,noResize:true});
    }
  };
})();

function showCtxMenu(x,y,items){
  let m=document.getElementById('ctxMenu');
  m.innerHTML='';
  items.forEach(function(it){
    if(it.sep){let s=document.createElement('div');s.className='ctx-sep';m.appendChild(s);return;}
    let d=document.createElement('div');d.className='ctx-item';d.textContent=it.label;
    d.onclick=function(){hideCtxMenu();if(it.action)it.action();};
    m.appendChild(d);
  });
  m.style.left=Math.min(x,window.innerWidth-160)+'px';
  m.style.top=Math.min(y,window.innerHeight-60)+'px';
  m.style.display='block';
}
function hideCtxMenu(){document.getElementById('ctxMenu').style.display='none';}

let allApps = [
  'Notepad','WordPad','Settings','Music Player','Radio FM','Visual Effects',
  'Shader Editor','Sticky Note','Media Player','Web App Maker','File Manager',
  'loopsRAR','loops7Zip','Camera','Security','Pilot Compile Math','Calculator',
  'Calendar','Contacts'
];

function renderDesktopIcons(){
  let c=document.getElementById('desktopIcons');c.innerHTML='';
  let icns=[
    {name:'Notepad',sym:'📄'},{name:'File Manager',sym:'📁'},{name:'Calculator',sym:'🧮'},
    {name:'loopsOS Hub',sym:'🏪'},{name:'Settings',sym:'⚙️'},{name:'Sticky Note',sym:'📝'}
  ];
  icns.forEach(function(ic){
    let d=document.createElement('div');d.className='desktop-icon';
    d.innerHTML=`<div style="font-size:28px;width:32px;height:32px;text-align:center;">${ic.sym}</div><span>${ic.name}</span>`;
    d.ondblclick=function(){openApp(ic.name);};
    d.oncontextmenu=function(e){e.preventDefault();e.stopPropagation();showCtxMenu(e.clientX,e.clientY,[{label:'Open',action:function(){openApp(ic.name);}}]);};
    c.appendChild(d);
  });
}

function buildStartMenu(){
  let c=document.getElementById('startMenuItems');c.innerHTML='';
  allApps.concat(['loopsOS Hub']).forEach(function(name){
    let d=document.createElement('div');d.className='start-menu-item';
    d.innerHTML=`<span>${name}</span>`;
    d.onclick=function(){closeStart();openApp(name);};
    c.appendChild(d);
  });
  let sep=document.createElement('div');sep.className='start-menu-sep';c.appendChild(sep);
  [{label:'Shut Down',sym:'⏻'}].forEach(function(it){
    let d=document.createElement('div');d.className='start-menu-item';
    d.innerHTML=`<span>${it.label}</span>`;
    d.onclick=function(){closeStart();WM.dialog('Shut Down','Are you sure you want to shut down?',[{label:'Yes',action:"document.body.innerHTML='<div style=\"background:#000;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;font-size:24px;\">It is now safe to turn off your computer.</div>';"},{label:'No'}]);};
    c.appendChild(d);
  });
}

function toggleStart(){
  let m=document.getElementById('startMenu');
  let btn=document.getElementById('startBtn');
  let isOpen=m.classList.contains('open');
  m.classList.toggle('open',!isOpen);
  btn.classList.toggle('active',!isOpen);
}
function closeStart(){
  document.getElementById('startMenu').classList.remove('open');
  document.getElementById('startBtn').classList.remove('active');
}

function openApp(name){
  let funcs={
    'Notepad':openNotepad,'WordPad':openWordPad,'Settings':openSettings,
    'Music Player':openMusicPlayer,'Radio FM':openRadioFM,'Visual Effects':openVisualEffects,
    'Shader Editor':openShaderEditor,'Sticky Note':openStickyNote,'Media Player':openMediaPlayer,
    'Web App Maker':openWebAppMaker,'File Manager':openFileManager,
    'loopsRAR':openLoopsRAR,'loops7Zip':openLoops7Zip,'Camera':openCamera,
    'Security':openSecurity,'Pilot Compile Math':openPilotCompileMath,
    'Calculator':openCalculator,'Calendar':openCalendar,'Contacts':openContacts,
    'loopsOS Hub':openLoopsOSHub
  };
  if(funcs[name])funcs[name]();
}

// ─── NOTEPAD ───
function openNotepad(){
  WM.make('notepad','Notepad',500,400,
  `<div style="display:flex;flex-direction:column;height:100%;">
    <div class="menu-bar">
      <span class="menu-item" onclick="notepadFile()">File</span>
      <span class="menu-item" onclick="notepadEdit()">Edit</span>
      <span class="menu-item" onclick="notepadFormat()">Format</span>
    </div>
    <textarea id="notepad-ta" style="flex:1;resize:none;border:none;outline:none;font-family:'Consolas',monospace;font-size:13px;padding:4px;width:100%;"></textarea>
  </div>`,{noResize:false});
}
function notepadFile(){
  showCtxMenu(document.querySelector('#win-notepad .menu-item').getBoundingClientRect().left,
  document.querySelector('#win-notepad .menu-item').getBoundingClientRect().bottom,[
    {label:'New',action:function(){document.getElementById('notepad-ta').value='';}},
    {label:'Open...',action:function(){
      let inp=document.createElement('input');inp.type='file';inp.accept='.txt';
      inp.onchange=function(){let r=new FileReader();r.onload=function(e){document.getElementById('notepad-ta').value=e.target.result;};r.readAsText(inp.files[0]);};
      inp.click();
    }},
    {label:'Save',action:function(){
      let blob=new Blob([document.getElementById('notepad-ta').value],{type:'text/plain'});
      let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='document.txt';a.click();
    }},
    {sep:true},{label:'Exit',action:function(){WM.close('notepad');}}
  ]);
}
function notepadEdit(){
  let ta=document.getElementById('notepad-ta');
  showCtxMenu(160,38,[
    {label:'Undo',action:function(){document.execCommand('undo');}},
    {sep:true},
    {label:'Cut',action:function(){navigator.clipboard.writeText(ta.value.substring(ta.selectionStart,ta.selectionEnd));ta.setRangeText('');}},
    {label:'Copy',action:function(){navigator.clipboard.writeText(ta.value.substring(ta.selectionStart,ta.selectionEnd));}},
    {label:'Paste',action:function(){navigator.clipboard.readText().then(function(t){ta.setRangeText(t);});}},
    {label:'Select All',action:function(){ta.select();}},
    {sep:true},
    {label:'Find...',action:function(){
      let q=prompt('Find:');if(!q)return;
      let i=ta.value.indexOf(q,ta.selectionEnd);
      if(i<0)i=ta.value.indexOf(q);
      if(i>=0){ta.setSelectionRange(i,i+q.length);ta.focus();}
    }}
  ]);
}
function notepadFormat(){
  showCtxMenu(220,38,[
    {label:'Font...',action:function(){
      let sz=prompt('Font size (px):','13');
      if(sz)document.getElementById('notepad-ta').style.fontSize=sz+'px';
    }},
    {label:'Word Wrap',action:function(){
      let ta=document.getElementById('notepad-ta');
      ta.style.whiteSpace=ta.style.whiteSpace==='pre'?'':'pre';
    }}
  ]);
}

// ─── WORDPAD ───
function openWordPad(){
  WM.make('wordpad','WordPad',620,480,
  `<div style="display:flex;flex-direction:column;height:100%;">
    <div class="menu-bar">
      <span class="menu-item" onclick="wpFile()">File</span>
      <span class="menu-item">Edit</span>
      <span class="menu-item">View</span>
      <span class="menu-item" onclick="wpInsert()">Insert</span>
    </div>
    <div style="background:var(--win);padding:2px;border-bottom:1px solid #808080;display:flex;gap:3px;flex-wrap:wrap;">
      <button class="btn" style="min-width:30px;" onclick="wpCmd('bold')"><b>B</b></button>
      <button class="btn" style="min-width:30px;" onclick="wpCmd('italic')"><i>I</i></button>
      <button class="btn" style="min-width:30px;" onclick="wpCmd('underline')"><u>U</u></button>
      <span style="padding:2px 4px;">|</span>
      <button class="btn" style="min-width:30px;" onclick="wpCmd('justifyLeft')">&#8676;</button>
      <button class="btn" style="min-width:30px;" onclick="wpCmd('justifyCenter')">&#8677;</button>
      <button class="btn" style="min-width:30px;" onclick="wpCmd('justifyRight')">&#8678;</button>
      <span style="padding:2px 4px;">|</span>
      <select onchange="wpFont(this.value)" style="height:22px;">
        <option>MS Sans Serif</option><option>Consolas</option><option>Arial</option><option>Times New Roman</option>
      </select>
      <select onchange="wpSize(this.value)" style="height:22px;width:50px;">
        ${[8,10,12,14,16,18,24,36].map(function(s){return '<option value="'+s+'"'+(s===12?' selected':'')+'>'+s+'</option>';}).join('')}
      </select>
      <input type="color" id="wp-color" style="width:24px;height:22px;" onchange="wpColor(this.value)">
    </div>
    <div id="wp-editor" contenteditable="true" style="flex:1;overflow-y:auto;padding:8px;background:#fff;outline:none;font-family:'MS Sans Serif',Arial;font-size:12px;"></div>
    <div class="status-bar">Ready</div>
  </div>`);
}
function wpCmd(cmd){document.getElementById('wp-editor').focus();document.execCommand(cmd);}
function wpFont(f){document.getElementById('wp-editor').focus();document.execCommand('fontName',false,f);}
function wpSize(s){document.getElementById('wp-editor').focus();document.execCommand('fontSize',false,Math.ceil(s/4));}
function wpColor(c){document.getElementById('wp-editor').focus();document.execCommand('foreColor',false,c);}
function wpFile(){
  showCtxMenu(8,56,[
    {label:'New',action:function(){document.getElementById('wp-editor').innerHTML='';}},
    {label:'Save as RTF',action:function(){
      let blob=new Blob([document.getElementById('wp-editor').innerHTML],{type:'text/html'});
      let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='document.html';a.click();
    }},
    {sep:true},{label:'Exit',action:function(){WM.close('wordpad');}}
  ]);
}
function wpInsert(){
  showCtxMenu(280,56,[
    {label:'Insert Image',action:function(){
      let inp=document.createElement('input');inp.type='file';inp.accept='image/*';
      inp.onchange=function(){
        let r=new FileReader();r.onload=function(e){
          let img=document.createElement('img');img.src=e.target.result;img.style.maxWidth='100%';
          document.getElementById('wp-editor').appendChild(img);
        };r.readAsDataURL(inp.files[0]);
      };inp.click();
    }},
    {label:'Insert Horizontal Rule',action:function(){document.execCommand('insertHorizontalRule');}}
  ]);
}

// ─── SETTINGS ───
function openSettings(){
  WM.make('settings','Settings',480,380,
  `<div style="display:flex;height:100%;">
    <div style="width:140px;background:#c0c0c0;border-right:2px inset var(--border-dark);overflow-y:auto;">
      ${['Display','Personalization','Sound','System','Network','About'].map(function(s){
        return `<div class="list-item" onclick="settingsTab('${s}')">${s}</div>`;
      }).join('')}
    </div>
    <div style="flex:1;padding:8px;overflow-y:auto;" id="settings-content">
      <div id="set-display">
        <p><b>Display Settings</b></p><br>
        <label>Background Color: <input type="color" id="bg-color" value="#008080" onchange="document.getElementById('wallpaper').style.background=this.value;"></label><br><br>
        <label>Window Color: <input type="color" id="win-color" value="#c0c0c0" onchange="document.documentElement.style.setProperty('--win',this.value);document.documentElement.style.setProperty('--btn',this.value);document.documentElement.style.setProperty('--taskbar',this.value);"></label><br><br>
        <label>Title Bar Color: <input type="color" id="title-color" value="#000080" onchange="document.documentElement.style.setProperty('--title-active',this.value);"></label><br><br>
        <label>Font Size: <input type="range" min="9" max="16" value="11" onchange="document.body.style.fontSize=this.value+'px';"></label>
      </div>
    </div>
  </div>`);
}
function settingsTab(s){
  document.getElementById('settings-content').innerHTML='<p><b>'+s+'</b></p><br><p>'+s+' settings panel.</p>';
}

// ─── MUSIC PLAYER ───
function openMusicPlayer(){
  WM.make('musicplayer','Music Player',380,280,
  `<div style="display:flex;flex-direction:column;height:100%;padding:8px;gap:6px;">
    <div style="background:#000;color:#0f0;font-family:Consolas;padding:8px;text-align:center;min-height:40px;" id="mp-display">No file loaded</div>
    <input type="file" accept="audio/*" onchange="mpLoad(this)" style="font-size:11px;">
    <audio id="mp-audio" onended="mpEnded()" ontimeupdate="mpTimeUpdate()"></audio>
    <div style="display:flex;gap:4px;justify-content:center;">
      <button class="btn" onclick="mpPrev()">|◀</button>
      <button class="btn" onclick="mpPlayPause()" id="mp-pp">▶</button>
      <button class="btn" onclick="mpStop()">■</button>
      <button class="btn" onclick="mpNext()">▶|</button>
    </div>
    <div style="display:flex;align-items:center;gap:4px;">
      <span>Vol:</span><input type="range" min="0" max="1" step="0.01" value="1" onchange="document.getElementById('mp-audio').volume=this.value;" style="flex:1;">
    </div>
    <div class="progress-bar" id="mp-prog-bg" onclick="mpSeek(event)" style="cursor:pointer;">
      <div class="progress-fill" id="mp-prog" style="width:0%;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <span id="mp-cur">0:00</span><span id="mp-dur">0:00</span>
    </div>
    <div id="mp-playlist" class="list-box" style="flex:1;min-height:60px;"></div>
  </div>`);
  window.mpPlaylist=[];window.mpIdx=0;
}
function mpLoad(inp){
  Array.from(inp.files).forEach(function(f){window.mpPlaylist.push(f);});
  mpRenderList();if(window.mpPlaylist.length===1)mpPlay(0);
}
function mpRenderList(){
  let el=document.getElementById('mp-playlist');if(!el)return;
  el.innerHTML=window.mpPlaylist.map(function(f,i){
    return `<div class="list-item${i===window.mpIdx?' selected':''}" ondblclick="mpPlay(${i})">${f.name}</div>`;
  }).join('');
}
function mpPlay(idx){
  window.mpIdx=idx;
  let f=window.mpPlaylist[idx];if(!f)return;
  let a=document.getElementById('mp-audio');
  a.src=URL.createObjectURL(f);a.play();
  document.getElementById('mp-display').textContent=f.name;
  document.getElementById('mp-pp').textContent='⏸';
  mpRenderList();
}
function mpPlayPause(){
  let a=document.getElementById('mp-audio');
  if(a.paused){a.play();document.getElementById('mp-pp').textContent='⏸';}
  else{a.pause();document.getElementById('mp-pp').textContent='▶';}
}
function mpStop(){let a=document.getElementById('mp-audio');a.pause();a.currentTime=0;document.getElementById('mp-pp').textContent='▶';}
function mpNext(){if(window.mpIdx<window.mpPlaylist.length-1)mpPlay(window.mpIdx+1);}
function mpPrev(){if(window.mpIdx>0)mpPlay(window.mpIdx-1);}
function mpEnded(){mpNext();}
function mpTimeUpdate(){
  let a=document.getElementById('mp-audio');if(!a||!a.duration)return;
  let pct=(a.currentTime/a.duration*100).toFixed(1);
  let p=document.getElementById('mp-prog');if(p)p.style.width=pct+'%';
  let tc=function(s){return Math.floor(s/60)+':'+(Math.floor(s%60)+'').padStart(2,'0');};
  let c=document.getElementById('mp-cur');if(c)c.textContent=tc(a.currentTime);
  let d=document.getElementById('mp-dur');if(d)d.textContent=tc(a.duration);
}
function mpSeek(e){
  let a=document.getElementById('mp-audio');if(!a.duration)return;
  let rect=e.currentTarget.getBoundingClientRect();
  a.currentTime=((e.clientX-rect.left)/rect.width)*a.duration;
}

// ─── RADIO FM ───
function openRadioFM(){
  let stations=[
    {name:'Radio Romania Actualitati',url:'https://stream.srr.ro/romania-actualitati-64k.mp3'},
    {name:'Europa FM',url:'https://astreaming.europafm.ro/EuropaFM_aac'},
    {name:'Pro FM',url:'https://edge126.rcs-rds.ro/profm/profm.mp3'},
    {name:'Radio 21',url:'https://live.radio21.ro/Radio21'},
    {name:'Kiss FM',url:'https://astreaming.kissfm.ro/KissFM_aac'}
  ];
  WM.make('radiofm','Radio FM',340,300,
  `<div style="padding:8px;display:flex;flex-direction:column;height:100%;gap:6px;">
    <div style="background:#111;color:#0f0;font-family:Consolas;font-size:14px;padding:8px;text-align:center;" id="rfm-disp">Select a station</div>
    <div class="list-box" style="flex:1;">
      ${stations.map(function(s,i){return `<div class="list-item" ondblclick="rfmPlay(${i})">${s.name}</div>`;}).join('')}
    </div>
    <audio id="rfm-audio"></audio>
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="rfmStop()">■ Stop</button>
      <button class="btn" onclick="rfmRec()">⏺ Rec</button>
    </div>
    <label>Vol: <input type="range" min="0" max="1" step="0.01" value="0.8" onchange="document.getElementById('rfm-audio').volume=this.value;"></label>
  </div>`);
  window.rfmStations=stations;window.rfmRec=false;
}
function rfmPlay(i){
  let s=window.rfmStations[i];
  let a=document.getElementById('rfm-audio');
  a.src=s.url;a.play();
  document.getElementById('rfm-disp').textContent='▶ '+s.name;
}
function rfmStop(){let a=document.getElementById('rfm-audio');a.pause();a.src='';document.getElementById('rfm-disp').textContent='Stopped';}

// ─── VISUAL EFFECTS ───
function openVisualEffects(){
  WM.make('vfx','Visual Effects',500,400,
  `<div style="display:flex;flex-direction:column;height:100%;padding:4px;gap:4px;">
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      ${['Matrix','Fireworks','Starfield','Plasma','Particles','Waveform','Lissajous','Metaballs'].map(function(n){
        return `<button class="btn" onclick="vfxSet('${n}')">${n}</button>`;
      }).join('')}
    </div>
    <canvas id="vfx-canvas" style="flex:1;background:#000;width:100%;"></canvas>
  </div>`,{},{onOpen:function(){vfxSet('Matrix');}});
  window.vfxAnim=null;
}
function vfxSet(name){
  let c=document.getElementById('vfx-canvas');if(!c)return;
  let ctx=c.getContext('2d');
  if(window.vfxAnim)cancelAnimationFrame(window.vfxAnim);
  let pw=c.parentElement.offsetWidth||460,ph=(c.parentElement.offsetHeight||360)-44;
  c.width=pw;c.height=ph;
  if(name==='Matrix'){
    let cols=Math.floor(pw/14),drops=Array(cols).fill(0),chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
    let loop=function(){
      ctx.fillStyle='rgba(0,0,0,0.05)';ctx.fillRect(0,0,pw,ph);
      ctx.fillStyle='#0f0';ctx.font='13px Consolas';
      drops.forEach(function(d,i){
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*14,d*14);
        if(d*14>ph&&Math.random()>0.975)drops[i]=0;else drops[i]++;
      });
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Fireworks'){
    let particles=[];
    function spawnFW(){
      let x=Math.random()*pw,y=Math.random()*ph/2;
      for(let i=0;i<60;i++){let a=Math.random()*Math.PI*2,sp=Math.random()*4+1;
        particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,c:`hsl(${Math.random()*360},100%,60%)`});}
    }
    setInterval(spawnFW,800);
    let loop=function(){
      ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,0,pw,ph);
      particles.forEach(function(p,i){
        p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.life-=0.02;
        ctx.globalAlpha=p.life;ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,2,2);
      });
      ctx.globalAlpha=1;
      for(let i=particles.length-1;i>=0;i--)if(particles[i].life<=0)particles.splice(i,1);
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Starfield'){
    let stars=Array.from({length:200},function(){return {x:Math.random()*pw,y:Math.random()*ph,z:Math.random()};});
    let loop=function(){
      ctx.fillStyle='#000';ctx.fillRect(0,0,pw,ph);
      stars.forEach(function(s){
        s.z-=0.005;if(s.z<=0){s.x=Math.random()*pw;s.y=Math.random()*ph;s.z=1;}
        let sx=s.x/s.z,sy=s.y/s.z,r=Math.max(0.5,(1-s.z)*3);
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();
      });
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Plasma'){
    let t=0;
    let loop=function(){
      let img=ctx.createImageData(pw,ph);
      for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){
        let v=Math.sin(x/30+t)+Math.sin(y/30+t)+Math.sin((x+y)/30+t)+Math.sin(Math.sqrt(x*x+y*y)/20+t);
        let i=(y*pw+x)*4;
        img.data[i]=Math.floor(128+128*Math.sin(v*Math.PI));
        img.data[i+1]=Math.floor(128+128*Math.sin(v*Math.PI+2));
        img.data[i+2]=Math.floor(128+128*Math.sin(v*Math.PI+4));
        img.data[i+3]=255;
      }
      ctx.putImageData(img,0,0);t+=0.04;
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Particles'){
    let pts=Array.from({length:100},function(){return {x:Math.random()*pw,y:Math.random()*ph,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,c:`hsl(${Math.random()*360},80%,60%)`};});
    let loop=function(){
      ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(0,0,pw,ph);
      pts.forEach(function(p){
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>pw)p.vx*=-1;if(p.y<0||p.y>ph)p.vy*=-1;
        ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
      });
      pts.forEach(function(a){pts.forEach(function(b){
        let dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<80){ctx.strokeStyle='rgba(255,255,255,'+(1-d/80)*0.3+')';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      });});
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Waveform'){
    let t=0;
    let loop=function(){
      ctx.fillStyle='#000';ctx.fillRect(0,0,pw,ph);
      ctx.strokeStyle='#0ff';ctx.lineWidth=2;ctx.beginPath();
      for(let x=0;x<pw;x++){
        let y=ph/2+Math.sin(x*0.04+t)*60+Math.sin(x*0.02+t*1.3)*30;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }ctx.stroke();t+=0.05;
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Lissajous'){
    let t=0;let pts=[];
    let loop=function(){
      ctx.fillStyle='rgba(0,0,0,0.03)';ctx.fillRect(0,0,pw,ph);
      pts.push({x:pw/2+Math.sin(3*t)*pw*0.4,y:ph/2+Math.sin(2*t+Math.PI/4)*ph*0.4});
      if(pts.length>1000)pts.shift();
      ctx.strokeStyle='#f0f';ctx.lineWidth=1;ctx.beginPath();
      pts.forEach(function(p,i){i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);});
      ctx.stroke();t+=0.01;
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  } else if(name==='Metaballs'){
    let balls=Array.from({length:5},function(){return {x:Math.random()*pw,y:Math.random()*ph,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,r:60+Math.random()*40};});
    let loop=function(){
      let img=ctx.createImageData(pw,ph);
      for(let y=0;y<ph;y+=2)for(let x=0;x<pw;x+=2){
        let s=balls.reduce(function(a,b){let dx=x-b.x,dy=y-b.y;return a+b.r*b.r/(dx*dx+dy*dy);},0);
        let i=(y*pw+x)*4;
        if(s>1){img.data[i]=255;img.data[i+1]=Math.floor(s*80)%256;img.data[i+2]=128;img.data[i+3]=255;}
      }
      ctx.putImageData(img,0,0);
      balls.forEach(function(b){b.x+=b.vx;b.y+=b.vy;if(b.x<0||b.x>pw)b.vx*=-1;if(b.y<0||b.y>ph)b.vy*=-1;});
      window.vfxAnim=requestAnimationFrame(loop);
    };loop();
  }
}

// ─── SHADER EDITOR ───
function openShaderEditor(){
  WM.make('shadereditor','Shader Editor',640,480,
  `<div style="display:flex;height:100%;gap:0;">
    <div style="display:flex;flex-direction:column;flex:1;min-width:0;">
      <div style="padding:2px;background:#c0c0c0;display:flex;gap:3px;">
        <button class="btn" onclick="shaderRun()">▶ Run</button>
        <button class="btn" onclick="shaderReset()">Reset</button>
      </div>
      <textarea id="shader-code" class="mono" style="flex:1;resize:none;border:none;outline:none;background:#1e1e1e;color:#ce9178;padding:6px;overflow:auto;"></textarea>
    </div>
    <canvas id="shader-canvas" width="280" height="280" style="background:#000;"></canvas>
  </div>`);
  document.getElementById('shader-code').value=`// loopsOS Shader Editor
// Available: uv.x, uv.y (0-1), iTime, iResolution

float circle(vec2 uv, vec2 c, float r){
  return smoothstep(r,r-0.01,length(uv-c));
}

vec3 mainImage(vec2 uv, float t){
  vec2 p = uv - 0.5;
  float r = length(p);
  float a = atan(p.y, p.x);
  float col = sin(r*10.0 - t*2.0 + a*3.0);
  return vec3(col*0.5+0.5, sin(col+t)*0.5+0.5, cos(col-t)*0.5+0.5);
}`;
  shaderRun();
}
function shaderRun(){
  let canvas=document.getElementById('shader-canvas');if(!canvas)return;
  let ctx=canvas.getContext('2d');
  let code=document.getElementById('shader-code').value;
  let t0=performance.now();
  if(window.shaderAnimId)cancelAnimationFrame(window.shaderAnimId);
  let loop=function(){
    let t=(performance.now()-t0)/1000;
    let w=canvas.width,h=canvas.height;
    let img=ctx.createImageData(w,h);
    try{
      for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){
        let uv={x:x/w,y:1-y/h};
        let fn=new Function('uv','iTime','iResolution',code+'\nreturn mainImage(uv,iTime);');
        let c=fn(uv,t,{x:w,y:h});
        let r=Math.floor(Math.min(1,Math.max(0,c.x||c[0]||0))*255);
        let g=Math.floor(Math.min(1,Math.max(0,c.y||c[1]||0))*255);
        let b=Math.floor(Math.min(1,Math.max(0,c.z||c[2]||0))*255);
        let idx=(y*w+x)*4;img.data[idx]=r;img.data[idx+1]=g;img.data[idx+2]=b;img.data[idx+3]=255;
      }
    }catch(e){}
    ctx.putImageData(img,0,0);
    window.shaderAnimId=requestAnimationFrame(loop);
  };loop();
}
function shaderReset(){
  if(window.shaderAnimId)cancelAnimationFrame(window.shaderAnimId);
  let canvas=document.getElementById('shader-canvas');
  if(canvas)canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}

// ─── STICKY NOTE ───
function openStickyNote(){
  let id='sticky'+Date.now();
  WM.make(id,'Sticky Note',240,200,
  `<div style="background:#ffff88;height:100%;padding:4px;">
    <textarea style="width:100%;height:100%;background:#ffff88;border:none;resize:none;outline:none;font-family:'MS Sans Serif';font-size:12px;"></textarea>
  </div>`,{noMax:true,noResize:false});
}

// ─── MEDIA PLAYER ───
function openMediaPlayer(){
  WM.make('mediaplayer','Media Player',480,360,
  `<div style="display:flex;flex-direction:column;height:100%;background:#000;">
    <video id="mp-video" style="flex:1;width:100%;background:#000;" controls></video>
    <div style="background:#c0c0c0;padding:4px;display:flex;gap:4px;align-items:center;">
      <button class="btn" onclick="mpvLoad()">Open</button>
      <button class="btn" onclick="mpvPlay()">▶</button>
      <button class="btn" onclick="mpvPause()">⏸</button>
      <button class="btn" onclick="mpvStop()">■</button>
      <label style="margin-left:8px;">Vol:<input type="range" min="0" max="1" step="0.01" value="1" onchange="document.getElementById('mp-video').volume=this.value;" style="width:80px;"></label>
    </div>
  </div>`);
}
function mpvLoad(){
  let inp=document.createElement('input');inp.type='file';inp.accept='video/*,audio/*';
  inp.onchange=function(){
    let v=document.getElementById('mp-video');
    v.src=URL.createObjectURL(inp.files[0]);v.play();
  };inp.click();
}
function mpvPlay(){let v=document.getElementById('mp-video');if(v)v.play();}
function mpvPause(){let v=document.getElementById('mp-video');if(v)v.pause();}
function mpvStop(){let v=document.getElementById('mp-video');if(v){v.pause();v.currentTime=0;}}

// ─── WEB APP MAKER ───
function openWebAppMaker(){
  WM.make('webappmaker','Web App Maker',600,480,
  `<div style="display:flex;flex-direction:column;height:100%;gap:3px;padding:4px;">
    <div style="display:flex;gap:4px;">
      <input type="text" id="wam-name" placeholder="App Name" style="width:200px;">
      <button class="btn" onclick="wamPreview()">Preview</button>
      <button class="btn" onclick="wamExport()">Export HTML</button>
      <button class="btn" onclick="wamSaveLPX()">Save .lpx</button>
    </div>
    <div style="display:flex;gap:4px;flex:1;min-height:0;">
      <textarea id="wam-html" class="mono" style="flex:1;resize:none;" placeholder="HTML"></textarea>
      <textarea id="wam-css" class="mono" style="flex:1;resize:none;" placeholder="CSS"></textarea>
      <textarea id="wam-js" class="mono" style="flex:1;resize:none;" placeholder="JavaScript"></textarea>
    </div>
    <iframe id="wam-preview" style="height:180px;border:2px inset #808080;background:#fff;"></iframe>
  </div>`);
}
function wamPreview(){
  let h=document.getElementById('wam-html').value;
  let c=document.getElementById('wam-css').value;
  let j=document.getElementById('wam-js').value;
  let f=document.getElementById('wam-preview');
  let doc=f.contentDocument||f.contentWindow.document;
  doc.open();doc.write(`<style>${c}</style>${h}<script>${j}<\/script>`);doc.close();
}
function wamExport(){
  let h=document.getElementById('wam-html').value;
  let c=document.getElementById('wam-css').value;
  let j=document.getElementById('wam-js').value;
  let n=document.getElementById('wam-name').value||'webapp';
  let src=`<!DOCTYPE html><html><head><style>${c}</style></head><body>${h}<script>${j}<\/script></body></html>`;
  let blob=new Blob([src],{type:'text/html'});
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n+'.html';a.click();
}
function wamSaveLPX(){
  let h=document.getElementById('wam-html').value;
  let c=document.getElementById('wam-css').value;
  let j=document.getElementById('wam-js').value;
  let n=document.getElementById('wam-name').value||'webapp';
  let data=JSON.stringify({name:n,html:h,css:c,js:j,type:'webapp'});
  let blob=new Blob([data],{type:'application/octet-stream'});
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n+'.lpx';a.click();
}

// ─── FILE MANAGER ───
let loopsFS = JSON.parse(localStorage.getItem('loopsFS')||'{"root":{"Desktop":{},"Documents":{},"Downloads":{},"Music":{},"Pictures":{},"Videos":{}}}');
function saveFS(){localStorage.setItem('loopsFS',JSON.stringify(loopsFS));}
function openFileManager(){
  WM.make('fileman','File Manager',560,400,
  `<div style="display:flex;flex-direction:column;height:100%;">
    <div class="menu-bar">
      <span class="menu-item" onclick="fmFileMenu()">File</span>
      <span class="menu-item" onclick="fmEditMenu()">Edit</span>
      <span class="menu-item" onclick="fmViewMenu()">View</span>
    </div>
    <div style="display:flex;align-items:center;gap:4px;padding:2px;border-bottom:1px solid #808080;">
      <button class="btn" style="min-width:30px;" onclick="fmBack()">◀</button>
      <input type="text" id="fm-path" value="root" style="flex:1;" readonly>
    </div>
    <div style="display:flex;flex:1;min-height:0;">
      <div id="fm-tree" style="width:140px;border-right:2px inset #808080;overflow-y:auto;padding:2px;"></div>
      <div id="fm-files" class="list-box" style="flex:1;padding:2px;overflow-y:auto;"></div>
    </div>
    <div class="status-bar" id="fm-status">Ready</div>
  </div>`);
  window.fmPath=['root'];
  fmRender();
}
function fmGetDir(){
  let d=loopsFS;
  window.fmPath.forEach(function(p){d=d[p]||{};});
  return d;
}
function fmRender(){
  let dir=fmGetDir();
  document.getElementById('fm-path').value=window.fmPath.join('/');
  let tree=document.getElementById('fm-tree');
  let files=document.getElementById('fm-files');
  if(!tree||!files)return;
  tree.innerHTML='<div class="list-item" onclick="fmNav([\'root\'])">📁 root</div>';
  function renderTree(obj,path,depth){
    Object.keys(obj).forEach(function(k){
      if(typeof obj[k]==='object'){
        let d=document.createElement('div');
        d.className='list-item';
        d.style.paddingLeft=(depth*12+4)+'px';
        d.textContent='📁 '+k;
        let p=path.concat(k);
        d.onclick=function(){fmNav(p);};
        tree.appendChild(d);
        renderTree(obj[k],p,depth+1);
      }
    });
  }
  renderTree(loopsFS.root,['root'],1);
  files.innerHTML='';
  Object.keys(dir).forEach(function(k){
    let d=document.createElement('div');
    d.className='list-item';
    d.textContent=(typeof dir[k]==='object'?'📁 ':'📄 ')+k;
    d.ondblclick=function(){
      if(typeof dir[k]==='object')fmNav(window.fmPath.concat(k));
      else if(typeof dir[k]==='string'){
        if(k.endsWith('.txt'))openNotepad();
      }
    };
    d.oncontextmenu=function(e){e.preventDefault();showCtxMenu(e.clientX,e.clientY,[
      {label:'Open',action:function(){d.ondblclick();}},
      {label:'Delete',action:function(){delete dir[k];saveFS();fmRender();}},
      {label:'Rename',action:function(){let nn=prompt('New name:',k);if(nn&&nn!==k){dir[nn]=dir[k];delete dir[k];saveFS();fmRender();}}}
    ]);};
    files.appendChild(d);
  });
}
function fmNav(path){window.fmPath=path;fmRender();}
function fmBack(){if(window.fmPath.length>1){window.fmPath.pop();fmRender();}}
function fmFileMenu(){
  showCtxMenu(0,56,[
    {label:'New Folder',action:function(){
      let n=prompt('Folder name:');if(!n)return;
      let dir=fmGetDir();dir[n]={};saveFS();fmRender();
    }},
    {label:'New File',action:function(){
      let n=prompt('File name:');if(!n)return;
      let dir=fmGetDir();dir[n]='';saveFS();fmRender();
    }},
    {sep:true},{label:'Close',action:function(){WM.close('fileman');}}
  ]);
}
function fmEditMenu(){
  showCtxMenu(60,56,[
    {label:'Select All',action:function(){document.querySelectorAll('#fm-files .list-item').forEach(function(d){d.classList.add('selected');});}},
    {label:'Invert Selection',action:function(){document.querySelectorAll('#fm-files .list-item').forEach(function(d){d.classList.toggle('selected');});}}
  ]);
}
function fmViewMenu(){
  showCtxMenu(120,56,[
    {label:'Refresh',action:function(){fmRender();}},
    {label:'Large Icons',action:function(){}},
    {label:'List',action:function(){}}
  ]);
}

// ─── LOOPSRAR ───
function openLoopsRAR(){
  WM.make('loopsrar','loopsRAR',400,340,
  `<div style="display:flex;flex-direction:column;height:100%;padding:6px;gap:4px;">
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="lrarOpen()">Open Archive</button>
      <button class="btn" onclick="lrarCreate()">Create Archive</button>
    </div>
    <div id="lrar-list" class="list-box" style="flex:1;padding:2px;"></div>
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="lrarExtract()">Extract All</button>
      <button class="btn" onclick="lrarTest()">Test</button>
    </div>
    <div class="status-bar" id="lrar-status">Ready</div>
  </div>`);
  window.lrarFiles=[];
}
function lrarOpen(){
  let inp=document.createElement('input');inp.type='file';
  inp.onchange=function(){
    window.lrarFiles=Array.from(inp.files);
    let el=document.getElementById('lrar-list');if(!el)return;
    el.innerHTML=window.lrarFiles.map(function(f){
      return `<div class="list-item">📄 ${f.name} (${(f.size/1024).toFixed(1)} KB)</div>`;
    }).join('');
    document.getElementById('lrar-status').textContent=window.lrarFiles.length+' file(s)';
  };inp.click();
}
function lrarCreate(){
  let inp=document.createElement('input');inp.type='file';inp.multiple=true;
  inp.onchange=function(){
    let files=Array.from(inp.files);
    let name=prompt('Archive name:','archive')||'archive';
    let manifest=files.map(function(f){return {name:f.name,size:f.size};});
    let blob=new Blob([JSON.stringify({files:manifest,format:'lrar'})],{type:'application/octet-stream'});
    let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name+'.lrar';a.click();
    document.getElementById('lrar-status').textContent='Archive created: '+name+'.lrar';
  };inp.click();
}
function lrarExtract(){
  if(!window.lrarFiles||!window.lrarFiles.length){alert('No files loaded.');return;}
  window.lrarFiles.forEach(function(f){
    let a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;a.click();
  });
}
function lrarTest(){document.getElementById('lrar-status').textContent='All files OK (simulated)';}

// ─── LOOPS7ZIP ───
function openLoops7Zip(){
  WM.make('loops7zip','loops7Zip',440,360,
  `<div style="display:flex;flex-direction:column;height:100%;padding:6px;gap:4px;">
    <div style="display:flex;gap:4px;flex-wrap:wrap;">
      <button class="btn" onclick="l7zAdd()">Add</button>
      <button class="btn" onclick="l7zExtract()">Extract</button>
      <button class="btn" onclick="l7zTest()">Test</button>
      <button class="btn" onclick="l7zDelete()">Delete</button>
      <button class="btn" onclick="l7zInfo()">Info</button>
    </div>
    <div id="l7z-path" style="padding:2px;border:inset 1px;background:#fff;font-family:Consolas;font-size:11px;">C:\\</div>
    <div id="l7z-list" class="list-box" style="flex:1;padding:2px;"></div>
    <div class="status-bar" id="l7z-status">Ready - loops7Zip v1.0</div>
  </div>`);
  window.l7zFiles=[];
}
function l7zAdd(){
  let inp=document.createElement('input');inp.type='file';inp.multiple=true;
  inp.onchange=function(){
    window.l7zFiles=window.l7zFiles.concat(Array.from(inp.files));
    let el=document.getElementById('l7z-list');if(!el)return;
    el.innerHTML=window.l7zFiles.map(function(f,i){
      return `<div class="list-item" id="l7z-item-${i}">📄 ${f.name} | ${(f.size/1024).toFixed(2)} KB | ${f.type||'unknown'}</div>`;
    }).join('');
    document.getElementById('l7z-status').textContent=window.l7zFiles.length+' items';
  };inp.click();
}
function l7zExtract(){
  window.l7zFiles.forEach(function(f){
    let a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;a.click();
  });
}
function l7zTest(){document.getElementById('l7z-status').textContent='CRC check passed (simulated)';}
function l7zDelete(){window.l7zFiles=[];document.getElementById('l7z-list').innerHTML='';document.getElementById('l7z-status').textContent='Cleared';}
function l7zInfo(){
  let total=window.l7zFiles.reduce(function(a,f){return a+f.size;},0);
  WM.dialog('Archive Info',`Files: ${window.l7zFiles.length}<br>Total: ${(total/1024).toFixed(2)} KB`,[{label:'OK'}]);
}

// ─── CAMERA ───
function openCamera(){
  WM.make('camera','Camera',480,400,
  `<div style="display:flex;flex-direction:column;height:100%;background:#000;gap:4px;padding:4px;">
    <video id="cam-video" autoplay muted style="flex:1;background:#000;width:100%;"></video>
    <canvas id="cam-canvas" style="display:none;"></canvas>
    <div style="display:flex;gap:4px;background:#c0c0c0;padding:4px;">
      <button class="btn" onclick="camStart()">📷 Start</button>
      <button class="btn" onclick="camSnap()">📸 Snap</button>
      <button class="btn" onclick="camStop()">■ Stop</button>
      <button class="btn" onclick="camSave()">💾 Save</button>
    </div>
    <img id="cam-preview" style="max-height:80px;display:none;">
  </div>`);
}
function camStart(){
  navigator.mediaDevices.getUserMedia({video:true}).then(function(stream){
    let v=document.getElementById('cam-video');
    if(v){v.srcObject=stream;window.camStream=stream;}
  });
}
function camSnap(){
  let v=document.getElementById('cam-video');
  let c=document.getElementById('cam-canvas');
  if(!v||!c)return;
  c.width=v.videoWidth;c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);
  let prev=document.getElementById('cam-preview');
  if(prev){prev.src=c.toDataURL();prev.style.display='block';}
}
function camStop(){
  if(window.camStream)window.camStream.getTracks().forEach(function(t){t.stop();});
  let v=document.getElementById('cam-video');if(v)v.srcObject=null;
}
function camSave(){
  let c=document.getElementById('cam-canvas');if(!c)return;
  let a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='snap.png';a.click();
}

// ─── SECURITY ───
function openSecurity(){
  WM.make('security','loopsOS Security Center',440,360,
  `<div style="padding:8px;display:flex;flex-direction:column;gap:6px;">
    <div style="background:#c0ffc0;border:1px solid #080;padding:6px;" id="sec-status">✔ System is secure</div>
    <div class="tabs" id="sec-tabs">
      <div class="tab active" onclick="secTab('firewall',this)">Firewall</div>
      <div class="tab" onclick="secTab('antivirus',this)">Antivirus</div>
      <div class="tab" onclick="secTab('privacy',this)">Privacy</div>
    </div>
    <div id="sec-content">
      <p><b>Firewall:</b> Active</p>
      <p>Block all incoming: <input type="checkbox" checked></p>
      <p>Allow loopback: <input type="checkbox" checked></p>
      <p>Rules: 12 active</p>
    </div>
    <button class="btn" onclick="secScan()">🔍 Run Scan</button>
    <div class="progress-bar" id="sec-pb"><div class="progress-fill" id="sec-pf" style="width:0%;"></div></div>
    <div id="sec-log" class="list-box" style="height:80px;padding:2px;font-family:Consolas;font-size:10px;"></div>
  </div>`);
}
function secTab(name,el){
  document.querySelectorAll('#win-security .tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active');
  let c=document.getElementById('sec-content');
  let content={
    firewall:'<p><b>Firewall:</b> Active</p><p>Block incoming: <input type="checkbox" checked></p><p>Allow loopback: <input type="checkbox" checked></p>',
    antivirus:'<p><b>Antivirus:</b> Up to date</p><p>Last scan: Today</p><p>Threats found: 0</p>',
    privacy:'<p><b>Privacy:</b></p><p>Camera: <input type="checkbox"></p><p>Microphone: <input type="checkbox"></p><p>Location: <input type="checkbox"></p>'
  };
  if(c)c.innerHTML=content[name]||'';
}
function secScan(){
  let pf=document.getElementById('sec-pf');
  let log=document.getElementById('sec-log');
  let pct=0;
  let items=['Scanning boot sector...','Checking registry...','Analyzing memory...','Scanning files...','Checking network...'];
  let iv=setInterval(function(){
    pct+=20;if(pf)pf.style.width=pct+'%';
    if(log&&items[Math.floor(pct/20)-1])log.innerHTML+=`<div>${items[Math.floor(pct/20)-1]}</div>`;
    if(pct>=100){clearInterval(iv);document.getElementById('sec-status').textContent='✔ Scan complete - No threats found';}
  },400);
}

// ─── PILOT COMPILE MATH ───
function openPilotCompileMath(){
  WM.make('pilotmath','Pilot Compile Math',520,440,
  `<div style="display:flex;flex-direction:column;height:100%;padding:6px;gap:4px;">
    <p style="font-size:11px;">Enter mathematical expressions, equations, or programs:</p>
    <textarea id="pcm-input" class="mono" style="height:120px;resize:none;" placeholder="sin(x^2)+cos(x*pi)&#10;integrate(x^2, 0, 1)&#10;solve(x^2-4=0)&#10;matrix([[1,2],[3,4]])"></textarea>
    <div style="display:flex;gap:4px;">
      <button class="btn" onclick="pcmEval()">▶ Evaluate</button>
      <button class="btn" onclick="pcmPlot()">Plot</button>
      <button class="btn" onclick="pcmClear()">Clear</button>
    </div>
    <div id="pcm-output" class="mono" style="flex:1;background:#fff;border:2px inset #808080;padding:4px;overflow-y:auto;white-space:pre-wrap;font-size:11px;"></div>
    <canvas id="pcm-canvas" style="height:120px;width:100%;background:#fff;border:2px inset #808080;display:none;"></canvas>
  </div>`);
}
function pcmEval(){
  let inp=document.getElementById('pcm-input').value;
  let out=document.getElementById('pcm-output');
  let lines=inp.split('\n');
  out.textContent='';
  lines.forEach(function(line){
    line=line.trim();if(!line)return;
    try{
      let res;
      if(line.startsWith('solve(')){
        let eq=line.slice(6,-1);out.textContent+='solve: '+eq+' → analytical solver (simulated)\n';
      } else if(line.startsWith('integrate(')){
        let parts=line.slice(10,-1).split(',');
        let fn=parts[0].trim(),a=parseFloat(parts[1]),b=parseFloat(parts[2]);
        let sum=0,n=1000,dx=(b-a)/n;
        for(let i=0;i<n;i++){let x=a+i*dx;try{sum+=Function('x','return '+fn.replace(/\^/g,'**').replace(/pi/g,'Math.PI').replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos').replace(/sqrt/g,'Math.sqrt'))(x)*dx;}catch(e){}}
        out.textContent+='∫('+fn+')dx ['+a+','+b+'] ≈ '+sum.toFixed(8)+'\n';
      } else if(line.startsWith('matrix(')){
        out.textContent+=line+' → matrix displayed\n';
      } else {
        let safe=line.replace(/\^/g,'**').replace(/pi/g,'Math.PI').replace(/\bsin\b/g,'Math.sin').replace(/\bcos\b/g,'Math.cos').replace(/\btan\b/g,'Math.tan').replace(/\bsqrt\b/g,'Math.sqrt').replace(/\babs\b/g,'Math.abs').replace(/\bln\b/g,'Math.log').replace(/\blog\b/g,'Math.log10');
        res=Function('"use strict";return ('+safe+')')();
        out.textContent+=line+' = '+res+'\n';
      }
    }catch(e){out.textContent+=line+' → Error: '+e.message+'\n';}
  });
}
function pcmPlot(){
  let c=document.getElementById('pcm-canvas');c.style.display='block';
  let ctx=c.getContext('2d');let w=c.offsetWidth||480,h=120;c.width=w;c.height=h;
  let inp=document.getElementById('pcm-input').value.split('\n')[0].trim();
  let expr=inp.replace(/\^/g,'**').replace(/pi/g,'Math.PI').replace(/\bsin\b/g,'Math.sin').replace(/\bcos\b/g,'Math.cos').replace(/\btan\b/g,'Math.tan').replace(/\bsqrt\b/g,'Math.sqrt');
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='#00f';ctx.beginPath();
  for(let i=0;i<w;i++){
    let x=(i/w)*20-10;
    try{
      let y=Function('x','"use strict";return '+expr)(x);
      let py=h/2-y*(h/8);
      i===0?ctx.moveTo(i,py):ctx.lineTo(i,py);
    }catch(e){ctx.moveTo(i,h/2);}
  }ctx.stroke();
  ctx.strokeStyle='#ccc';ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
}
function pcmClear(){document.getElementById('pcm-input').value='';document.getElementById('pcm-output').textContent='';document.getElementById('pcm-canvas').style.display='none';}

// ─── CALCULATOR ───
function openCalculator(){
  WM.make('calc','Calculator',240,320,
  `<div style="padding:6px;display:flex;flex-direction:column;gap:3px;">
    <div id="calc-display" style="background:#fff;border:2px inset #808080;padding:4px 8px;font-family:Consolas;font-size:18px;text-align:right;min-height:30px;overflow:hidden;white-space:nowrap;">0</div>
    <div id="calc-sub" style="font-family:Consolas;font-size:10px;text-align:right;height:14px;color:#444;"></div>
    ${[['MC','MR','MS','M+','M-'],['CE','C','±','√','÷'],['7','8','9','×','%'],['4','5','6','-','1/x'],['1','2','3','+','='],['0','.','']].map(function(row){
      return `<div style="display:flex;gap:3px;">${row.map(function(k){
        if(!k)return '<div style="flex:2;"></div>';
        let w=k==='0'?'flex:2;':'flex:1;';
        return `<button class="btn" style="${w}min-width:0;height:28px;font-size:13px;" onclick="calcKey('${k}')">${k}</button>`;
      }).join('')}</div>`;
    }).join('')}
  </div>`,{noResize:true,noMax:true});
  window.calcState={val:'0',op:null,prev:null,fresh:false,mem:0};
}
function calcKey(k){
  let s=window.calcState;
  let d=document.getElementById('calc-display');
  let sub=document.getElementById('calc-sub');
  if(!d)return;
  if(k>='0'&&k<='9'||k==='.'){
    if(s.fresh){s.val='0';s.fresh=false;}
    if(k==='.'&&s.val.includes('.'))return;
    s.val=s.val==='0'&&k!=='.'?k:s.val+k;
  } else if(k==='CE'){s.val='0';} else if(k==='C'){s.val='0';s.op=null;s.prev=null;s.fresh=false;if(sub)sub.textContent='';}
  else if(k==='±'){s.val=String(-parseFloat(s.val));}
  else if(k==='√'){s.val=String(Math.sqrt(parseFloat(s.val)));}
  else if(k==='1/x'){s.val=String(1/parseFloat(s.val));}
  else if(k==='%'){s.val=String(parseFloat(s.val)/100);}
  else if(k==='MC'){s.mem=0;} else if(k==='MR'){s.val=String(s.mem);} else if(k==='MS'){s.mem=parseFloat(s.val);} else if(k==='M+'){s.mem+=parseFloat(s.val);} else if(k==='M-'){s.mem-=parseFloat(s.val);}
  else if(['+','-','×','÷'].includes(k)){
    if(s.op&&!s.fresh){
      let r=calcOp(s.prev,parseFloat(s.val),s.op);s.val=String(r);
    }
    s.prev=parseFloat(s.val);s.op=k;s.fresh=true;
    if(sub)sub.textContent=s.val+' '+k;
  } else if(k==='='){
    if(s.op){
      let r=calcOp(s.prev,parseFloat(s.val),s.op);
      if(sub)sub.textContent=s.prev+' '+s.op+' '+s.val+' =';
      s.val=String(r);s.op=null;s.prev=null;s.fresh=true;
    }
  }
  if(isNaN(parseFloat(s.val))&&s.val!=='-')s.val='Error';
  d.textContent=s.val;
}
function calcOp(a,b,op){
  if(op==='+')return a+b;if(op==='-')return a-b;if(op==='×')return a*b;if(op==='÷')return b===0?NaN:a/b;return b;
}

// ─── CALENDAR ───
function openCalendar(){
  WM.make('calendar','Calendar',380,340,
  `<div style="padding:6px;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <button class="btn" style="min-width:24px;" onclick="calNav(-1)">◀</button>
      <b id="cal-title" style="flex:1;text-align:center;"></b>
      <button class="btn" style="min-width:24px;" onclick="calNav(1)">▶</button>
    </div>
    <table id="cal-table" style="width:100%;border-collapse:collapse;font-size:12px;"></table>
    <div id="cal-events" style="margin-top:6px;">
      <b>Events:</b>
      <div id="cal-event-list" class="list-box" style="height:60px;"></div>
      <div style="display:flex;gap:4px;margin-top:4px;">
        <input type="text" id="cal-event-inp" placeholder="New event" style="flex:1;">
        <button class="btn" onclick="calAddEvent()">Add</button>
      </div>
    </div>
  </div>`);
  window.calDate=new Date();window.calEvents={};
  calRender();
}
function calRender(){
  let d=window.calDate;
  let y=d.getFullYear(),m=d.getMonth();
  document.getElementById('cal-title').textContent=['January','February','March','April','May','June','July','August','September','October','November','December'][m]+' '+y;
  let first=new Date(y,m,1).getDay();
  let days=new Date(y,m+1,0).getDate();
  let t=document.getElementById('cal-table');
  t.innerHTML='<tr>'+['Su','Mo','Tu','We','Th','Fr','Sa'].map(function(d){return `<th style="text-align:center;width:14%;">${d}</th>`;}).join('')+'</tr>';
  let day=1,row=document.createElement('tr');
  for(let i=0;i<first;i++)row.appendChild(document.createElement('td'));
  while(day<=days){
    let td=document.createElement('td');
    let key=y+'-'+(m+1)+'-'+day;
    let isToday=(new Date().toDateString()===new Date(y,m,day).toDateString());
    td.style.cssText='text-align:center;padding:2px;cursor:pointer;'+(isToday?'background:#000080;color:#fff;':'');
    td.textContent=day;
    td.onclick=function(dd,kk){return function(){window.calSelectedDate=kk;calShowEvents(kk);};}(day,key);
    if((window.calEvents[key]||[]).length){td.style.fontWeight='bold';}
    row.appendChild(td);
    if((first+day)%7===0){t.appendChild(row);row=document.createElement('tr');}
    day++;
  }
  if(row.children.length)t.appendChild(row);
}
function calNav(dir){window.calDate.setMonth(window.calDate.getMonth()+dir);calRender();}
function calShowEvents(key){
  let el=document.getElementById('cal-event-list');if(!el)return;
  el.innerHTML=(window.calEvents[key]||[]).map(function(e){return `<div class="list-item">${e}</div>`;}).join('');
}
function calAddEvent(){
  let key=window.calSelectedDate;if(!key){alert('Select a date first.');return;}
  let val=document.getElementById('cal-event-inp').value.trim();if(!val)return;
  if(!window.calEvents[key])window.calEvents[key]=[];
  window.calEvents[key].push(val);
  document.getElementById('cal-event-inp').value='';
  calShowEvents(key);calRender();
}

// ─── CONTACTS ───
function openContacts(){
  let contacts=JSON.parse(localStorage.getItem('loopsContacts')||'[]');
  WM.make('contacts','Contacts',420,380,
  `<div style="display:flex;height:100%;">
    <div style="width:160px;border-right:2px inset #808080;display:flex;flex-direction:column;">
      <div class="menu-bar"><span class="menu-item" onclick="ctcNew()">New</span></div>
      <div id="ctc-list" class="list-box" style="flex:1;"></div>
    </div>
    <div style="flex:1;padding:8px;display:flex;flex-direction:column;gap:4px;" id="ctc-detail">
      <p style="color:#808080;">Select a contact</p>
    </div>
  </div>`);
  window.contactsData=contacts;window.contactSelected=-1;
  ctcRender();
}
function ctcRender(){
  let el=document.getElementById('ctc-list');if(!el)return;
  el.innerHTML=window.contactsData.map(function(c,i){
    return `<div class="list-item${i===window.contactSelected?' selected':''}" onclick="ctcSelect(${i})">${c.name}</div>`;
  }).join('');
}
function ctcSelect(i){
  window.contactSelected=i;ctcRender();
  let c=window.contactsData[i];
  let d=document.getElementById('ctc-detail');if(!d)return;
  d.innerHTML=`<b style="font-size:14px;">${c.name}</b>
    <label>Phone: <input type="text" value="${c.phone||''}" onchange="ctcUpdate(${i},'phone',this.value)" style="width:180px;"></label>
    <label>Email: <input type="text" value="${c.email||''}" onchange="ctcUpdate(${i},'email',this.value)" style="width:180px;"></label>
    <label>Address: <input type="text" value="${c.address||''}" onchange="ctcUpdate(${i},'address',this.value)" style="width:180px;"></label>
    <label>Notes: <textarea onchange="ctcUpdate(${i},'notes',this.value)" style="width:100%;height:60px;">${c.notes||''}</textarea></label>
    <button class="btn" onclick="ctcDelete(${i})">Delete</button>`;
}
function ctcUpdate(i,field,val){window.contactsData[i][field]=val;localStorage.setItem('loopsContacts',JSON.stringify(window.contactsData));}
function ctcNew(){
  let name=prompt('Contact name:');if(!name)return;
  window.contactsData.push({name,phone:'',email:'',address:'',notes:''});
  localStorage.setItem('loopsContacts',JSON.stringify(window.contactsData));
  ctcRender();ctcSelect(window.contactsData.length-1);
}
function ctcDelete(i){
  window.contactsData.splice(i,1);
  localStorage.setItem('loopsContacts',JSON.stringify(window.contactsData));
  window.contactSelected=-1;ctcRender();
  let d=document.getElementById('ctc-detail');if(d)d.innerHTML='<p style="color:#808080;">Select a contact</p>';
}
