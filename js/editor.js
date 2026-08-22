// ============================================================
// EDITOR EN VIVO - Edición de sprites y controles (SOLO FUNCIONES)
// ============================================================

let liveEditorOpen = false;
let isLocked = false;
let currentEditChar = 'player';
let dummyEnemy = null;

// --- EDITOR DE SPRITES ---
function buildLiveEditor() {
    try {
        populateEditorSelector();
        const list = document.getElementById('live-list');
        if (!list) return;
        list.innerHTML = '';
        
        const cfgSet = currentEditChar === 'player' ? SPRITE_CONFIG : spriteConfigFor(currentEditChar);
        if (!cfgSet) return;
        
        if (currentEditChar !== 'player') {
            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = 'background:rgba(0,0,0,0.3);border-radius:8px;padding:8px;margin-bottom:10px;font-size:10px;color:#7ef0ff;';
            const es = enemySprites[currentEditChar] || {};
            const est = enemyStatus[currentEditChar] || {};
            let okCount = 0, totalCount = 0;
            const statusLines = [];
            Object.keys(cfgSet).forEach(k => {
                totalCount++;
                const st = est[k] || 'loading';
                if (st === 'ok') okCount++;
                const color = st === 'ok' ? '#4ecca3' : st === 'fail' ? '#ff4444' : '#facc15';
                statusLines.push('<span style="color:' + color + '">● ' + k + ': ' + st + '</span>');
            });
            statusDiv.innerHTML = '<div style="font-weight:800;margin-bottom:4px">SPRITE STATUS: ' + okCount + '/' + totalCount + ' OK</div><div style="display:flex;flex-wrap:wrap;gap:6px">' + statusLines.join(' ') + '</div>';
            list.appendChild(statusDiv);
        }
        
        if (currentEditChar === 'player') {
            const iceDiv = buildIceEditor();
            if (iceDiv) list.appendChild(iceDiv);
        }
        
        const order = ['idle', 'walk', 'punch', 'kick', 'hit', 'jump', 'ice_attack', 'punch_air', 'kick_air', 'frozen', 'dead'];
        const keys = Object.keys(cfgSet).sort((a, b) => {
            let ia = order.indexOf(a), ib = order.indexOf(b);
            if (ia === -1) ia = 999;
            if (ib === -1) ib = 999;
            return ia - ib;
        });
        
        keys.forEach(k => {
            const cfg = cfgSet[k];
            if (!cfg) return;
            const div = document.createElement('div');
            div.className = 'live-item';
            div.dataset.anim = k;
            const sx = cfg.scaleX != null ? cfg.scaleX : (cfg.scale || 1);
            const sy = cfg.scaleY != null ? cfg.scaleY : (cfg.scale || 1);
            const ax = cfg.anchorX || 0;
            const ay = cfg.anchorY || 0;
            const frames = cfg.frames || 1;
            
            div.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <div style="display:flex;align-items:center;gap:8px">
                        <b style="color:#7ef0ff;font-size:11px">${k.toUpperCase()}</b>
                        <span style="font-size:8px;background:rgba(126,240,255,0.15);color:#7ef0ff;padding:2px 6px;border-radius:10px">${frames}F</span>
                        <span style="font-size:8px;opacity:0.4">${cfg.file || ''}</span>
                    </div>
                    <button class="btn-live-sm" onclick="previewAnim('${k}')" style="background:rgba(126,240,255,0.25);color:#7ef0ff;font-weight:800">▶ PROBAR</button>
                </div>
                <div class="live-control">
                    <label>ANCHO</label>
                    <input type="range" min="0.05" max="4" step="0.05" value="${sx}" oninput="onLiveWH('${k}','w',this.value,this)">
                    <input type="number" value="${sx.toFixed(2)}" step="0.05" oninput="onLiveWHNumber('${k}','w',this.value,this)">
                </div>
                <div class="live-control">
                    <label>ALTO</label>
                    <input type="range" min="0.05" max="4" step="0.05" value="${sy}" oninput="onLiveWH('${k}','h',this.value,this)">
                    <input type="number" value="${sy.toFixed(2)}" step="0.05" oninput="onLiveWHNumber('${k}','h',this.value,this)">
                </div>
                <div class="live-control">
                    <label>X</label>
                    <input type="range" min="-80" max="80" step="1" value="${ax}" oninput="onLiveX('${k}',this.value,this)">
                    <input type="number" value="${ax}" oninput="onLiveXNumber('${k}',this.value,this)">
                </div>
                <div class="live-control">
                    <label>Y</label>
                    <input type="range" min="-80" max="180" step="1" value="${ay}" oninput="onLiveY('${k}',this.value,this)">
                    <input type="number" value="${ay}" oninput="onLiveYNumber('${k}',this.value,this)">
                </div>
            `;
            list.appendChild(div);
        });
    } catch (e) {
        console.error('Error en buildLiveEditor:', e);
    }
}

// --- EDITOR DE LA BOLA DE HIELO ---
function buildIceEditor() {
    try {
        if (currentEditChar !== 'player') return null;
        const div = document.createElement('div');
        div.className = 'live-item';
        div.style.border = '1px solid rgba(126,240,255,0.3)';
        
        const la = (typeof ICE_ALIGN !== 'undefined' && ICE_ALIGN.loaded) ? ICE_ALIGN.loaded : { x: 15.1725, y: -105.4, scale: 1 };
        const rad = (typeof ICE_ALIGN !== 'undefined' && ICE_ALIGN.ballRadius) ? ICE_ALIGN.ballRadius : 14;
        
        div.innerHTML = `
            <div style="font-size:11px;font-weight:900;color:#7ef0ff;margin-bottom:10px">❄️ POSICIÓN DE LA BOLA (al lanzar)</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.5);margin-bottom:8px">Ajusta dónde aparece la bola en el frame de lanzamiento (frame 2)</div>
            <div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:6px;margin-bottom:8px">
                <div class="live-control">
                    <label>X</label>
                    <input type="range" min="-40" max="60" step="1" value="${la.x}" oninput="onIceAlign('loaded','x',this.value,this)">
                    <input type="number" value="${la.x}" oninput="onIceAlign('loaded','x',this.value,this)">
                </div>
                <div class="live-control">
                    <label>Y</label>
                    <input type="range" min="-150" max="50" step="1" value="${la.y}" oninput="onIceAlign('loaded','y',this.value,this)">
                    <input type="number" value="${la.y}" oninput="onIceAlign('loaded','y',this.value,this)">
                </div>
            </div>
            <div class="live-control">
                <label>RADIO BOLA</label>
                <input type="range" min="5" max="30" step="1" value="${rad}" oninput="onIceRadius(this.value,this)">
                <input type="number" value="${rad}" oninput="onIceRadius(this.value,this)">
            </div>
            <div style="display:flex;gap:6px;margin-top:8px">
                <button class="btn-live-sm" onclick="tryIce()" style="flex:1">❄️ PROBAR HIELO</button>
                <button class="btn-live-sm" onclick="exportIceAlign()" style="flex:1">📋 EXPORT ICE</button>
            </div>
        `;
        return div;
    } catch (e) {
        console.error('Error en buildIceEditor:', e);
        return null;
    }
}

// --- FUNCIONES DEL EDITOR ---
function populateEditorSelector() {
    try {
        const sel = document.getElementById('editor-char-select');
        if (!sel) return;
        const currentVal = sel.value || currentEditChar || 'player';
        const tipos = (typeof ENEMY_SPRITE_CONFIG !== 'undefined') ? Object.keys(ENEMY_SPRITE_CONFIG) : [];
        sel.innerHTML = '<option value="player">PLAYER - Sub-Zero</option>';
        tipos.sort().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = 'ENEMIGO - ' + t.toUpperCase();
            sel.appendChild(opt);
        });
        try {
            const optK = document.createElement('option');
            optK.value = 'kano';
            optK.textContent = 'JEFE - KANO';
            sel.appendChild(optK);
        } catch (e) {}
        if (currentVal) sel.value = currentVal;
    } catch (e) {
        console.error('Error en populateEditorSelector:', e);
    }
}

function changeCharacter(c) {
    currentEditChar = c;
    const sel = document.getElementById('editor-char-select');
    if (sel) sel.value = c;
    
    if (dummyEnemy) {
        const idx = enemies.indexOf(dummyEnemy);
        if (idx >= 0) enemies.splice(idx, 1);
        try { dummyEnemy.dead = true; } catch (e) {}
        dummyEnemy = null;
    }
    enemies = [];
    
    if (c === 'player') {
        if (player) {
            player.x = (camera ? camera.x : 0) + canvas.width / 2 - 100;
            playerLaneY = (laneTop + laneBottom) / 2;
        }
        buildLiveEditor();
        return;
    }
    
    const cx = canvas.width / 2 + (camera ? camera.x : 0);
    const cy = (laneTop + laneBottom) / 2;
    
    if (c === 'kano') {
        try {
            dummyEnemy = createBoss('Kano', cx, cy);
            if (dummyEnemy) {
                dummyEnemy.health = 9999;
                dummyEnemy.maxHealth = 9999;
                dummyEnemy.isDummy = true;
                dummyEnemy.type = 'kano';
                dummyEnemy.laneY = cy;
                dummyEnemy.x = cx;
                dummyEnemy.isMoving = false;
                dummyEnemy.attacking = false;
                dummyEnemy.frozen = 0;
                dummyEnemy.previewAnim = null;
                dummyEnemy.facingRight = false;
                dummyEnemy.frame = 0;
                dummyEnemy.frameTime = 0;
                dummyEnemy.attackTimer = 0;
                dummyEnemy.anim = 'idle';
                enemies = [dummyEnemy];
            }
        } catch (e) { console.error(e); }
        buildLiveEditor();
        return;
    }
    
    if (typeof createEnemy === 'function') {
        try {
            dummyEnemy = createEnemy(c, cx, cy);
            if (dummyEnemy) {
                dummyEnemy.health = 9999;
                dummyEnemy.maxHealth = 9999;
                dummyEnemy.isDummy = true;
                dummyEnemy.laneY = cy;
                dummyEnemy.x = cx;
                dummyEnemy.isMoving = false;
                dummyEnemy.attacking = false;
                dummyEnemy.frozen = 0;
                dummyEnemy.previewAnim = null;
                dummyEnemy.facingRight = false;
                dummyEnemy.frame = 0;
                dummyEnemy.frameTime = 0;
                dummyEnemy.attackTimer = 0;
                enemies = [dummyEnemy];
            }
        } catch (e) { console.error(e); }
    }
    buildLiveEditor();
}

function previewAnim(anim) {
    if (currentEditChar === 'player') {
        if (!player) return;
        player.anim = anim;
        player.frame = 0;
        player.frameTime = 0;
        if (anim === 'punch') {
            player.isPunching = true;
            player.punchTimer = 0;
        }
        if (anim === 'kick') {
            player.isKicking = true;
            player.kickTimer = 0;
        }
        if (anim === 'jump') {
            player.grounded = false;
            player.vy = -12;
        }
        if (anim === 'ice_attack') {
            player.isIceAttacking = true;
            player.iceAttackTimer = 0;
            player.iceShotFired = false;
        }
    } else {
        if (!dummyEnemy) return;
        dummyEnemy.previewAnim = anim;
        dummyEnemy.previewTimer = 900;
        dummyEnemy.frame = 0;
        dummyEnemy.frameTime = 0;
        if (anim === 'walk') {
            dummyEnemy.isMoving = true;
            dummyEnemy.attacking = false;
        } else if (anim === 'punch' || anim === 'kick') {
            dummyEnemy.attacking = true;
            dummyEnemy.isMoving = false;
            dummyEnemy.attackTimer = 0;
        } else if (anim === 'hit') {
            dummyEnemy.hitTimer = 90;
        } else if (anim === 'frozen') {
            dummyEnemy.frozen = 900;
        } else if (anim === 'idle') {
            dummyEnemy.isMoving = false;
            dummyEnemy.attacking = false;
            dummyEnemy.hitTimer = 0;
            dummyEnemy.frozen = 0;
        }
    }
}

// --- FUNCIONES DE EDICIÓN DE SPRITES ---
function onLiveWH(k, wh, v, el) {
    if (isLocked) return;
    const cfg = currentEditChar === 'player' ? SPRITE_CONFIG[k] : (spriteConfigFor(currentEditChar) || {})[k];
    if (!cfg) return;
    v = parseFloat(v);
    if (wh === 'w') cfg.scaleX = v;
    else cfg.scaleY = v;
    try {
        if (el) {
            const parent = el.parentElement;
            const num = parent.querySelector('input[type="number"]');
            if (num) num.value = v.toFixed(2);
        }
    } catch (e) {}
}

function onLiveWHNumber(k, wh, v, el) {
    if (isLocked) return;
    const cfg = currentEditChar === 'player' ? SPRITE_CONFIG[k] : (spriteConfigFor(currentEditChar) || {})[k];
    if (!cfg) return;
    v = parseFloat(v);
    if (wh === 'w') cfg.scaleX = v;
    else cfg.scaleY = v;
    try {
        if (el) {
            const parent = el.parentElement;
            const range = parent.querySelector('input[type="range"]');
            if (range) range.value = v;
        }
    } catch (e) {}
}

function onLiveX(k, v, el) {
    if (isLocked) return;
    const cfg = currentEditChar === 'player' ? SPRITE_CONFIG[k] : (spriteConfigFor(currentEditChar) || {})[k];
    if (!cfg) return;
    cfg.anchorX = parseInt(v);
    try {
        if (el) {
            const parent = el.parentElement;
            const num = parent.querySelector('input[type="number"]');
            if (num) num.value = v;
        }
    } catch (e) {}
}

function onLiveXNumber(k, v, el) {
    if (isLocked) return;
    const cfg = currentEditChar === 'player' ? SPRITE_CONFIG[k] : (spriteConfigFor(currentEditChar) || {})[k];
    if (!cfg) return;
    cfg.anchorX = parseInt(v);
    try {
        if (el) {
            const parent = el.parentElement;
            const range = parent.querySelector('input[type="range"]');
            if (range) range.value = v;
        }
    } catch (e) {}
}

function onLiveY(k, v, el) {
    if (isLocked) return;
    const cfg = currentEditChar === 'player' ? SPRITE_CONFIG[k] : (spriteConfigFor(currentEditChar) || {})[k];
    if (!cfg) return;
    cfg.anchorY = parseInt(v);
    try {
        if (el) {
            const parent = el.parentElement;
            const num = parent.querySelector('input[type="number"]');
            if (num) num.value = v;
        }
    } catch (e) {}
}

function onLiveYNumber(k, v, el) {
    if (isLocked) return;
    const cfg = currentEditChar === 'player' ? SPRITE_CONFIG[k] : (spriteConfigFor(currentEditChar) || {})[k];
    if (!cfg) return;
    cfg.anchorY = parseInt(v);
    try {
        if (el) {
            const parent = el.parentElement;
            const range = parent.querySelector('input[type="range"]');
            if (range) range.value = v;
        }
    } catch (e) {}
}

// --- FUNCIONES DE EDICIÓN DE HIELO ---
function onIceAlign(mode, axis, v, el) {
    try {
        v = parseInt(v);
        if (typeof ICE_ALIGN === 'undefined') window.ICE_ALIGN = { loaded: { x: 15.1725, y: -105.4, scale: 1 }, ballRadius: 14 };
        if (!ICE_ALIGN[mode]) ICE_ALIGN[mode] = { x: 0, y: 0, scale: 1 };
        ICE_ALIGN[mode][axis] = v;
        localStorage.setItem('sz_ice_align', JSON.stringify(ICE_ALIGN));
        if (el) {
            const parent = el.parentElement;
            const num = parent.querySelector('input[type="number"]');
            if (num) num.value = v;
        }
    } catch (e) {}
}

function onIceRadius(v, el) {
    try {
        v = parseInt(v);
        if (typeof ICE_ALIGN === 'undefined') window.ICE_ALIGN = { loaded: { x: 15.1725, y: -105.4, scale: 1 }, ballRadius: 14 };
        ICE_ALIGN.ballRadius = v;
        localStorage.setItem('sz_ice_align', JSON.stringify(ICE_ALIGN));
        if (el) {
            const parent = el.parentElement;
            const num = parent.querySelector('input[type="number"]');
            if (num) num.value = v;
        }
    } catch (e) {}
}

function exportIceAlign() {
    try {
        const lines = [
            'const ICE_ALIGN = {',
            '  loaded: { x: ' + (ICE_ALIGN.loaded.x * (typeof PLAYER_GLOBAL_SCALE !== 'undefined' ? PLAYER_GLOBAL_SCALE : 1)) + ', y: ' + (ICE_ALIGN.loaded.y * (typeof PLAYER_GLOBAL_SCALE !== 'undefined' ? PLAYER_GLOBAL_SCALE : 1)) + ', scale: ' + (ICE_ALIGN.loaded.scale || 1) + ' },',
            '  ballRadius: ' + ICE_ALIGN.ballRadius,
            '};'
        ];
        const a = document.getElementById('live-export');
        if (a) {
            a.style.display = 'block';
            a.textContent = lines.join("\n");
            try {
                navigator.clipboard.writeText(lines.join("\n"));
            } catch (e) {}
            const fb = document.getElementById('sprite-save-feedback');
            if (fb) {
                fb.textContent = '📋 ICE copiado!';
                fb.style.opacity = '1';
                setTimeout(function() {
                    fb.style.opacity = '0';
                    fb.textContent = '✓ Guardado';
                }, 2000);
            }
        }
    } catch (e) {}
}

// --- EXPORTAR E IMPORTAR CONFIGURACIONES ---
function exportLiveConfig() {
    try {
        const char = currentEditChar || 'player';
        const cfgSet = (char === 'player') ? SPRITE_CONFIG : (spriteConfigFor(char) || {});
        const lines = [];
        
        if (char === 'player') {
            lines.push('// PLAYER - Sub-Zero');
            lines.push('player: {');
            Object.keys(cfgSet).forEach(k => {
                const c = cfgSet[k];
                lines.push('  ' + k + ': { file: "' + (c.file || k + '.png') + '", frames: ' + (c.frames || 1) + ', speed: ' + (c.speed || 100) + ', scaleX: ' + ((c.scaleX != null ? c.scaleX : c.scale) || 1).toFixed(2) + ', scaleY: ' + ((c.scaleY != null ? c.scaleY : c.scale) || 1).toFixed(2) + ', anchorX: ' + (c.anchorX || 0) + ', anchorY: ' + (c.anchorY || 0) + ' },');
            });
            lines.push('}');
        } else if (char === 'kano') {
            lines.push('// JEFE - KANO');
            lines.push('// COPIA ESTO COMO KANO_SPRITE_CONFIG');
            lines.push('var KANO_SPRITE_CONFIG={');
            Object.keys(cfgSet).forEach(k => {
                const c = cfgSet[k];
                lines.push('  ' + k + ': { file: \'' + (c.file || k + '.png') + '\', frames: ' + (c.frames || 1) + ', cols: ' + (c.cols || c.frames || 1) + ', speed: ' + (c.speed || 100) + ', scaleX: ' + ((c.scaleX != null ? c.scaleX : c.scale) || 1).toFixed(2) + ', scaleY: ' + ((c.scaleY != null ? c.scaleY : c.scale) || 1).toFixed(2) + ', anchorX: ' + (c.anchorX || 0) + ', anchorY: ' + (c.anchorY || 0) + ' },');
            });
            lines.push('};');
        } else {
            lines.push('// ENEMIGO - ' + char.toUpperCase());
            lines.push(char + ': {');
            Object.keys(cfgSet).forEach(k => {
                const c = cfgSet[k];
                lines.push('  ' + k + ': { file: "' + (c.file || k + '.png') + '", frames: ' + (c.frames || 1) + ', speed: ' + (c.speed || 100) + ', scaleX: ' + ((c.scaleX != null ? c.scaleX : c.scale) || 1).toFixed(2) + ', scaleY: ' + ((c.scaleY != null ? c.scaleY : c.scale) || 1).toFixed(2) + ', anchorX: ' + (c.anchorX || 0) + ', anchorY: ' + (c.anchorY || 0) + ' },');
            });
            lines.push('},');
            lines.push('');
            lines.push('// COPIA ESTO DENTRO DE ENEMY_SPRITE_CONFIG');
        }
        
        const a = document.getElementById('live-export');
        if (a) {
            a.style.display = 'block';
            a.style.whiteSpace = 'pre-wrap';
            a.style.fontSize = '10px';
            a.style.maxHeight = '300px';
            a.textContent = lines.join("\n");
            try {
                navigator.clipboard.writeText(lines.join("\n"));
            } catch (e) {}
        }
    } catch (e) {
        console.error('Error en exportLiveConfig:', e);
    }
}

function saveSpriteConfig() {
    try {
        const char = currentEditChar || 'player';
        const cfgObj = (char === 'player') ? SPRITE_CONFIG : (spriteConfigFor(char) || null);
        if (!cfgObj) return;
        
        if (char === 'kano') {
            localStorage.setItem('kano_sprite_config', JSON.stringify(cfgObj));
        } else if (char === 'player') {
            localStorage.setItem('player_sprite_config', JSON.stringify(cfgObj));
        } else {
            localStorage.setItem('enemy_sprite_config_' + char, JSON.stringify(cfgObj));
            if (ENEMY_SPRITE_CONFIG[char]) ENEMY_SPRITE_CONFIG[char] = cfgObj;
        }
        
        const fb = document.getElementById('sprite-save-feedback');
        if (fb) {
            fb.textContent = '✓ Guardado';
            fb.style.opacity = '1';
            setTimeout(() => { fb.style.opacity = '0'; }, 2000);
        }
    } catch (e) {
        console.error('Error en saveSpriteConfig:', e);
    }
}

function moveLive(d) {
    if (d === 'left') {
        keys.left = true;
        setTimeout(() => keys.left = false, 300);
    }
    if (d === 'right') {
        keys.right = true;
        setTimeout(() => keys.right = false, 300);
    }
}

function toggleLiveEditor() {
    const el = document.getElementById('live-editor');
    const btn = document.getElementById('btn-open-live');
    if (!el) return;
    liveEditorOpen = !liveEditorOpen;
    if (liveEditorOpen) {
        el.classList.add('active');
        el.style.display = 'block';
        try { buildLiveEditor(); } catch (e) {}
        if (btn) btn.textContent = '✕ CERRAR';
    } else {
        el.classList.remove('active');
        el.style.display = 'none';
        if (btn) btn.textContent = '🎚️ EDITOR';
    }
}

function openLiveEditor() {
    const el = document.getElementById('live-editor');
    if (!el) return;
    el.style.display = 'block';
    el.classList.add('active');
    liveEditorOpen = true;
    try { buildLiveEditor(); } catch (e) {}
}

function closeLiveEditor() {
    const el = document.getElementById('live-editor');
    if (!el) return;
    el.style.display = 'none';
    el.classList.remove('active');
    liveEditorOpen = false;
}

function toggleLock() {
    isLocked = !isLocked;
    const lb = document.getElementById('btn-lock');
    if (lb) lb.textContent = isLocked ? '🔒 Bloqueado' : '🔓 Libre';
}

console.log('✅ editor.js cargado');