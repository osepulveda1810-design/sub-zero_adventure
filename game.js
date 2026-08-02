const GAME_VERSION="2.19";
let buildNum=57; try{ var s=localStorage.getItem('sz_build_v177'); buildNum=(s?parseInt(s):56)+1; localStorage.setItem('sz_build_v177',buildNum); }catch(e){} try{ document.getElementById('build-num').textContent=buildNum; }catch(e){}

console.log("%c SUB-ZERO v1.80 - CELESTE DARK + SPRITES CONFIGURABLES ","background:#001a33;color:#7ef0ff;font-size:14px;padding:8px 12px;border-radius:8px;border:1px solid #0ff");


// Sistema de sprites - carga desde archivos externos

const SPRITE_CONFIG = {
  idle: { file: "idle.png", frames: 4, speed: 120, scale: 1, scaleX: 1, scaleY: 1, anchorY: 31, fallbackColor: "#00e5ff", desc: "Idle 4F realista - FIX suelo" },
  walk: { file: "walk.png", frames: 4, speed: 140, scale: 1.3, scaleX: 1.75, scaleY: 1.3, anchorY: 46, fallbackColor: "#7ef0ff", desc: "Walk 4F realista - FIX suelo" },
  jump: { file: "jump.png", frames: 3, speed: 120, scale: 0.9, scaleX: 0.9, scaleY: 0.9, anchorY: 29, fallbackColor: "#a0e6ff", desc: "Salto 3F realista" },
  punch: { file: "punch.png", frames: 4, speed: 70, scale: 1.15, scaleX: 1.15, scaleY: 1.15, anchorY: 45, fallbackColor: "#4ecca3", desc: "Puño 4F realista" },
  kick: { file: "kick.png", frames: 4, speed: 80, scale: 1.2, scaleX: 1.2, scaleY: 1.2, anchorY: 62, fallbackColor: "#7ef0ff", desc: "Patada 4F realista" },
  ice_charge: { file: "ice_charge.png", frames: 1, speed: 200, scale: 0.55, scaleX: 0.55, scaleY: 0.55, anchorY: 32, fallbackColor: "#7ef0ff", desc: "Carga hielo realista" },
  ice_shoot: { file: "ice_shoot.png", frames: 1, speed: 200, scale: 0.75, scaleX: 0.75, scaleY: 0.75, anchorY: 31, fallbackColor: "#7ef0ff", desc: "Disparo hielo realista" },
  kick_air: { file: "kick_air.png", frames: 1, speed: 300, scale: 0.85, scaleX: 0.85, scaleY: 0.85, anchorY: 14, fallbackColor: "#7ef0ff", desc: "Patada aire realista" },
  punch_air: { file: "punch_air.png", frames: 1, speed: 300, scale: 0.7, scaleX: 0.7, scaleY: 0.7, anchorY: 27, fallbackColor: "#4ecca3", desc: "Combo aire realista" },
};
const SPRITE_BASE = "assets/sprites/player/";
const SPRITE_STORAGE_KEY = "sz_sprite_config_v2.19";
(function loadSavedSpriteConfig(){ try{ var saved=localStorage.getItem(SPRITE_STORAGE_KEY); if(saved){ var parsed=JSON.parse(saved); Object.keys(parsed).forEach(function(k){ if(SPRITE_CONFIG[k]){ if(parsed[k].scaleX!=null) SPRITE_CONFIG[k].scaleX=parsed[k].scaleX; if(parsed[k].scaleY!=null) SPRITE_CONFIG[k].scaleY=parsed[k].scaleY; if(parsed[k].anchorY!=null) SPRITE_CONFIG[k].anchorY=parsed[k].anchorY; if(parsed[k].scale!=null) SPRITE_CONFIG[k].scale=parsed[k].scale; } }); console.log("%c ✅ Sprites cargados v2.19 ","background:#001a33;color:#4ecca3;padding:4px 8px;border-radius:6px"); } }catch(e){} })();
const playerSprites = {};
const spriteStatus = {};
let spritesReady = false;


var SPRITE_DEFAULTS = {};
try { SPRITE_DEFAULTS = JSON.parse(JSON.stringify(SPRITE_CONFIG)); } catch(e) { SPRITE_DEFAULTS = {}; }
var ENEMY_DEFAULTS = {};
try { ENEMY_DEFAULTS = JSON.parse(JSON.stringify(typeof ENEMY_SPRITE_CONFIG !== 'undefined' ? ENEMY_SPRITE_CONFIG : {})); } catch(e) { ENEMY_DEFAULTS = {}; }
var liveEditorOpen=false, isLocked=false, currentEditChar='player', dummyEnemy=null;
function toggleLiveEditor(){ var el=document.getElementById('live-editor'); var btn=document.getElementById('btn-open-live'); if(!el) return; liveEditorOpen=!liveEditorOpen; if(liveEditorOpen){ el.classList.add('active'); buildLiveEditor(); if(btn) btn.textContent='✕ CERRAR'; } else { el.classList.remove('active'); if(btn) btn.textContent='🎚️ EDITOR'; } }
function toggleLock(){ isLocked=!isLocked; var lb=document.getElementById('btn-lock'); var ov=document.getElementById('lock-overlay'); if(isLocked){ if(lb) lb.textContent='🔒'; if(ov) ov.classList.add('active'); } else { if(lb) lb.textContent='🔓'; if(ov) ov.classList.remove('active'); } }
function changeCharacter(c){ currentEditChar=c; if(c==='player'){ if(dummyEnemy){ try{dummyEnemy.dead=true;}catch(e){} dummyEnemy=null; } buildLiveEditor(); return; } var x=player?player.x+140:350; var y=playerLaneY||320; if(typeof createEnemy==='function'){ if(dummyEnemy) try{dummyEnemy.dead=true;}catch(e){} try{ dummyEnemy=createEnemy(c,x,y); if(dummyEnemy){ dummyEnemy.health=9999; dummyEnemy.isDummy=true; enemies.push(dummyEnemy); } }catch(e){} } buildLiveEditor(); }
function buildLiveEditor(){
  var list=document.getElementById('live-list'); if(!list) return; list.innerHTML='';
  var cfgSet = currentEditChar==='player'? SPRITE_CONFIG : ENEMY_SPRITE_CONFIG[currentEditChar];
  if(!cfgSet) return;
  Object.keys(cfgSet).forEach(function(k){
    var cfg=cfgSet[k]; var div=document.createElement('div'); div.className='live-item';
    var sx=cfg.scaleX||cfg.scale||1, sy=cfg.scaleY||cfg.scale||1, ay=cfg.anchorY||0;
    div.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><b style="color:#7ef0ff;font-size:11px;cursor:pointer" onclick="previewAnim('${k}')">${k.toUpperCase()} 👁️</b><span style="font-size:9px;opacity:0.5">${cfg.file||''}</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
      <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:6px">
        <div style="display:flex;justify-content:space-between"><span style="font-size:8px;color:#4ecca3">ANCHO</span><span id="live-val-${k}-w" style="font-size:11px;color:#4ecca3">${sx.toFixed(2)}</span></div>
        <div style="display:flex;gap:4px;margin-top:4px">
          <button class="btn-live" style="flex:1;min-height:36px;padding:4px" onclick="adjustLiveWH('${k}','w',-0.05)">◀</button>
          <button class="btn-live" style="flex:1;min-height:36px;padding:4px" onclick="adjustLiveWH('${k}','w',0.05)">▶</button>
        </div>
      </div>
      <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:6px">
        <div style="display:flex;justify-content:space-between"><span style="font-size:8px;color:#a78bfa">ALTO</span><span id="live-val-${k}-h" style="font-size:11px;color:#a78bfa">${sy.toFixed(2)}</span></div>
        <div style="display:flex;gap:4px;margin-top:4px">
          <button class="btn-live" style="flex:1;min-height:36px;padding:4px" onclick="adjustLiveWH('${k}','h',-0.05)">◀</button>
          <button class="btn-live" style="flex:1;min-height:36px;padding:4px" onclick="adjustLiveWH('${k}','h',0.05)">▶</button>
        </div>
      </div>
    </div>
    <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:6px;margin-top:8px">
      <div style="display:flex;justify-content:space-between"><span style="font-size:8px;color:#facc15">ALTURA (Y)</span><span id="live-val-${k}-y" style="font-size:11px;color:#facc15">${ay}</span></div>
      <div style="display:flex;gap:4px;margin-top:4px">
        <button class="btn-live" style="flex:1;min-height:36px;padding:4px" onclick="adjustLiveY('${k}',-2)">▼</button>
        <button class="btn-live" style="flex:1;min-height:36px;padding:4px" onclick="adjustLiveY('${k}',2)">▲</button>
      </div>
    </div>`;
    list.appendChild(div);
  });
}
function previewAnim(k){
  if(isLocked) return;
  try{
    player.anim=k;
    player.frame=0;
    player.frameTime=0;
    // forzar preview 2 seg y volver a idle si no esta en aire
    if(k!=='punch_air' && k!=='kick_air'){
      setTimeout(function(){ if(player.anim===k){ player.anim='idle'; player.frame=0; } }, 1200);
    }
    console.log('Preview anim:',k);
  }catch(e){}
}

var _saveDebounce=null;
function onLiveWH(k,wh,v){ if(isLocked) return; var cfg=currentEditChar==='player'?SPRITE_CONFIG[k]:ENEMY_SPRITE_CONFIG[currentEditChar][k]; if(!cfg) return; v=parseFloat(v); if(wh==='w') cfg.scaleX=v; else cfg.scaleY=v; var el=document.getElementById('live-val-'+k+'-'+wh); if(el) el.textContent=v.toFixed(2); clearTimeout(_saveDebounce); _saveDebounce=setTimeout(function(){ saveSpriteConfig(true); }, 400); }
function onLiveY(k,v){ if(isLocked) return; var cfg=currentEditChar==='player'?SPRITE_CONFIG[k]:ENEMY_SPRITE_CONFIG[currentEditChar][k]; if(!cfg) return; cfg.anchorY=parseInt(v); var el=document.getElementById('live-val-'+k+'-y'); if(el) el.textContent=v; clearTimeout(_saveDebounce); _saveDebounce=setTimeout(function(){ saveSpriteConfig(true); }, 400); }
function adjustLiveWH(k,wh,delta){ if(isLocked) return; var cfg=currentEditChar==='player'?SPRITE_CONFIG[k]:ENEMY_SPRITE_CONFIG[currentEditChar][k]; if(!cfg) return; var cur = wh==='w' ? (cfg.scaleX||cfg.scale||1) : (cfg.scaleY||cfg.scale||1); var nv = cur + delta; nv = Math.max(0.1, Math.min(3.5, nv)); if(wh==='w') cfg.scaleX=nv; else cfg.scaleY=nv; var el=document.getElementById('live-val-'+k+'-'+wh); if(el) el.textContent=nv.toFixed(2); clearTimeout(_saveDebounce); _saveDebounce=setTimeout(function(){ saveSpriteConfig(true); }, 300); }
function adjustLiveY(k,delta){ if(isLocked) return; var cfg=currentEditChar==='player'?SPRITE_CONFIG[k]:ENEMY_SPRITE_CONFIG[currentEditChar][k]; if(!cfg) return; var cur = cfg.anchorY||0; var nv = cur + delta; nv = Math.max(-50, Math.min(200, nv)); cfg.anchorY=nv; var el=document.getElementById('live-val-'+k+'-y'); if(el) el.textContent=nv; clearTimeout(_saveDebounce); _saveDebounce=setTimeout(function(){ saveSpriteConfig(true); }, 300); }
function saveSpriteConfig(silent){
  try{
    localStorage.setItem(SPRITE_STORAGE_KEY, JSON.stringify(SPRITE_CONFIG));
    if(!silent){ var fb=document.getElementById('sprite-save-feedback'); if(fb){ fb.textContent='✔ Guardado en navegador (persiste)'; fb.style.opacity='1'; setTimeout(function(){ fb.style.opacity='0'; }, 2500); } }
    else { var fb=document.getElementById('sprite-save-feedback'); if(fb){ fb.textContent='💾 Auto-guardado'; fb.style.opacity='0.8'; setTimeout(function(){ fb.style.opacity='0'; }, 1200); } }
    return true;
  }catch(e){ if(!silent) alert('Error al guardar: '+e.message); return false; }
}
function resetSpriteConfig(){
  if(!confirm('¿Resetear todos los tamaños a valores por defecto? Se borrará lo guardado.')) return;
  try{
    localStorage.removeItem(SPRITE_STORAGE_KEY);
    Object.keys(SPRITE_DEFAULTS).forEach(function(k){ if(SPRITE_CONFIG[k] && SPRITE_DEFAULTS[k]){ SPRITE_CONFIG[k].scaleX=SPRITE_DEFAULTS[k].scaleX; SPRITE_CONFIG[k].scaleY=SPRITE_DEFAULTS[k].scaleY; SPRITE_CONFIG[k].anchorY=SPRITE_DEFAULTS[k].anchorY; SPRITE_CONFIG[k].scale=SPRITE_DEFAULTS[k].scale; } });
    buildLiveEditor();
    var fb=document.getElementById('sprite-save-feedback'); if(fb){ fb.textContent='🗑️ Reseteado'; fb.style.opacity='1'; setTimeout(function(){ fb.style.opacity='0'; }, 2000); }
    setTimeout(function(){ location.reload(); }, 800);
  }catch(e){ console.error(e); }
}

function moveLive(d){ if(isLocked) return; if(d==='left'){ keys.left=true; setTimeout(()=>keys.left=false,400); player.facingRight=false; } if(d==='right'){ keys.right=true; setTimeout(()=>keys.right=false,400); player.facingRight=true; } }
function exportLiveConfig(){ var out="const SPRITE_CONFIG = {\n"; Object.keys(SPRITE_CONFIG).forEach(function(k){ var c=SPRITE_CONFIG[k]; out+=`  ${k}: { file: "${c.file}", frames: ${c.frames}, speed: ${c.speed}, scale: ${c.scale}, scaleX: ${c.scaleX||c.scale}, scaleY: ${c.scaleY||c.scale}, anchorY: ${c.anchorY} },\n`; }); out+="};"; var a=document.getElementById('live-export'); if(a){ a.style.display="block"; a.textContent=out; } }
function copyLiveConfig(){ exportLiveConfig(); var a=document.getElementById('live-export'); if(navigator.clipboard) navigator.clipboard.writeText(a.textContent).then(()=>alert('Copiado')); }
function updateLiveButtonVisibility(){ var b=document.getElementById('btn-open-live'); if(!b) return; if(currentState==='PLAYING'){ b.classList.add('visible'); if(LEVELS[currentLevel] && LEVELS[currentLevel].isEditor && !liveEditorOpen) setTimeout(()=>{ if(!liveEditorOpen) toggleLiveEditor(); },700); } else b.classList.remove('visible'); }
setInterval(updateLiveButtonVisibility,600);


function initSprites(){
  var keys = Object.keys(SPRITE_CONFIG);
  var total = keys.length;
  var loaded = 0;
  function checkDone(){ loaded++; if(loaded>=total){ spritesReady=true; updateSpriteUI(); } }
  keys.forEach(function(key){
    var cfg = SPRITE_CONFIG[key];
    spriteStatus[key]="loading";
    var img = new Image();
    img.onload=function(){ spriteStatus[key]="ok"; console.log("Sprite OK:",key); checkDone(); };
    img.onerror=function(){
      console.warn("Sprite FAIL:",key,"-> usando fallback celeste");
      spriteStatus[key]="fail";
      checkDone();
    };
    img.src=SPRITE_BASE + cfg.file;
    playerSprites[key]=img;
  });
  setTimeout(function(){
    if(!spritesReady){
      spritesReady=true;
      Object.keys(spriteStatus).forEach(function(k){ if(spriteStatus[k]==="loading") spriteStatus[k]="fail"; });
      updateSpriteUI();
    }
  }, 4000);
  setTimeout(function(){ analyzeAllSprites(); }, 500);
}
// Analizar spritesheet para calcular offsets de anclaje por frame
function analyzeSpriteOffsets(key){
  var cfg=SPRITE_CONFIG[key]; if(!cfg) return;
  var sprite=playerSprites[key]; if(!sprite||!sprite.complete||sprite.naturalWidth<10) return;
  var totalFrames=cfg.frames||4;
  var sheetW=sprite.naturalWidth; var sheetH=sprite.naturalHeight;
  var orient=cfg.orientation||'auto'; var isHorizontal=true;
  if(orient==='horizontal') isHorizontal=true;
  else if(orient==='vertical') isHorizontal=false;
  else {
    var fh=Math.floor(sheetW/totalFrames), fv=Math.floor(sheetH/totalFrames);
    var rh=fh/sheetH, rv=sheetW/fv;
    if((rh<0.15||rh>3.0)&&(rv>=0.15&&rv<=3.0)) isHorizontal=false;
    else if((rh>=0.15&&rh<=3.0)&&(rv>=0.15&&rv<=3.0))
      isHorizontal=(Math.abs(rh-1)<=Math.abs(rv-1));
  }
  var sw=isHorizontal?Math.floor(sheetW/totalFrames):sheetW;
  var sh=isHorizontal?sheetH:Math.floor(sheetH/totalFrames);

  // Crear canvas temporal para analizar píxeles
  var tcanvas=document.createElement('canvas');
  var tctx=tcanvas.getContext('2d');
  tcanvas.width=sw; tcanvas.height=sh;

  var offsets=[];
  for(var f=0;f<totalFrames;f++){
    var sx=isHorizontal?Math.floor(f*sw):0;
    var sy=isHorizontal?0:Math.floor(f*sh);
    tctx.clearRect(0,0,sw,sh);
    tctx.drawImage(sprite,sx,sy,sw,sh,0,0,sw,sh);
    try{
      var data=tctx.getImageData(0,0,sw,sh).data;
      var left=sw, right=0;
      for(var py=0;py<sh;py++){
        for(var px=0;px<sw;px++){
          var idx=(py*sw+px)*4;
          var alpha=data[idx+3];
          if(alpha>30){ if(px<left) left=px; if(px>right) right=px; }
        }
      }
      var center=Math.round((left+right)/2);
      var offset=Math.round(sw/2)-center;
      offsets.push(offset);
    }catch(e){ offsets.push(0); }
  }
  cfg.frameOffsets=offsets;
  console.log('Offsets '+key+':',offsets);
}

function analyzeAllSprites(){
  Object.keys(SPRITE_CONFIG).forEach(function(key){
    if(spriteStatus[key]==='ok') analyzeSpriteOffsets(key);
  });
}

function updateScaleUI(){ try{ var el=document.getElementById("current-scale"); if(el) el.textContent=PLAYER_SCALE.toFixed(1)+"x ("+baseDrawWidth+"x"+baseDrawHeight+")"; }catch(e){} }
function updateSpriteUI(){ updateScaleUI();
  try{
    var quick=document.getElementById('sprite-quick-status');
    if(quick){
      var ok=Object.values(spriteStatus).filter(function(s){return s==="ok"}).length;
      var total=Object.keys(spriteStatus).length;
      quick.textContent="Sprites: "+ok+"/"+total+" OK • Idle 4f + Walk 4f • Carga desde archivos";
    }
    var list=document.getElementById('sprite-config-list');
    if(list){
      list.innerHTML="";
      Object.keys(SPRITE_CONFIG).forEach(function(k){
        var cfg=SPRITE_CONFIG[k];
        var st=spriteStatus[k]||"loading";
        var div=document.createElement('div');
        div.className="sprite-item";
        div.innerHTML='<div><b style="color:#7ef0ff">'+k.toUpperCase()+'</b> <span style="opacity:0.5">'+cfg.file+'</span><div style="opacity:0.4;font-size:9px">'+cfg.desc+'</div></div><div class="sprite-status '+(st==="ok"?"status-ok":st==="fail"?"status-fail":"status-loading")+'">'+st.toUpperCase()+'</div>';
        list.appendChild(div);
      });
    }
  }catch(e){}
}

initSprites();

// LEVELS y ENEMIGOS de v1.35
const LEVELS = [
    { id: 0, name: "🎨 MODO EDICION", subtitle: "Laboratorio sin enemigos", boss: "Ninguno", bossTitle: "Modo Seguro", story: "Dojo privado para probar sprites sin enemigos.", bgColor: [12, 14, 28], groundColor: [35, 40, 55], enemyTypes: [], enemyCount: 0, isEditor: true },
    { id: 1, name: "Calles de la Ciudad", subtitle: "El Frio Amanece", boss: "Kano", bossTitle: "Lider del Dragon Negro", story: "Tras la muerte de tu hermano Bi-Han, descubres que mercenarios del Dragon Negro secuestran civiles para experimentos del clan Lin Kuei. Debes detenerlos.", bgColor: [15, 20, 35], groundColor: [40, 45, 60], enemyTypes: ['thug','thug_gun','ninja_renegade'], enemyCount: 12 },
    { id: 2, name: "Fabrica Abandonada", subtitle: "El Frio de la Maquina", boss: "Sektor", bossTitle: "Ciborg del Lin Kuei", story: "Rastreas los secuestros hasta una fabrica donde el Lin Kuei transforma a sus miembros en ciborgs asesinos. Sektor te espera.", bgColor: [25, 20, 15], groundColor: [55, 50, 40], enemyTypes: ['cyborg_basic','technician','sektor_miniboss'], enemyCount: 13 },
    { id: 3, name: "Templo Shaolin", subtitle: "Sangre sobre los Sagrados", boss: "Baraka", bossTitle: "Guerrero Tarkatano", story: "Los monjes shaolin son masacrados por Tarkatanos de Outworld.", bgColor: [30, 25, 20], groundColor: [80, 70, 50], enemyTypes: ['monk_renegade','tarkatan','priest_quan'], enemyCount: 14 },
    { id: 4, name: "El Pantano", subtitle: "Niebla Traicionera", boss: "Reptile", bossTitle: "Espia Saurio", story: "Sigues el rastro del mapa robado hasta un pantano tenebroso.", bgColor: [15, 25, 15], groundColor: [35, 55, 30], enemyTypes: ['zombie','reptile_mutant','shadow_ghost'], enemyCount: 14 },
    { id: 5, name: "Fortaleza del Dragon Negro", subtitle: "Corazon de la Traicion", boss: "Cyrax", bossTitle: "Ciborg Tragico", story: "Descubres que Kano no actuaba solo.", bgColor: [35, 15, 10], groundColor: [60, 30, 20], enemyTypes: ['soldier_elite','cyborg_upgrade','assassin_lk'], enemyCount: 14 },
    { id: 6, name: "Costa de Outworld", subtitle: "Puerta al Infierno", boss: "Goro", bossTitle: "Principe Shokan", story: "Cruzas a Outworld para enfrentar al verdadero villano.", bgColor: [45, 20, 35], groundColor: [70, 40, 55], enemyTypes: ['shokan','sindel_priest','shadow_knight'], enemyCount: 15 },
    { id: 7, name: "Templo de la Oscuridad", subtitle: "Alma Corrupta", boss: "Shang Tsung", bossTitle: "Hechicero de Almas", story: "Shang Tsung roba almas para abrir el portal.", bgColor: [20, 10, 30], groundColor: [50, 40, 60], enemyTypes: ['spectre','demon_quan','statue'], enemyCount: 15 },
    { id: 8, name: "Infierno de Quan Chi", subtitle: "El Final del Linaje", boss: "Noob Saibot", bossTitle: "La Sombra de Bi-Han", story: "Tu hermano ha vuelto como espectro. Debes liberarlo.", bgColor: [30, 10, 10], groundColor: [50, 15, 10], enemyTypes: ['demon_lord','shadow_clone','hell_beast'], enemyCount: 16 }
];
const ENEMY_CONFIGS = {
    thug: { name: "Maton", health: 60, damage: 5, speed: 0.8, color: '#8B4513', height: 50, width: 40 },
    thug_gun: { name: "Maton Armado", health: 50, damage: 8, speed: 0.5, color: '#556B2F', height: 50, width: 40 },
    ninja_renegade: { name: "Ninja Renegado", health: 70, damage: 6, speed: 1.2, color: '#2F4F4F', height: 55, width: 38 },
    cyborg_basic: { name: "Ciborg LK", health: 60, damage: 7, speed: 0.6, color: '#708090', height: 60, width: 44 },
    technician: { name: "Tecnico", health: 50, damage: 4, speed: 0.7, color: '#4682B4', height: 48, width: 36 },
    sektor_miniboss: { name: "Sektor Mini", health: 100, damage: 10, speed: 0.9, color: '#DC143C', height: 65, width: 46 },
    monk_renegade: { name: "Monje Corrupto", health: 65, damage: 6, speed: 0.9, color: '#8B6914', height: 52, width: 40 },
    tarkatan: { name: "Tarkatano", health: 75, damage: 10, speed: 1.3, color: '#8B0000', height: 58, width: 42 },
    priest_quan: { name: "Sacerdote Oscuro", health: 60, damage: 8, speed: 0.6, color: '#4B0082', height: 50, width: 38 },
    zombie: { name: "Zombi", health: 70, damage: 8, speed: 0.4, color: '#556B2F', height: 55, width: 42 },
    reptile_mutant: { name: "Reptil Mutante", health: 70, damage: 7, speed: 1.1, color: '#228B22', height: 52, width: 40 },
    shadow_ghost: { name: "Sombra Espectral", health: 60, damage: 9, speed: 1.0, color: '#483D8B', height: 60, width: 36 },
    soldier_elite: { name: "Soldado Elite", health: 65, damage: 9, speed: 0.8, color: '#2F4F4F', height: 58, width: 44 },
    cyborg_upgrade: { name: "Ciborg MK-II", health: 80, damage: 10, speed: 0.7, color: '#696969', height: 62, width: 46 },
    assassin_lk: { name: "Asesino LK", health: 75, damage: 12, speed: 1.4, color: '#191970', height: 55, width: 40 },
    shokan: { name: "Guerrero Shokan", health: 100, damage: 14, speed: 0.7, color: '#8B4513', height: 80, width: 55 },
    sindel_priest: { name: "Sacerdotisa", health: 65, damage: 10, speed: 0.9, color: '#9370DB', height: 55, width: 40 },
    shadow_knight: { name: "Caballero Sombra", health: 85, damage: 12, speed: 0.8, color: '#2C2C2C', height: 65, width: 48 },
    spectre: { name: "Espectro", health: 75, damage: 11, speed: 1.0, color: '#7B68EE', height: 58, width: 38 },
    demon_quan: { name: "Demonio", health: 80, damage: 13, speed: 0.8, color: '#DC143C', height: 65, width: 44 },
    statue: { name: "Estatua Animada", health: 120, damage: 15, speed: 0.5, color: '#808080', height: 75, width: 50 },
    demon_lord: { name: "Senor Demonio", health: 110, damage: 16, speed: 0.7, color: '#8B0000', height: 75, width: 50 },
    shadow_clone: { name: "Clon de Sombra", health: 70, damage: 12, speed: 1.3, color: '#000000', height: 58, width: 40 },
    hell_beast: { name: "Bestia del Infierno", health: 130, damage: 18, speed: 0.9, color: '#FF4500', height: 70, width: 54 }
};
const BOSS_CONFIGS = {
    "Kano": { health: 220, damage: 8, speed: 1.2, color: '#FFD700', height: 80, width: 52 },
    "Sektor": { health: 300, damage: 10, speed: 1.0, color: '#DC143C', height: 85, width: 54 },
    "Baraka": { health: 380, damage: 12, speed: 1.5, color: '#8B0000', height: 78, width: 48 },
    "Reptile": { health: 340, damage: 10, speed: 1.8, color: '#228B22', height: 75, width: 46 },
    "Cyrax": { health: 420, damage: 14, speed: 1.3, color: '#FFD700', height: 82, width: 52 },
    "Goro": { health: 600, damage: 18, speed: 0.8, color: '#8B4513', height: 110, width: 72 },
    "Shang Tsung": { health: 520, damage: 15, speed: 1.0, color: '#4B0082', height: 85, width: 54 },
    "Noob Saibot": { health: 750, damage: 20, speed: 1.4, color: '#000000', height: 85, width: 54 }
};

// Core
let player={x:120,y:0,speed:5.0,facingRight:true,health:100,maxHealth:100,anim:'idle',frame:0,frameTime:0,scale:1.8,idleBob:0, jumpOffset:0, vy:0, grounded:true, landingTimer:0, isChargingIce:false, isIceLoaded:false, iceChargeTimer:0, isShootingIce:false, shootIceTimer:0};
let ICE_CHARGE_TIME=750;
let ICE_HOLD_MAX=2500;
let GRAVITY=0.78; let JUMP_FORCE=-14.5;
let _oldPlayer={x:120,y:0,speed:3.2,facingRight:true,health:100,maxHealth:100,anim:'idle',frame:0,frameTime:0,scale:1.8};
let baseDrawWidth=90, baseDrawHeight=110, laneTop=180, laneBottom=360, playerLaneY=360;
// v1.60 - Personaje agrandado: 50->90 (80% más grande), escala configurable 1.0 a 2.5
let PLAYER_SCALE=1.8; // Puedes cambiar a 2.2 para más grande o 1.4 para más pequeño

let camera={x:0,targetX:0,worldWidth:3500,shake:0};
function getWorldWidthForLevel(i){return 3200+i*500;}
function updateCamera(){ var cw=document.getElementById('gameCanvas').width; camera.targetX=player.x-cw*0.38; camera.x+=(camera.targetX-camera.x)*0.09; camera.x=Math.max(0,Math.min(camera.x,camera.worldWidth-cw)); if(camera.shake>0) camera.shake-=16; }
let enemies=[], boss=null, projectiles=[], floatingTexts=[], particles=[];
let spawnTimer=0, enemiesDefeated=0, bossSpawned=false, currentLevel=0, score=0, attachedIce=null;
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d');
const keys={right:false,left:false,up:false,down:false};
let currentState='MENU', gameLoopStarted=false, lastAnimTime=0, isPaused=false;

function tryKick(){ if(player.isPunching || player.isKicking || player.isChargingIce || player.isIceLoaded || player.isShootingIce) return; if(!player.grounded){ player.isKicking=true; player.anim="kick_air"; player.frame=0; player.frameTime=0; player.kickHit=false; player.kickTimer=0; return; } player.isKicking=true; player.anim="kick"; player.frame=0; player.frameTime=0; player.kickHit=false; player.kickTimer=0; }
function tryPunch(){ if(player.isPunching || player.isChargingIce || player.isIceLoaded || player.isShootingIce) return; if(!player.grounded){ player.isPunching=true; player.anim="punch_air"; player.frame=0; player.frameTime=0; player.attackHit=false; player.punchTimer=0; console.log("PUNCH AIR"); return; } player.isPunching=true; player.anim="punch"; player.frame=0; player.frameTime=0; player.attackHit=false; player.punchTimer=0; console.log("PUNCH"); }
function tryJump(){ if(!player.grounded) return; if(player.landingTimer>0) return; if(player.isChargingIce || player.isIceLoaded) return; player.grounded=false; player.vy=JUMP_FORCE; player.jumpOffset=-2; player.frame=0; player.frameTime=0; player.anim='jump'; }
function fireIceProjectile(){
  var sx = attachedIce ? attachedIce.x : player.x + (player.facingRight?52:-12);
  var sy = attachedIce ? attachedIce.y : playerLaneY-28;
  projectiles.push({x:sx,y:sy,vx:(player.facingRight?1:-1)*7.5,vy:0,type:'ice',life:3000});
  attachedIce=null;
  player.isChargingIce=false;
  player.isIceLoaded=false;
  player.iceChargeTimer=0;
  player.isShootingIce=true;
  player.shootIceTimer=0;
  player.anim='ice_shoot';
  player.frame=0;
  player.frameTime=0;
  spawnText(player.x,playerLaneY-20,'HIELO DISPARADO!','#7ef0ff');
}
function tryIce(){
  if(player.isChargingIce || player.isShootingIce) return;
  if(player.isPunching || player.isKicking) return;
  if(!player.grounded) return;
  if(player.isIceLoaded && attachedIce && attachedIce.attached){
    fireIceProjectile();
    return;
  }
  player.isChargingIce=true;
  player.isIceLoaded=false;
  player.isShootingIce=false;
  player.iceChargeTimer=0;
  player.anim='ice_charge';
  player.frame=0;
  player.frameTime=0;
  attachedIce={x:player.x+(player.facingRight?48:-8),y:playerLaneY-28,attached:true,charging:true,life:5000,chargeProgress:0,holdTimer:0};
  spawnText(player.x,playerLaneY-20,'CARGANDO HIELO...','#7ef0ff');
}
function setupCanvas(){
  try{
    var wrapper=document.getElementById('canvas-wrapper');
    var w=wrapper.clientWidth||window.innerWidth;
    var h=wrapper.clientHeight||window.innerHeight-62;
    canvas.width=w; canvas.height=h;
    camera.worldWidth=getWorldWidthForLevel(currentLevel);
    laneBottom=h-90;
    laneTop=Math.max(120,laneBottom-200);
    if(playerLaneY==0||playerLaneY==360) playerLaneY=laneBottom;
  }catch(e){ console.log(e); }
}
function spawnText(x,y,t,c){ floatingTexts.push({x:x,y:y,text:t,color:c||'#fff',timer:0,life:800,vy:-1.2}); }
function createEnemy(type,x,laneY){
  var cfg=ENEMY_CONFIGS[type]; if(!cfg) return null;
  return {type:type,x:x,laneY:laneY,width:cfg.width,height:cfg.height,color:cfg.color,health:cfg.health,maxHealth:cfg.health,speed:cfg.speed,damage:cfg.damage,dead:false,frozen:0};
}
function createBoss(type,x,laneY){
  var cfg=BOSS_CONFIGS[type]; if(!cfg) return null;
  return {name:type,x:x,laneY:laneY,width:cfg.width,height:cfg.height,color:cfg.color,health:cfg.health,maxHealth:cfg.health,damage:cfg.damage,dead:false,frozen:0};
}
var currentWave=0, totalWaves=3, waveSize=5, waveInProgress=false, nextWaveTriggerX=0, waitingForAdvance=false;
function getAliveCount(){ var c=0; for(var i=0;i<enemies.length;i++){ if(!enemies[i].dead) c++; } return c; }
function showWaveArrow(show, text){
  var el=document.getElementById('wave-arrow');
  if(!el) return;
  if(show){
    el.style.display='flex';
    if(text) el.querySelector('.arrow-text').textContent=text;
  } else {
    el.style.display='none';
  }
}
function spawnWave(){
  var lvl=LEVELS[currentLevel]; if(!lvl) return;
  if(enemiesDefeated>=lvl.enemyCount) return;
  if(getAliveCount()>0) return;
  if(currentWave>=totalWaves) return;
  var remaining=lvl.enemyCount - enemiesDefeated;
  if(remaining<=0) return;
  var toSpawn=Math.min(waveSize, remaining);
  if(remaining>=5 && Math.random()>0.5) toSpawn=5; else toSpawn=Math.min(4, remaining);
  if(currentWave===totalWaves-1) toSpawn=remaining;

  // ZONA DE SPAWN PROGRESIVA: cada oleada mas adelante
  var baseOffset = 200 + currentWave*350; // oleada 0=200, 1=550, 2=900 px adelante del player
  var spawnCenterX = player.x + baseOffset;
  if(spawnCenterX < camera.worldWidth-300) {} else { spawnCenterX = camera.worldWidth-400; }

  for(var i=0;i<toSpawn;i++){
    var type=lvl.enemyTypes[Math.floor(Math.random()*lvl.enemyTypes.length)];
    // 70% adelante, 30% atras (para que no sea frustrante, pero si sorpresa)
    var fromFront = Math.random()>0.3;
    var x;
    if(fromFront){
      x=spawnCenterX + Math.random()*160 + i*40;
    } else {
      x=player.x - 120 - Math.random()*80 - i*20;
      if(x<20) x=20+Math.random()*60;
    }
    var laneY=laneTop+14+Math.random()*(laneBottom-laneTop-28);
    var e=createEnemy(type,x,laneY); 
    if(e){ 
      e.fromFront=fromFront;
      enemies.push(e); 
    }
  }
  currentWave++;
  waveInProgress=true;
  waitingForAdvance=false;
  showWaveArrow(false);
  nextWaveTriggerX=0;
  if(typeof spawnText==='function') spawnText(camera.x+canvas.width/2, 110, 'OLEADA '+currentWave+'/'+totalWaves+' - '+toSpawn+' ENEMIGOS', '#facc15');
  console.log('Wave '+currentWave+' spawned '+toSpawn+' at '+spawnCenterX);
}
function spawnEnemy(){ spawnWave(); }
function resetWaves(){
  currentWave=0;
  totalWaves=3;
  waveSize=5;
  waveInProgress=false;
  nextWaveTriggerX=0;
  waitingForAdvance=false;
  enemies=[];
  showWaveArrow(false);
}
function prepareNextWaveAdvance(){
  if(LEVELS[currentLevel] && LEVELS[currentLevel].isEditor) return;
  if(waitingForAdvance) return;
  if(currentWave>=totalWaves) return;
  if(enemiesDefeated>=LEVELS[currentLevel].enemyCount) return;
  waitingForAdvance=true;
  nextWaveTriggerX = player.x + 350 + currentWave*200;
  // clamp
  if(nextWaveTriggerX>camera.worldWidth-200) nextWaveTriggerX=camera.worldWidth-300;
  showWaveArrow(true, 'AVANZA - OLEADA '+(currentWave+1)+'/'+totalWaves+' ➡️');
  if(typeof spawnText==='function') spawnText(player.x, playerLaneY-60, 'AVANZA PARA SIGUIENTE OLEADA', '#facc15');
}



function spawnBoss(){
  var lvl=LEVELS[currentLevel]; if(lvl && lvl.isEditor) return;
  boss=createBoss(lvl.boss,camera.worldWidth-200,(laneTop+laneBottom)/2); bossSpawned=true;
  spawnText(camera.x+canvas.width/2,150,'! '+lvl.boss.toUpperCase()+' !','#ffd700');
}

function drawPlayer(time){
  var depth=(laneBottom-playerLaneY)/Math.max(1,laneBottom-laneTop);
  var sc=(1-depth*0.12)*PLAYER_SCALE;
  var anim=player.anim||'idle';
  // Determinar anim segun estado
  if(anim==='punch_air' || anim==='kick_air'){
  } else if(player.isShootingIce) anim='ice_shoot';
  else if(player.isChargingIce || player.isIceLoaded) anim='ice_charge';
  else if(player.isPunching) anim='punch';
  else if(player.isKicking) anim='kick';
  else if(!player.grounded) anim='jump';
  else if(player.grounded && (keys.right||keys.left) && !(player.isChargingIce||player.isIceLoaded)) anim='walk';
  var cfg=SPRITE_CONFIG[anim]||SPRITE_CONFIG.idle;
  var sprite=playerSprites[anim]||playerSprites.idle;
  var useSprite=spritesReady && sprite && sprite.complete && sprite.naturalWidth>10 && spriteStatus[anim]==='ok';

  // --- LOGICA DE FRAMES Y DAÑO (siempre se ejecuta, con o sin sprite) ---
  var totalFrames=cfg.frames||4;
  if(!player.frameTime) player.frameTime=0;
  // No avanzar aqui todavia, lo hacemos por anim
  var shouldAdvance = true;

  if(anim==='idle' || anim==='walk'){
    player.frameTime+=16;
    if(player.frameTime>cfg.speed){ player.frame=(player.frame+1)%totalFrames; player.frameTime=0; }
  } else if(anim==='punch'){
    player.frameTime+=16;
    if(player.frameTime>cfg.speed){
      player.frame++; player.frameTime=0;
      if(player.frame>=4){ player.frame=0; player.anim='idle'; player.isPunching=false; player.attackHit=false; player.punchTimer=0; }
      else if(player.frame>=2 && !player.attackHit){
        player.attackHit=true;
        // DAÑO PUNCH suelo
        var __cands=[]; for(var __i=0;__i<enemies.length;__i++){ var __en=enemies[__i]; if(__en.dead) continue; var __dx=__en.x-player.x; var __enY=__en.laneY||__en.y||playerLaneY; var __dy=Math.abs(__enY-playerLaneY); var __inFront=(player.facingRight && __dx>5 && __dx<110) || (!player.facingRight && __dx<-5 && __dx>-110); if(__inFront && __dy<60) __cands.push({en:__en, dist:Math.abs(__dx)+__dy}); } __cands.sort(function(a,b){return a.dist-b.dist;}); for(var __ci=0; __ci<Math.min(2, __cands.length); __ci++){ var en=__cands[__ci].en; en.health-=15; en.hitTimer=12; en.frozen=0; en.x += (player.facingRight?1:-1)*12; if(typeof spawnText==='function') spawnText(en.x, (en.laneY||en.y)-30, 'PUM 15','#7ef0ff'); if(en.health<=0){ en.dead=true; if(typeof enemiesDefeated!=='undefined') enemiesDefeated++; if(typeof score!=='undefined') score+=15; } }
        if(boss && !boss.dead){ var __bdx=boss.x-player.x; var __bdy=Math.abs((boss.laneY||boss.y||playerLaneY)-playerLaneY); var __bFront=(player.facingRight && __bdx>0 && __bdx<130) || (!player.facingRight && __bdx<0 && __bdx>-130); if(__bFront && __bdy<70){ boss.health-=12; boss.hitTimer=10; boss.frozen=0; boss.x += (player.facingRight?1:-1)*6; if(typeof spawnText==='function') spawnText(boss.x, (boss.laneY||boss.y)-40, 'PUM BOSS 12','#ffcc00'); if(boss.health<=0){ boss.dead=true; if(typeof score!=='undefined') score+=500; } } }
      }
    }
  } else if(anim==='kick'){
    player.frameTime+=16;
    if(player.frameTime>cfg.speed){
      player.frame++; player.frameTime=0;
      if(player.frame>=4){ player.frame=0; player.anim='idle'; player.isKicking=false; player.kickHit=false; player.kickTimer=0; }
      else if(player.frame>=1 && !player.kickHit){
        player.kickHit=true;
        var __candsK=[]; for(var __i=0;__i<enemies.length;__i++){ var __en=enemies[__i]; if(__en.dead) continue; var __dx=__en.x-player.x; var __enY=__en.laneY||__en.y||playerLaneY; var __dy=Math.abs(__enY-playerLaneY); var __inFrontK=(player.facingRight && __dx>10 && __dx<135) || (!player.facingRight && __dx<-10 && __dx>-135); if(__inFrontK && __dy<65) __candsK.push({en:__en, dist:Math.abs(__dx)+__dy}); } __candsK.sort(function(a,b){return a.dist-b.dist;}); for(var __ci=0; __ci<Math.min(2, __candsK.length); __ci++){ var en=__candsK[__ci].en; en.health-=25; en.hitTimer=14; en.frozen=0; en.x += (player.facingRight?1:-1)*18; if(typeof spawnText==='function') spawnText(en.x, (en.laneY||en.y)-30, 'KICK 25','#facc15'); if(en.health<=0){ en.dead=true; if(typeof enemiesDefeated!=='undefined') enemiesDefeated++; if(typeof score!=='undefined') score+=20; } }
        if(boss && !boss.dead){ var __bdx=boss.x-player.x; var __bdy=Math.abs((boss.laneY||boss.y||playerLaneY)-playerLaneY); var __bFrontK=(player.facingRight && __bdx>0 && __bdx<145) || (!player.facingRight && __bdx<0 && __bdx>-145); if(__bFrontK && __bdy<75){ boss.health-=22; boss.hitTimer=12; boss.frozen=0; boss.x += (player.facingRight?1:-1)*10; if(typeof spawnText==='function') spawnText(boss.x, (boss.laneY||boss.y)-40, 'KICK BOSS 22','#ff7700'); if(boss.health<=0){ boss.dead=true; if(typeof score!=='undefined') score+=500; } } }
      }
    }
  } else if(anim==='punch_air'){
    player.frameTime+=16;
    if(player.frameTime>cfg.speed){
      player.frame++; player.frameTime=0;
      if(player.frame>=totalFrames){ player.frame=0; player.anim='jump'; player.isPunching=false; player.attackHit=false; player.punchTimer=0; }
      else if(player.frame>=1 && !player.attackHit){
        player.attackHit=true;
        // FIX v2.19: DAÑO AEREO AHORA FUNCIONA SIEMPRE
        var __candsA=[]; for(var __i=0;__i<enemies.length;__i++){ var __en=enemies[__i]; if(__en.dead) continue; var __dx=__en.x-player.x; var __enY=__en.laneY||__en.y||playerLaneY; var __dy=Math.abs(__enY-playerLaneY); var __inFront=(player.facingRight && __dx>5 && __dx<100) || (!player.facingRight && __dx<-5 && __dx>-100); if(__inFront && __dy<55) __candsA.push({en:__en, dist:Math.abs(__dx)+__dy}); } __candsA.sort(function(a,b){return a.dist-b.dist;}); for(var __ci=0; __ci<Math.min(2, __candsA.length); __ci++){ var en=__candsA[__ci].en; en.health-=18; en.hitTimer=12; en.frozen=0; en.x += (player.facingRight?1:-1)*14; if(typeof spawnText==='function') spawnText(en.x, (en.laneY||en.y)-30, 'AIR PUNCH 18','#4ecca3'); if(en.health<=0){ en.dead=true; if(typeof enemiesDefeated!=='undefined') enemiesDefeated++; if(typeof score!=='undefined') score+=25; } }
        if(boss && !boss.dead){ var __bdx=boss.x-player.x; var __bdy=Math.abs((boss.laneY||boss.y||playerLaneY)-playerLaneY); var __bFront=(player.facingRight && __bdx>0 && __bdx<120) || (!player.facingRight && __bdx<0 && __bdx>-120); if(__bFront && __bdy<65){ boss.health-=15; boss.hitTimer=10; boss.frozen=0; boss.x += (player.facingRight?1:-1)*8; if(typeof spawnText==='function') spawnText(boss.x, (boss.laneY||boss.y)-40, 'AIR PUNCH BOSS 15','#ff7700'); if(boss.health<=0){ boss.dead=true; if(typeof score!=='undefined') score+=500; } } }
      }
    }
  } else if(anim==='kick_air'){
    player.frameTime+=16;
    if(player.frameTime>cfg.speed){
      player.frame++; player.frameTime=0;
      if(player.frame>=totalFrames){ player.frame=0; player.anim='jump'; player.isKicking=false; player.kickHit=false; player.kickTimer=0; }
      else if(player.frame>=1 && !player.kickHit){
        player.kickHit=true;
        var __candsK2=[]; for(var __i=0;__i<enemies.length;__i++){ var __en=enemies[__i]; if(__en.dead) continue; var __dx=__en.x-player.x; var __enY=__en.laneY||__en.y||playerLaneY; var __dy=Math.abs(__enY-playerLaneY); var __inFrontK=(player.facingRight && __dx>10 && __dx<120) || (!player.facingRight && __dx<-10 && __dx>-120); if(__inFrontK && __dy<60) __candsK2.push({en:__en, dist:Math.abs(__dx)+__dy}); } __candsK2.sort(function(a,b){return a.dist-b.dist;}); for(var __ci=0; __ci<Math.min(2, __candsK2.length); __ci++){ var en=__candsK2[__ci].en; en.health-=22; en.hitTimer=14; en.frozen=0; en.x += (player.facingRight?1:-1)*16; if(typeof spawnText==='function') spawnText(en.x, (en.laneY||en.y)-30, 'AIR KICK 22','#facc15'); if(en.health<=0){ en.dead=true; if(typeof enemiesDefeated!=='undefined') enemiesDefeated++; if(typeof score!=='undefined') score+=30; } }
        if(boss && !boss.dead){ var __bdx=boss.x-player.x; var __bdy=Math.abs((boss.laneY||boss.y||playerLaneY)-playerLaneY); var __bFrontK=(player.facingRight && __bdx>0 && __bdx<130) || (!player.facingRight && __bdx<0 && __bdx>-130); if(__bFrontK && __bdy<70){ boss.health-=18; boss.hitTimer=12; boss.frozen=0; boss.x += (player.facingRight?1:-1)*10; if(typeof spawnText==='function') spawnText(boss.x, (boss.laneY||boss.y)-40, 'AIR KICK BOSS 18','#ff7700'); if(boss.health<=0){ boss.dead=true; if(typeof score!=='undefined') score+=500; } } }
      }
    }
  } else if(anim==='jump'){
    var f; if(player.grounded){ f=(player.landingTimer>0)?2:0; } else { f=(player.vy < -0.5)?0:1; } player.frame=f;
  } else if(anim==='ice_charge' || anim==='ice' || anim==='ice_shoot' || anim==='ice_shot'){
    if(anim==='ice_shoot' || anim==='ice_shot'){ player.frameTime+=16; if(player.frameTime>cfg.speed){ player.frame++; player.frameTime=0; if(player.frame>=totalFrames){ player.frame=0; player.isShootingIce=false; player.anim='idle'; player.shootIceTimer=0; } } } else { player.frame=0; player.frameTime=0; }
  } else {
    player.frameTime+=16; if(player.frameTime>cfg.speed){ player.frame=(player.frame+1)%totalFrames; player.frameTime=0; }
  }

  // --- DIBUJO ---
  if(useSprite){
    try{
      var sheetW=sprite.naturalWidth; var sheetH=sprite.naturalHeight;
      var orient=cfg.orientation||'auto'; var isHorizontal=true;
      if(orient==='horizontal') isHorizontal=true; else if(orient==='vertical') isHorizontal=false;
      else {
        var frameW_horiz=Math.floor(sheetW/totalFrames); var frameH_horiz=sheetH;
        var ratio_horiz=frameW_horiz/frameH_horiz; var frameW_vert=sheetW; var frameH_vert=Math.floor(sheetH/totalFrames);
        var ratio_vert=frameW_vert/frameH_vert;
        var horizReasonable=(ratio_horiz>=0.15 && ratio_horiz<=3.0); var vertReasonable=(ratio_vert>=0.15 && ratio_vert<=3.0);
        if(!horizReasonable && vertReasonable) isHorizontal=false; else if(horizReasonable && vertReasonable){ isHorizontal=(Math.abs(ratio_horiz-1)<=Math.abs(ratio_vert-1)); }
      }
      var sw, sh, sx, sy;
      if(isHorizontal){ sw=Math.floor(sheetW/totalFrames); sh=sheetH; } else { sw=sheetW; sh=Math.floor(sheetH/totalFrames); }
      var f = player.frame||0; if(f<0) f=0; if(f>=totalFrames) f=totalFrames-1;
      if(isHorizontal){ sx=Math.floor(f*sw); sy=0; } else { sx=0; sy=Math.floor(f*sh); }
      var frameRatio=sw/sh; var animScale=cfg.scale||1.0;
      var scaleX = (cfg.scaleX!=null? cfg.scaleX : (cfg.width!=null? cfg.width : animScale));
      var scaleY = (cfg.scaleY!=null? cfg.scaleY : (cfg.height!=null? cfg.height : animScale));
      var targetW, targetH;
      if(anim==='idle'){ targetW = Math.round(100 * sc * scaleX); targetH = Math.round(110 * sc * scaleY); }
      else if(anim==='walk'){ targetW = Math.round(65 * sc * scaleX); targetH = Math.round(110 * sc * scaleY); }
      else if(anim==='jump'){ targetW = Math.round(105 * sc * scaleX); targetH = Math.round(125 * sc * scaleY); }
      else if(anim==='punch'){ targetW = Math.round(110 * sc * scaleX); targetH = Math.round(125 * sc * scaleY); }
      else if(anim==='kick'){ targetW = Math.round(130 * sc * scaleX); targetH = Math.round(130 * sc * scaleY); }
      else if(anim==='punch_air'){ targetW = Math.round(100 * sc * scaleX); targetH = Math.round(110 * sc * scaleY); }
      else if(anim==='kick_air'){ targetW = Math.round(110 * sc * scaleX); targetH = Math.round(115 * sc * scaleY); }
      else if(anim==='ice' || anim==='ice_charge'){ targetW = Math.round(170 * sc * scaleX); targetH = Math.round(130 * sc * scaleY); }
      else if(anim==='ice_shot' || anim==='ice_shoot'){ targetW = Math.round(125 * sc * scaleX); targetH = Math.round(130 * sc * scaleY); }
      else { var baseW=baseDrawWidth*animScale; targetW=Math.round(baseW*sc); targetH=Math.round(targetW/frameRatio); }
      var maxH=baseDrawHeight*sc*2.5, maxW=baseDrawWidth*sc*2.5; var minH=baseDrawHeight*sc*0.3, minW=baseDrawWidth*sc*0.3;
      if(targetH>maxH){ targetH=Math.round(maxH); targetW=Math.round(targetH*frameRatio); }
      if(targetW>maxW){ targetW=Math.round(maxW); targetH=Math.round(targetW/frameRatio); }
      if(targetH<minH){ targetH=Math.round(minH); targetW=Math.round(targetH*frameRatio); }
      if(targetW<minW){ targetW=Math.round(minW); targetH=Math.round(targetW/frameRatio); }
      var baseX=Math.round(player.x-camera.x); var drawX=baseX-Math.round(targetW/2); var anchorOffset=(cfg.anchorY||0) * sc; var jumpOff=Math.round(player.jumpOffset||0); var drawY=Math.round(playerLaneY-targetH+10+anchorOffset+jumpOff);
      ctx.save(); ctx.imageSmoothingEnabled=false;
      if(!player.facingRight){ ctx.scale(-1,1); ctx.drawImage(sprite, sx,sy,sw,sh, -drawX-targetW, drawY, targetW, targetH); } else { ctx.drawImage(sprite, sx,sy,sw,sh, drawX, drawY, targetW, targetH); }
      ctx.restore(); return;
    }catch(e){ console.log('sprite draw error',e); }
  }
  var w=Math.round(baseDrawWidth*sc), h=Math.round(baseDrawHeight*sc); var x=Math.round(player.x-camera.x)-Math.round(w/2); var y=Math.round(playerLaneY-h+10); var grad=ctx.createLinearGradient(x,y,x,y+h); grad.addColorStop(0,'#7ef0ff'); grad.addColorStop(1,'#0e7490'); ctx.fillStyle=grad; ctx.fillRect(x,y,w,h); ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(x+6,y+6, w-12, 10); ctx.fillStyle='#000'; ctx.font='bold 8px monospace'; ctx.fillText('SUB-ZERO', x+4, y+28); ctx.fillStyle='rgba(126,240,255,0.4)'; ctx.fillRect(x,y+h, w, 3);
}


function loop(time){
  try{
    requestAnimationFrame(loop);
    if(currentState!=='PLAYING') return;
    if(isPaused) return;
    
    // --- FISICA SALTO ---
    if(!player.grounded){
      player.vy+=GRAVITY;
      player.jumpOffset+=player.vy;
      if(player.jumpOffset>=0){
        player.jumpOffset=0; player.vy=0; player.grounded=true; player.landingTimer=180;
      }
    } else if(player.landingTimer>0){ player.landingTimer-=16; }

    // --- PUNCH & KICK RESET FALLBACK ---
    if(player.isPunching){
      if(!player.punchTimer) player.punchTimer=0;
      player.punchTimer+=16;
      if(player.punchTimer>400){
        player.isPunching=false;
        player.anim='idle';
        player.frame=0;
        player.punchTimer=0;
        player.attackHit=false;
      }
    } else { player.punchTimer=0; }
    if(player.isKicking){
      if(!player.kickTimer) player.kickTimer=0;
      player.kickTimer+=16;
      if(player.kickTimer>450){
        player.isKicking=false;
        player.anim='idle';
        player.frame=0;
        player.kickTimer=0;
        player.kickHit=false;
      }
    } else { player.kickTimer=0; }

    // --- ICE CHARGE LOGIC v2.10: bloquea caminata mientras carga, libera al disparar ---
    if(player.isShootingIce){
      player.shootIceTimer+=16;
      if(player.shootIceTimer>450){
        player.isShootingIce=false;
        player.anim='idle';
        player.shootIceTimer=0;
      }
    }
    if(player.isChargingIce){
      player.iceChargeTimer+=16;
      var _sc=(1-((laneBottom-playerLaneY)/Math.max(1,laneBottom-laneTop))*0.12)*PLAYER_SCALE;
      if(attachedIce){
        attachedIce.x=player.x+(player.facingRight?29:-29)*_sc; // FINAL 29 espejado
        attachedIce.y=playerLaneY-62*_sc + (player.jumpOffset||0); // v2.14 FIX: esfera SOBRE sprite, respeta scale 0.7 y ancho 170
        attachedIce.chargeProgress=Math.min(1, player.iceChargeTimer/ICE_CHARGE_TIME);
      }
      if(player.iceChargeTimer>=ICE_CHARGE_TIME){
        player.isChargingIce=false;
        player.isIceLoaded=true;
        if(attachedIce){
          attachedIce.charging=false;
          attachedIce.chargeProgress=1;
          attachedIce.life=5000;
          attachedIce.holdTimer=0;
        }
        spawnText(player.x,playerLaneY-30,'¡HIELO CARGADO!','#7ef0ff');
        setTimeout(function(){ if(player.isIceLoaded && attachedIce){ fireIceProjectile(); } }, 200);
      }
    }
    if(player.isIceLoaded && attachedIce){
      attachedIce.holdTimer+=16;
      var _sc2=(1-((laneBottom-playerLaneY)/Math.max(1,laneBottom-laneTop))*0.12)*PLAYER_SCALE;
      attachedIce.x=player.x+(player.facingRight?40:-40)*_sc2; // FINAL X=40
      attachedIce.y=playerLaneY - 18 + (player.jumpOffset||0); // FINAL Y=18
      if(attachedIce.holdTimer>=ICE_HOLD_MAX){ fireIceProjectile(); }
    }

    var moving=false;
    var iceBlocking = player.isChargingIce || player.isIceLoaded;
    if(!iceBlocking){
      if(keys.right){ player.x+=player.speed; player.facingRight=true; moving=true; }
      if(keys.left){ player.x-=player.speed; player.facingRight=false; moving=true; }
      if(player.grounded){
        if(keys.up){ playerLaneY=Math.max(laneTop,playerLaneY-player.speed*0.6); moving=true; }
        if(keys.down){ playerLaneY=Math.min(laneBottom,playerLaneY+player.speed*0.6); moving=true; }
      }
    }
    if(player.anim==='punch_air' || player.anim==='kick_air'){
      // mantener animaciones aéreas ya establecidas por tryPunch/tryKick
    } else if(player.isShootingIce){ player.anim='ice_shoot'; }
    else if(player.isChargingIce || player.isIceLoaded){ player.anim='ice_charge'; }
    else if(player.isPunching){ player.anim='punch'; }
    else if(player.isKicking){ player.anim='kick'; }
    else if(!player.grounded){ player.anim='jump'; }
    else if(player.landingTimer>0){ player.anim='jump'; }
    else if(moving){ player.anim='walk'; } else { player.anim='idle'; }
    // up/down ya manejado arriba con walk anim
    if(player.x<20) player.x=20;
    if(player.x>camera.worldWidth-60) player.x=camera.worldWidth-60;
    
    updateCamera();
    // Sistema de oleadas con avance
    // Auto-limpiar muertos
    for(var ei=enemies.length-1; ei>=0; ei--){
      if(enemies[ei].dead){
        if(!enemies[ei].deadTimer) enemies[ei].deadTimer=0;
        enemies[ei].deadTimer+=16;
        if(enemies[ei].deadTimer>1000){
          enemies.splice(ei,1);
        }
      }
    }

    if(!bossSpawned && getAliveCount()===0 && enemiesDefeated < LEVELS[currentLevel].enemyCount){
      if(!waitingForAdvance){
        // Primera vez que limpia, prepara flecha
        prepareNextWaveAdvance();
        spawnTimer=0;
      } else {
        // Esperando que el jugador avance
        showWaveArrow(true, 'AVANZA - OLEADA '+(currentWave+1)+'/'+totalWaves+' ➡️');
        // Si el jugador avanzo lo suficiente, spawnea
        if(player.x >= nextWaveTriggerX - 80){
          spawnWave();
          spawnTimer=0;
        }
      }
    } else if(getAliveCount()>0){
      // Hay enemigos, oculta flecha y resetea espera
      showWaveArrow(false);
      waitingForAdvance=false;
      spawnTimer=0;
    }

    if(!bossSpawned && enemiesDefeated>=LEVELS[currentLevel].enemyCount && getAliveCount()===0){ spawnBoss(); }
    
    // Projectiles
    for(var i=projectiles.length-1;i>=0;i--){
      var p=projectiles[i]; p.x+=p.vx; p.life-=16;
      if(p.life<=0){ projectiles.splice(i,1); continue; }
      var hit=false;
      for(var ei=0;ei<enemies.length;ei++){
        var e=enemies[ei]; if(e.dead) continue;
        if(Math.abs(p.y-e.laneY)<50 && Math.abs(p.x-e.x)<60){ e.frozen=3500; e.health-=10; spawnText(e.x,e.laneY-20,'CONGELADO','#7ef0ff'); hit=true; if(e.health<=0){ e.dead=true; enemiesDefeated++; score+=100; } break; }
      }
      if(!hit && boss && !boss.dead){ if(Math.abs(p.y-boss.laneY)<60 && Math.abs(p.x-boss.x)<70){ boss.frozen=2500; boss.health-=8; hit=true; if(boss.health<=0){ boss.dead=true; score+=500; } } }
      if(hit){ projectiles.splice(i,1); continue; }
      if(p.x<camera.x-100 || p.x>camera.x+canvas.width+100) projectiles.splice(i,1);
    }
    
    for(var ei=0;ei<enemies.length;ei++){
      var en=enemies[ei]; if(en.frozen>0){ en.frozen-=16; continue; } if(en.dead) continue;
      var dx=player.x-en.x; var dy=playerLaneY-en.laneY; var d=Math.sqrt(dx*dx+dy*dy);
      if(d>50){ en.x+=(dx/d)*en.speed*0.8; en.laneY+=(dy/d)*en.speed*0.4; }
      if(Math.abs(dx)<44 && Math.abs(dy)<30){ player.health-=0.12; }
    }
    if(boss && !boss.dead && boss.frozen<=0){
      var dx=player.x-boss.x; var dy=playerLaneY-boss.laneY; var d=Math.sqrt(dx*dx+dy*dy);
      if(d>70){ boss.x+=(dx/d)*0.8; boss.laneY+=(dy/d)*0.4; }
      if(Math.abs(dx)<60 && Math.abs(dy)<40){ player.health-=0.25; }
    }
    if(boss && boss.frozen>0) boss.frozen-=16;
    
    if(attachedIce && !player.isChargingIce && !player.isIceLoaded){ attachedIce.life-=16; if(attachedIce.life<=0) attachedIce=null; }
    
    // Dibujo
    var lvl=LEVELS[currentLevel];
    ctx.fillStyle='rgb('+lvl.bgColor[0]+','+lvl.bgColor[1]+','+lvl.bgColor[2]+')'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgb('+lvl.groundColor[0]+','+lvl.groundColor[1]+','+lvl.groundColor[2]+')'; ctx.fillRect(0,laneTop,canvas.width,canvas.height-laneTop);
    // Grid suelo celeste oscuro
    ctx.strokeStyle='rgba(126,240,255,0.05)'; for(var i=0;i<canvas.width;i+=90){ var sx=(i-(camera.x%90)); ctx.beginPath(); ctx.moveTo(sx,laneTop); ctx.lineTo(sx-15,canvas.height); ctx.stroke(); }
    // Progreso
    var prog=camera.x/Math.max(1,camera.worldWidth-canvas.width); ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(canvas.width*0.22,8,canvas.width*0.56,4); ctx.fillStyle='#7ef0ff'; ctx.fillRect(canvas.width*0.22,8,canvas.width*0.56*prog,4);
    
    for(var ei=0;ei<enemies.length;ei++){
      var e=enemies[ei]; if(e.dead) continue;
      var ex=Math.round(e.x-camera.x); if(ex<-80||ex>canvas.width+80) continue;
      ctx.fillStyle=e.frozen>0?'#7ef0ff':e.color; ctx.fillRect(ex, e.laneY-40, e.width, e.height);
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(ex, e.laneY-46, e.width, 3); ctx.fillStyle=e.frozen>0?'#7ef0ff':'#ff4444'; ctx.fillRect(ex, e.laneY-46, e.width*(e.health/e.maxHealth), 3);
    }
    if(boss && !boss.dead){
      var bx=Math.round(boss.x-camera.x);
      ctx.fillStyle=boss.frozen>0?'#7ef0ff':boss.color; ctx.fillRect(bx, boss.laneY-60, boss.width, boss.height);
      ctx.fillStyle='#fff'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.fillText(boss.name.toUpperCase(), bx+boss.width/2, boss.laneY-70); ctx.textAlign='left';
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(bx, boss.laneY-66, boss.width, 4); ctx.fillStyle='#ffd700'; ctx.fillRect(bx, boss.laneY-66, boss.width*(boss.health/boss.maxHealth), 4);
    }
    for(var pi=0;pi<projectiles.length;pi++){
      var p=projectiles[pi]; if(p.type!=='ice') continue;
      var psx=Math.round(p.x-camera.x);
      var grad=ctx.createRadialGradient(psx-3, p.y-3, 2, psx, p.y, 24);
      grad.addColorStop(0,'#fff'); grad.addColorStop(0.4,'#7ef0ff'); grad.addColorStop(1,'#0e7490');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(psx,p.y,24,0,Math.PI*2); ctx.fill();
    }
    
    drawPlayer(time);

    // v2.19 FINAL - Bola CHICA 13px sobre manos - scale 0.6 - Y10 X29 / Y18 X40
    if(attachedIce){
      var asx=Math.round(attachedIce.x-camera.x);
      var prog = attachedIce.chargeProgress!=null ? attachedIce.chargeProgress : 1;
      var r = attachedIce.charging ? (8 + prog*5) : 13;
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(asx, attachedIce.y + r*0.5, r*0.6, r*0.25, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      var g2=ctx.createRadialGradient(asx-2, attachedIce.y-2, 1, asx, attachedIce.y, r);
      if(attachedIce.charging){
        g2.addColorStop(0,'#ffffff'); g2.addColorStop(0.3,'#c8f5ff'); g2.addColorStop(0.55,'#7ef0ff'); g2.addColorStop(0.85,'#2ea8b0'); g2.addColorStop(1,'rgba(10,92,92,0.3)');
      } else {
        g2.addColorStop(0,'#fff'); g2.addColorStop(0.4,'#a0f0ff'); g2.addColorStop(0.7,'#4ecca3'); g2.addColorStop(1,'#0a5c5c');
      }
      ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.shadowColor='#7ef0ff'; ctx.shadowBlur=8; ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(asx,attachedIce.y,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(asx - r*0.25, attachedIce.y - r*0.25, r*0.22, 0, Math.PI*2); ctx.fill(); ctx.restore();
      if(attachedIce.charging){ ctx.strokeStyle='rgba(126,240,255,0.85)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(asx,attachedIce.y,r+3, -Math.PI/2, -Math.PI/2 + Math.PI*2*prog); ctx.stroke(); }
    }
    
    for(var fi=floatingTexts.length-1;fi>=0;fi--){
      var ft=floatingTexts[fi]; ft.timer+=16; ft.y+=ft.vy;
      ctx.fillStyle=ft.color; ctx.font='bold 12px sans-serif'; ctx.fillText(ft.text, ft.x-camera.x, ft.y);
      if(ft.timer>=ft.life) floatingTexts.splice(fi,1);
    }
    
    ctx.fillStyle='#7ef0ff'; ctx.font='bold 12px monospace'; ctx.fillText('NIVEL '+(currentLevel+1)+' - '+lvl.name, 14, 26);
    ctx.fillStyle='rgba(126,240,255,0.5)'; ctx.font='10px monospace'; ctx.fillText('Sprites: '+(Object.values(spriteStatus).filter(function(s){return s==='ok'}).length)+'/'+Object.keys(spriteStatus).length+' OK', 14, 42);
    
    try{
      document.getElementById('hud-health').textContent=Math.round(player.health)+'%';
      document.getElementById('health-bar').style.width=player.health+'%';
      document.getElementById('hud-level').textContent=(currentLevel+1)+'/'+LEVELS.length;
      document.getElementById('hud-progress').textContent=Math.round(prog*100)+'%';
      document.getElementById('hud-enemies').textContent=enemiesDefeated+'/'+LEVELS[currentLevel].enemyCount;
      document.getElementById('hud-score').textContent=score+' pts';
    }catch(e){}
    
    if(player.health<=0){ currentState='MENU'; showMenu('main'); player.health=100; }
    if(boss && boss.dead){ spawnText(boss.x,boss.laneY-30,'VICTORIA!','#ffd700'); setTimeout(function(){ if(currentLevel<LEVELS.length-1){ currentLevel++; startLevel(currentLevel); } else { currentState='MENU'; showMenu('main'); } }, 1500); boss=null; }
    
  }catch(err){
    console.error(err);
    var c2=document.getElementById('gameCanvas');
    if(c2){ var ctxE=c2.getContext('2d'); ctxE.fillStyle='#1a0000'; ctxE.fillRect(0,0,c2.width,c2.height); ctxE.fillStyle='#ff5555'; ctxE.font='12px monospace'; ctxE.fillText('ERROR: '+err.message, 20, 40); }
  }
}

function showMenu(id){
  try{
    document.querySelectorAll('.menu-overlay').forEach(function(m){ m.style.display='none'; });
    var el=document.getElementById('menu-'+id);
    if(el) el.style.display='flex';
    if(id==='main'){
      var hud=document.getElementById('hud'); if(hud) hud.style.display='none';
      var controls=document.getElementById('controls'); if(controls) controls.style.display='none';
    }
    if(id==='sprites') updateSpriteUI();
  }catch(e){}
}
function startLevel(idx){
  try{
    currentLevel=idx; camera.worldWidth=getWorldWidthForLevel(idx);
    camera.x=0; camera.targetX=0; enemies=[]; boss=null; projectiles=[]; enemiesDefeated=0; bossSpawned=false; if(typeof resetWaves==='function') resetWaves(); player.x=120; player.health=100; score=0;
    setupCanvas();
    var lvl=LEVELS[idx];
    document.getElementById('story-title').textContent=lvl.name;
    document.getElementById('story-sub').textContent=lvl.subtitle;
    document.getElementById('story-text').textContent=lvl.story;
    document.getElementById('story-boss').textContent='JEFE: '+lvl.boss+' - '+lvl.bossTitle;
    document.getElementById('story-meta').textContent='Mundo: '+camera.worldWidth+'px • Enemigos: '+lvl.enemyCount+' • Tipos: '+lvl.enemyTypes.join(', ');
    showMenu('story'); setTimeout(function(){ if(typeof spawnWave==='function'){ spawnWave(); } }, 400);
  }catch(e){ alert('Error nivel: '+e.message); }
}
function startGameInit(){
  try{
    setupCanvas();
    if(!laneTop) { laneTop=180; laneBottom=360; playerLaneY=360; }
    currentState='PLAYING'; isPaused=false;
    document.querySelectorAll('.menu-overlay').forEach(function(m){ m.style.display='none'; });
    var hud=document.getElementById('hud'); if(hud) hud.style.display='flex';
    var controls=document.getElementById('controls'); if(controls) controls.style.display='flex';
    if(!gameLoopStarted){ gameLoopStarted=true; lastAnimTime=performance.now(); requestAnimationFrame(loop); }
  }catch(e){ alert('Error inicio: '+e.message); }
}
function forceStartGame(){ try{ currentState='PLAYING'; isPaused=false; document.querySelectorAll('.menu-overlay').forEach(function(m){ m.style.display='none'; }); document.getElementById('hud').style.display='flex'; document.getElementById('controls').style.display='flex'; if(!gameLoopStarted){ gameLoopStarted=true; requestAnimationFrame(loop); } }catch(e){} }
function pauseGame(){ if(currentState!=='PLAYING') return; isPaused=true; showMenu('pause'); document.getElementById('controls').style.display='none'; }
function resumeGame(){ isPaused=false; document.querySelectorAll('.menu-overlay').forEach(function(m){ m.style.display='none'; }); document.getElementById('hud').style.display='flex'; document.getElementById('controls').style.display='flex'; lastAnimTime=performance.now(); }
function saveGameState(){ try{ var data={v:GAME_VERSION,level:currentLevel,score:score,health:player.health,ts:Date.now()}; localStorage.setItem('sz_save_v177',JSON.stringify(data)); var fb=document.getElementById('save-feedback'); if(fb){ fb.textContent='✔ Guardado Nivel '+(currentLevel+1); fb.style.opacity='1'; setTimeout(function(){ fb.style.opacity='0'; },2000); } }catch(e){} }
function exitToMenu(){ currentState='MENU'; isPaused=false; showMenu('main'); document.getElementById('hud').style.display='none'; document.getElementById('controls').style.display='none'; enemies=[]; boss=null; projectiles=[]; attachedIce=null; if(typeof resetWaves==='function') resetWaves(); }
function showHowToPlay(){ showMenu('howtoplay'); }
function checkUpdate(){ var el=document.getElementById('update-result'); var vb=document.getElementById('version-badge'); if(vb) vb.textContent='v'+GAME_VERSION;  if(!el) return; el.textContent='v'+GAME_VERSION+' CELESTE DARK\nSingle file • Sprites configurables\n'+Object.keys(spriteStatus).length+' sprites • '+Object.values(spriteStatus).filter(function(s){return s==='ok'}).length+' OK\n\nTodo en index.html, sin dependencias\nIce: ice_charge.png 1F + ice_shoot.png 1F'; }

function bindKeys(id,dir){
  var el=document.getElementById(id); if(!el) return;
  var down=function(){ keys[dir]=true; }; var up=function(){ keys[dir]=false; };
  el.addEventListener('touchstart',function(e){ e.preventDefault(); down(); },{passive:false});
  el.addEventListener('touchend',function(e){ e.preventDefault(); up(); },{passive:false});
  el.addEventListener('mousedown',down); el.addEventListener('mouseup',up); el.addEventListener('mouseleave',up);
}
bindKeys('btn-up','up'); bindKeys('btn-down','down'); bindKeys('btn-left','left'); bindKeys('btn-right','right');
// MENU BUTTONS - addEventListener (replaces inline onclick)
document.addEventListener('DOMContentLoaded', function(){
  var btnPlay = document.getElementById('btn-play');
  if(btnPlay) btnPlay.addEventListener('click', function(){ startLevel(0); });

  var btnLevels = document.getElementById('btn-levels');
  if(btnLevels) btnLevels.addEventListener('click', function(){ showMenu('levels'); });

  var btnHow = document.getElementById('btn-how');
  if(btnHow) btnHow.addEventListener('click', function(){ showHowToPlay(); });

  var btnUpdate = document.getElementById('btn-update');
  if(btnUpdate) btnUpdate.addEventListener('click', function(){ showMenu('update'); });
});

document.getElementById('btn-ice').addEventListener('click',function(){ tryIce(); });
var bp=document.getElementById('btn-punch');
if(bp){
  var doPunch=function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } tryPunch(); };
  bp.addEventListener('touchstart', doPunch, {passive:false});
  bp.addEventListener('mousedown', doPunch);
  bp.addEventListener('click', doPunch);
}
var bk=document.getElementById('btn-kick');
if(bk){
  var doKick=function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } tryKick(); };
  bk.addEventListener('touchstart', doKick, {passive:false});
  bk.addEventListener('mousedown', doKick);
  bk.addEventListener('click', doKick);
}
var bj=document.getElementById('btn-jump');
function handleJump(e){ e.preventDefault(); tryJump(); }
bj.addEventListener('touchstart', handleJump, {passive:false});
bj.addEventListener('mousedown', handleJump);
bj.addEventListener('click',function(e){ e.preventDefault(); tryJump(); });
document.addEventListener('keydown',function(e){ if((e.code==='KeyJ' || e.key==='j' || e.key==='J') && !e.repeat){ e.preventDefault(); tryPunch(); return; }
  if((e.code==='KeyK' || e.key==='k' || e.key==='K') && !e.repeat){ e.preventDefault(); tryKick(); return; }

  if(e.key==='d'||e.key==='ArrowRight') keys.right=true;
  if(e.key==='a'||e.key==='ArrowLeft') keys.left=true;
  if(e.key==='w'||e.key==='ArrowUp') keys.up=true;
  if(e.key==='s'||e.key==='ArrowDown') keys.down=true;
  if(e.key==='j'||e.key==='J'){ player.anim='punch'; player.frame=0; setTimeout(function(){ player.anim='idle'; },300); }
  if(e.key==='k'||e.key==='K'){ player.anim='kick'; player.frame=0; setTimeout(function(){ player.anim='idle'; },350); }
  if(e.key==='i'||e.key==='I'){ tryIce(); }
  if(e.code==='Space'){ tryJump(); }
});
document.addEventListener('keyup',function(e){
  if(e.key==='d'||e.key==='ArrowRight') keys.right=false;
  if(e.key==='a'||e.key==='ArrowLeft') keys.left=false;
  if(e.key==='w'||e.key==='ArrowUp') keys.up=false;
  if(e.key==='s'||e.key==='ArrowDown') keys.down=false;
});

var grid=document.getElementById('level-grid');
LEVELS.forEach(function(lvl,i){
  var b=document.createElement('button'); b.className='btn-premium'; b.style.textAlign='left';
  b.innerHTML='<div style="font-weight:800;color:#7ef0ff">'+(i+1)+'. '+lvl.name+'</div><div style="font-size:9px;opacity:0.55;margin-top:3px">'+lvl.subtitle+' • Jefe: '+lvl.boss+'</div>';
  b.onclick=function(){ startLevel(i); };
  grid.appendChild(b);
});

window.addEventListener('resize',function(){ if(currentState==='PLAYING'){ try{ setupCanvas(); }catch(e){} } });
try{ setupCanvas(); }catch(e){}
try{ showMenu('main'); }catch(e){}

// Exponer globales
document.addEventListener('DOMContentLoaded', function(){ try{ var vb=document.getElementById('version-badge'); if(vb) vb.textContent='v'+GAME_VERSION; var bn=document.getElementById('build-num'); if(bn) bn.textContent='BUILD '+GAME_VERSION; document.title="Sub-Zero's v"+GAME_VERSION+" - bola sobre sprite FIX + scale 0.7"; }catch(e){} });
window.showMenu=showMenu; window.startLevel=startLevel; window.startGameInit=startGameInit; window.forceStartGame=forceStartGame;
window.pauseGame=pauseGame; window.resumeGame=resumeGame; window.saveGameState=saveGameState; window.exitToMenu=exitToMenu;
window.showHowToPlay=showHowToPlay; window.checkUpdate=checkUpdate;

// FIX v2.14c - Botones menu habilitados + scale 0.7 garantizado
(function(){
  function enableMenuButtons(){
    try{
      var ids = ['btn-play','btn-levels','btn-how','btn-update'];
      ids.forEach(function(id){
        var el = document.getElementById(id);
        if(el){
          el.style.pointerEvents='auto';
          el.style.cursor='pointer';
          el.disabled=false;
        }
      });
      document.querySelectorAll('.menu-overlay').forEach(function(m){
        m.style.pointerEvents='auto';
      });
      document.querySelectorAll('.btn-premium').forEach(function(b){
        b.style.pointerEvents='auto';
        b.style.cursor='pointer';
      });
    }catch(e){}
  }
  // Ejecutar al cargar y cada vez que se muestra un menu
  document.addEventListener('DOMContentLoaded', enableMenuButtons);
  setTimeout(enableMenuButtons, 100);
  setTimeout(enableMenuButtons, 500);
  setTimeout(enableMenuButtons, 1500);
  var _origShowMenu = window.showMenu;
  window.showMenu = function(id){
    try{ _origShowMenu(id); }catch(e){ 
      // fallback si _origShowMenu no existe aun
      document.querySelectorAll('.menu-overlay').forEach(function(m){ m.style.display='none'; });
      var el=document.getElementById('menu-'+id);
      if(el) el.style.display='flex';
    }
    enableMenuButtons();
  };
  // Fix explicito para botones principales por si onclick inline falla
  document.addEventListener('DOMContentLoaded', function(){
    var bp=document.getElementById('btn-play');
    if(bp) bp.addEventListener('click', function(){ startLevel(0); });
    var bl=document.getElementById('btn-levels');
    if(bl) bl.addEventListener('click', function(){ showMenu('levels'); });
    var bh=document.getElementById('btn-how');
    if(bh) bh.addEventListener('click', function(){ showHowToPlay(); });
    var bu=document.getElementById('btn-update');
    if(bu) bu.addEventListener('click', function(){ showMenu('update'); });
  });
})();


// ============================================================
// BOTONES - addEventListener (reemplaza onclick inline)
// ============================================================
document.addEventListener('DOMContentLoaded', function(){
  // MENU PRINCIPAL
  var btnPlay = document.getElementById('btn-play');
  if(btnPlay) btnPlay.addEventListener('click', function(){ startLevel(0); });

  var btnLevels = document.getElementById('btn-levels');
  if(btnLevels) btnLevels.addEventListener('click', function(){ showMenu('levels'); });

  var btnHow = document.getElementById('btn-how');
  if(btnHow) btnHow.addEventListener('click', function(){ showHowToPlay(); });

  var btnUpdate = document.getElementById('btn-update');
  if(btnUpdate) btnUpdate.addEventListener('click', function(){ showMenu('update'); });

  // MENU STORY
  var btnStartGame = document.querySelector('#menu-story .btn-premium');
  if(btnStartGame) btnStartGame.addEventListener('click', function(){ startGameInit(); });

  // MENU PAUSE
  var btnResume = document.querySelector('#menu-pause .btn-premium');
  if(btnResume) btnResume.addEventListener('click', function(){ resumeGame(); });

  var btnSave = document.querySelectorAll('#menu-pause .btn-premium')[1];
  if(btnSave) btnSave.addEventListener('click', function(){ saveGameState(); });

  var btnExit = document.querySelectorAll('#menu-pause .btn-premium')[2];
  if(btnExit) btnExit.addEventListener('click', function(){ exitToMenu(); });

  // MENU LEVELS - botón VOLVER
  var btnBackLevels = document.querySelector('#menu-levels .btn-premium');
  if(btnBackLevels) btnBackLevels.addEventListener('click', function(){ showMenu('main'); });

  // MENU HOWTOPLAY - botón VOLVER
  var btnBackHow = document.querySelector('#menu-howtoplay .btn-premium');
  if(btnBackHow) btnBackHow.addEventListener('click', function(){ showMenu('main'); });

  // MENU UPDATE - botón VOLVER
  var btnBackUpdate = document.querySelector('#menu-update .btn-premium');
  if(btnBackUpdate) btnBackUpdate.addEventListener('click', function(){ showMenu('main'); });

  // MENU STORY - botón VOLVER A NIVELES
  var btnBackStory = document.querySelectorAll('#menu-story .btn-premium')[1];
  if(btnBackStory) btnBackStory.addEventListener('click', function(){ showMenu('levels'); });

  // LIVE EDITOR
  var btnOpenLive = document.getElementById('btn-open-live');
  if(btnOpenLive) btnOpenLive.addEventListener('click', function(){ toggleLiveEditor(); });

  var btnLock = document.getElementById('btn-lock');
  if(btnLock) btnLock.addEventListener('click', function(){ toggleLock(); });

  var btnCloseLive = document.getElementById('btn-live-close');
  if(btnCloseLive) btnCloseLive.addEventListener('click', function(){ toggleLiveEditor(); });

  // LIVE EDITOR CONTROLES - FIXED (sin onclick, usando IDs)
  var btnLiveLeft = document.getElementById('btn-live-left');
  if(btnLiveLeft) btnLiveLeft.addEventListener('click', function(){ moveLive('left'); });

  var btnLiveRight = document.getElementById('btn-live-right');
  if(btnLiveRight) btnLiveRight.addEventListener('click', function(){ moveLive('right'); });

  var btnLivePunch = document.getElementById('btn-live-punch');
  if(btnLivePunch) btnLivePunch.addEventListener('click', function(){ tryPunch(); });

  var btnLiveKick = document.getElementById('btn-live-kick');
  if(btnLiveKick) btnLiveKick.addEventListener('click', function(){ tryKick(); });

  var btnLiveIce = document.getElementById('btn-live-ice');
  if(btnLiveIce) btnLiveIce.addEventListener('click', function(){ tryIce(); });

  var btnLiveJump = document.getElementById('btn-live-jump');
  if(btnLiveJump) btnLiveJump.addEventListener('click', function(){ tryJump(); });

  var btnSave = document.getElementById('btn-live-save');
  if(btnSave) btnSave.addEventListener('click', function(){ saveSpriteConfig(false); });

  var btnReset = document.getElementById('btn-live-reset');
  if(btnReset) btnReset.addEventListener('click', function(){ resetSpriteConfig(); });

  var btnExport = document.getElementById('btn-live-export');
  if(btnExport) btnExport.addEventListener('click', function(){ exportLiveConfig(); });

  var btnCopy = document.getElementById('btn-live-copy');
  if(btnCopy) btnCopy.addEventListener('click', function(){ copyLiveConfig(); });

  // Fallback extra por si quedan botones sin ID (por texto)
  if(!btnLiveLeft){
    document.querySelectorAll('#live-editor .btn-live').forEach(function(b){
      var t=b.textContent.trim();
      if(t.includes('IZQ')) b.addEventListener('click', function(){ moveLive('left'); });
      if(t.includes('DER')) b.addEventListener('click', function(){ moveLive('right'); });
    });
  }

  // SPRITES MENU - botones de escala
  var scaleButtons = document.querySelectorAll('#menu-sprites .btn-premium');
  scaleButtons.forEach(function(btn){
    if(btn.textContent.indexOf('Pequeño') !== -1){
      btn.addEventListener('click', function(){ PLAYER_SCALE=1.2; baseDrawWidth=70; baseDrawHeight=85; });
    } else if(btn.textContent.indexOf('Normal') !== -1){
      btn.addEventListener('click', function(){ PLAYER_SCALE=1.8; baseDrawWidth=90; baseDrawHeight=110; });
    } else if(btn.textContent.indexOf('Grande') !== -1){
      btn.addEventListener('click', function(){ PLAYER_SCALE=2.2; baseDrawWidth=110; baseDrawHeight=135; });
    } else if(btn.textContent.indexOf('Gigante') !== -1){
      btn.addEventListener('click', function(){ PLAYER_SCALE=2.6; baseDrawWidth=130; baseDrawHeight=160; });
    } else if(btn.textContent.indexOf('VOLVER') !== -1){
      btn.addEventListener('click', function(){ showMenu('main'); });
    }
  });
});
