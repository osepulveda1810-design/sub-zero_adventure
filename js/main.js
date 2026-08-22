// ============================================================
// MAIN - Variables de estado, bucle principal y eventos
// ============================================================

// --- VARIABLES LOCALES (usando window para las globales) ---
let canvas, ctx;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando...');

    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ Canvas no encontrado!');
        return;
    }
    ctx = canvas.getContext('2d');
    window.canvas = canvas;
    window.ctx = ctx;

    // Asegurar player
    ensurePlayer();

    // Configurar canvas
    setupCanvas();

    // Inicializar sprites
    if (typeof initSprites === 'function') initSprites();

    // Configurar eventos
    setupEventListeners();

    // Mostrar menú
    showMenu('main');
    populateLevelGrid();

    // Iniciar nieve
    setTimeout(() => {
        const mainMenu = document.getElementById('menu-main');
        if (mainMenu && mainMenu.style.display !== 'none') {
            initWinterMenu();
        }
    }, 300);

    // Cargar configuraciones guardadas
    if (typeof loadCtrlCfg === 'function') loadCtrlCfg();
    if (typeof loadControlsOpacity === 'function') loadControlsOpacity();
    refreshContinueButton();

    // **Reinicializar el análogo para que use window.keys**
    setupAnalogControls();

    console.log('✅ Inicialización completa.');
});

// --- FUNCIÓN PARA REINICIALIZAR EL ANÁLOGO ---
function setupAnalogControls() {
    const base = document.getElementById('analog-base');
    const stick = document.getElementById('analog-stick');
    if (!base || !stick) {
        console.warn('⚠️ Elementos del análogo no encontrados');
        return;
    }

    let center = { x: 0, y: 0 };
    let active = false;
    const maxDist = 28;
    let vector = { x: 0, y: 0 };

    function getCenter() {
        const rect = base.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function setKeysFromVector(v) {
        window.keys.left = v.x < -0.25;
        window.keys.right = v.x > 0.25;
        window.keys.up = v.y < -0.25;
        window.keys.down = v.y > 0.25;
    }

    function start(e) {
        e.preventDefault();
        active = true;
        base.classList.add('active');
        center = getCenter();
        update(e);
    }

    function update(e) {
        if (!active) return;
        let clientX, clientY;
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let dx = clientX - center.x;
        let dy = clientY - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            const ang = Math.atan2(dy, dx);
            dx = Math.cos(ang) * maxDist;
            dy = Math.sin(ang) * maxDist;
        }
        stick.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
        vector.x = dx / maxDist;
        vector.y = dy / maxDist;
        setKeysFromVector(vector);
    }

    function end() {
        active = false;
        base.classList.remove('active');
        stick.style.transform = 'translate(-50%, -50%)';
        vector.x = 0;
        vector.y = 0;
        setKeysFromVector(vector);
    }

    // Remover eventos antiguos y agregar nuevos
    base.removeEventListener('touchstart', start);
    base.removeEventListener('touchmove', update);
    base.removeEventListener('touchend', end);
    base.addEventListener('touchstart', start, { passive: false });
    base.addEventListener('touchmove', update, { passive: false });
    base.addEventListener('touchend', end, { passive: false });
    console.log('✅ Análogo reinicializado con window.keys');
}

// --- FUNCIÓN PARA INICIALIZAR PLAYER ---
function ensurePlayer() {
    if (!window.player) {
        console.warn('⚠️ player no estaba definido, inicializando...');
        window.player = {
            x: 120,
            y: 0,
            width: HITBOX_W || 44,
            height: HITBOX_H || 96,
            speed: 5.0,
            facingRight: true,
            health: 100,
            maxHealth: 100,
            anim: 'idle',
            frame: 0,
            frameTime: 0,
            scale: 1.8,
            jumpOffset: 0,
            vy: 0,
            grounded: true,
            landingTimer: 0,
            isPunching: false,
            punchTimer: 0,
            attackHit: false,
            isKicking: false,
            kickTimer: 0,
            kickHit: false,
            hurtFlash: 0,
            isIceAttacking: false,
            iceAttackTimer: 0,
            iceShotFired: false,
            iceTarget: null
        };
        console.log('✅ player inicializado');
    }
    // Sincronizar referencia local
    window.player = window.player;
    return window.player;
}

// --- FUNCIONES AUXILIARES ---
function getWorldWidthForLevel(i) {
    return i === 0 ? 3600 : 4800;
}

function playerEffY() {
    return window.playerLaneY + (window.player ? window.player.jumpOffset || 0 : 0);
}

// --- CONFIGURACIÓN DEL CANVAS ---
function setupCanvas() {
    try {
        const wrapper = document.getElementById('canvas-wrapper');
        const w = wrapper.clientWidth || window.innerWidth;
        const h = wrapper.clientHeight || window.innerHeight - 62;
        canvas.width = w;
        canvas.height = h;
        window.camera.worldWidth = getWorldWidthForLevel(window.currentLevel);

        const baseBottom = h - 90;
        const baseTop = Math.max(120, baseBottom - 200);
        const oldTop = window.laneTop,
            oldBottom = window.laneBottom;

        if (typeof window.FLOOR_REF_OFFSET !== 'undefined') {
            window.laneTop = baseTop + window.TOP_LIMIT_OFFSET;
            window.laneBottom = Math.floor(h * window.LANE_BOTTOM_RATIO);
        } else {
            window.laneTop = baseTop;
            window.laneBottom = Math.floor(h * window.LANE_BOTTOM_RATIO);
        }

        const clampY = function(y) {
            return Math.max(window.laneTop, Math.min(window.laneBottom, y));
        };

        if (typeof oldTop === 'number' && typeof oldBottom === 'number' && oldBottom > oldTop && window.laneBottom > window.laneTop) {
            const rescaleY = function(y) {
                return clampY(window.laneTop + (y - oldTop) * (window.laneBottom - window.laneTop) / (oldBottom - oldTop));
            };
            window.playerLaneY = rescaleY(window.playerLaneY);
            for (let i = 0; i < window.enemies.length; i++) window.enemies[i].laneY = rescaleY(window.enemies[i].laneY);
            for (let c = 0; c < window.crates.length; c++) window.crates[c].laneY = rescaleY(window.crates[c].laneY);
            for (let p = 0; p < window.pickups.length; p++) window.pickups[p].laneY = rescaleY(window.pickups[p].laneY);
            if (window.boss && !window.boss.dead) window.boss.laneY = rescaleY(window.boss.laneY);
        } else {
            window.playerLaneY = window.laneBottom;
        }

        if (window.camera.x > window.camera.worldWidth - w) window.camera.x = Math.max(0, window.camera.worldWidth - w);
        console.log('✅ Canvas configurado:', canvas.width, 'x', canvas.height);
        console.log('laneTop:', window.laneTop, 'laneBottom:', window.laneBottom, 'playerLaneY:', window.playerLaneY);
    } catch (e) {
        console.error('Error en setupCanvas:', e);
    }
}

// --- FUNCIONES DE NIEVE (simplificadas) ---
function initWinterMenu() {
    // ... (misma que antes, pero usando window)
    // Por brevedad, no la repito aquí, pero debe estar incluida en tu main.js original.
    // Si no la tienes, la añadimos después.
}

function stopWinterMenu() {
    // ...
}

// --- FLECHA DE AVANCE ---
function drawWinterArrow(t) { /* ... */ }
function showWaveArrow(show, text) { /* ... */ }

// --- POBLAR NIVELES ---
function populateLevelGrid() {
    // ... (misma que antes)
}

// --- CÁMARA ---
function updateCamera() {
    if (!window.player) return;
    const cw = canvas.width;
    window.camera.targetX = window.player.x - cw * 0.50;
    window.camera.x += (window.camera.targetX - window.camera.x) * 0.35;
    window.camera.x = Math.max(0, Math.min(window.camera.x, window.camera.worldWidth - cw));
    if (window.camera.shake > 0) window.camera.shake -= 16;
}

// --- BUCLE PRINCIPAL (CORREGIDO) ---
function loop(time) {
    requestAnimationFrame(loop);

    if (window.currentState !== 'PLAYING') {
        window.lastFrameTime = time;
        return;
    }
    if (window.isPaused) {
        window.lastFrameTime = time;
        return;
    }

    const rawDt = time - window.lastFrameTime;
    window.lastFrameTime = time;
    if (!(rawDt > 0)) return;
    if (rawDt > 50) rawDt = 50;
    window.frameDt = rawDt * window.GAME_SPEED;

    try {
        // --- ACTUALIZACIÓN ---
        ensurePlayer();

        // Física
        if (typeof updatePlayerPhysics === 'function') {
            updatePlayerPhysics();
        }

        // Actualizar jugador (animaciones, combate)
        if (typeof updatePlayer === 'function') {
            updatePlayer();
        }

        // Cámara
        updateCamera();

        // Enemigos
        if (typeof updateEnemies === 'function') {
            updateEnemies();
        }

        // Jefe
        if (typeof updateBoss === 'function') {
            updateBoss();
        }

        // Proyectiles
        if (typeof updateProjectiles === 'function') {
            updateProjectiles();
        }

        // Partículas
        if (typeof updateParticles === 'function') {
            updateParticles();
        }

        // Cajas
        if (typeof updateCrates === 'function') {
            updateCrates();
        }

        // Pickups
        if (typeof updatePickups === 'function') {
            updatePickups();
        }

        // --- SISTEMA DE OLEADAS (simplificado) ---
        if (typeof getAliveCount === 'function') {
            if (!window.bossSpawned && getAliveCount() === 0 && window.enemiesDefeated < LEVELS[window.currentLevel].enemyCount) {
                if (!window.waitingForAdvance) {
                    if (typeof prepareNextWaveAdvance === 'function') prepareNextWaveAdvance();
                } else {
                    showWaveArrow(true, 'AVANZA - OLEADA ' + (window.currentWave + 1) + '/' + window.totalWaves + ' ➡️');
                    if (window.player.x >= window.nextWaveTriggerX - 20) {
                        if (typeof spawnWave === 'function') spawnWave();
                    }
                }
            } else if (getAliveCount() > 0) {
                showWaveArrow(false);
                window.waitingForAdvance = false;
            }
        }

        if (!window.bossSpawned && window.enemiesDefeated >= LEVELS[window.currentLevel].enemyCount) {
            if (typeof getAliveCount === 'function' && getAliveCount() === 0) {
                if (typeof spawnBoss === 'function') spawnBoss();
            }
        }

        // Game Over
        if (window.player.health <= 0 && window.currentState === 'PLAYING') {
            window.currentState = 'GAMEOVER';
            window.isPaused = true;
            try { showWaveArrow(false); } catch (e) {}
            document.getElementById('hud').style.display = 'none';
            document.getElementById('controls').style.display = 'none';
            document.getElementById('btn-pause').style.display = 'none';
            try {
                document.getElementById('gameover-score').textContent = 'SCORE FINAL: ' + window.score + ' pts';
            } catch (e) {}
            showMenu('gameover');
        }

        // Victoria
        if (window.boss && window.boss.dead) {
            if (typeof spawnText === 'function') {
                spawnText(window.boss.x, window.boss.laneY - 30, 'VICTORIA!', '#ffd700');
            }
            setTimeout(function() {
                if (window.currentLevel < LEVELS.length - 1) {
                    window.currentLevel++;
                    startLevel(window.currentLevel);
                } else {
                    window.currentState = 'MENU';
                    showMenu('main');
                }
            }, 1500);
            window.boss = null;
        }

        // --- RENDERIZADO ---
        renderFrame();

    } catch (e) {
        console.error('Error en loop:', e);
        // Mostrar error en canvas
        if (ctx) {
            ctx.fillStyle = '#ff0000';
            ctx.font = '20px monospace';
            ctx.fillText('ERROR: ' + e.message, 20, 40);
        }
    }
}

// --- RENDERIZADO (con fallbacks) ---
function renderFrame() {
    if (!ctx) {
        console.error('ctx es null');
        return;
    }

    const lvl = LEVELS[window.currentLevel];
    if (!lvl) {
        console.error('Nivel no encontrado:', window.currentLevel);
        return;
    }

    // Limpiar canvas
    ctx.fillStyle = 'rgb(' + lvl.bgColor[0] + ',' + lvl.bgColor[1] + ',' + lvl.bgColor[2] + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fondo
    if (typeof drawLevelBackground === 'function') {
        drawLevelBackground(lvl);
    } else {
        // Fallback: dibujar suelo y líneas de calle
        ctx.fillStyle = '#1a2440';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2a3a5a';
        ctx.fillRect(0, window.laneTop, canvas.width, canvas.height - window.laneTop);
        // Líneas de calle
        ctx.strokeStyle = 'rgba(255,220,90,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 15]);
        for (let i = 0; i < canvas.width; i += 60) {
            const x = (i - (window.camera.x * 0.5 % 60));
            ctx.beginPath();
            ctx.moveTo(x, window.laneTop + (window.laneBottom - window.laneTop) * 0.5);
            ctx.lineTo(x + 30, window.laneTop + (window.laneBottom - window.laneTop) * 0.5);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        // Línea del suelo
        ctx.strokeStyle = '#7ef0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, window.laneBottom);
        ctx.lineTo(canvas.width, window.laneBottom);
        ctx.stroke();
    }

    // Dibujar objetos por profundidad
    try {
        const drawList = [];
        if (window.player) {
            drawList.push({ type: 'player', y: window.playerLaneY || window.laneBottom, obj: window.player });
        }
        for (let i = 0; i < window.enemies.length; i++) {
            const e = window.enemies[i];
            if (e.dead) continue;
            drawList.push({ type: 'enemy', y: e.laneY || 0, obj: e });
        }
        if (window.boss && !window.boss.dead) {
            drawList.push({ type: 'boss', y: window.boss.laneY || 0, obj: window.boss });
        }
        drawList.sort((a, b) => a.y - b.y);

        for (let i = 0; i < drawList.length; i++) {
            const d = drawList[i];
            if (d.type === 'player') {
                if (typeof drawPlayer === 'function') {
                    drawPlayer(performance.now());
                } else {
                    // Fallback: dibujar rectángulo verde
                    ctx.fillStyle = '#4ecca3';
                    ctx.fillRect(window.player.x - window.camera.x - 20, playerEffY() - 60, 40, 60);
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px monospace';
                    ctx.fillText('PLAYER', window.player.x - window.camera.x - 20, playerEffY() - 70);
                }
            } else if (d.type === 'enemy') {
                if (typeof drawEnemy === 'function') {
                    drawEnemy(d.obj);
                } else {
                    const ex = d.obj.x - window.camera.x;
                    ctx.fillStyle = '#ff4444';
                    ctx.fillRect(ex - 20, d.obj.laneY - 40, 40, 40);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px monospace';
                    ctx.fillText('ENEMY', ex - 20, d.obj.laneY - 50);
                }
            } else if (d.type === 'boss') {
                if (typeof drawBossSprite === 'function') {
                    drawBossSprite(d.obj);
                } else {
                    const bx = d.obj.x - window.camera.x;
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(bx - 30, d.obj.laneY - 60, 60, 60);
                    ctx.fillStyle = '#fff';
                    ctx.font = '14px monospace';
                    ctx.fillText('BOSS', bx - 20, d.obj.laneY - 70);
                }
            }
        }
    } catch (err) {
        console.error('Error renderizando objetos:', err);
    }

    // Proyectiles (fallback)
    for (let i = 0; i < window.projectiles.length; i++) {
        const p = window.projectiles[i];
        if (p.type !== 'ice') continue;
        const sx = p.x - window.camera.x;
        ctx.fillStyle = '#7ef0ff';
        ctx.beginPath();
        ctx.arc(sx, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // Efectos de hielo (fallback)
    for (let i = 0; i < window.iceTrails.length; i++) {
        const tr = window.iceTrails[i];
        const tdx = tr.x - window.camera.x;
        ctx.fillStyle = 'rgba(126,240,255,0.5)';
        ctx.beginPath();
        ctx.arc(tdx, tr.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < window.iceShatters.length; i++) {
        const sh = window.iceShatters[i];
        const sdx = sh.x - window.camera.x;
        ctx.fillStyle = 'rgba(165,243,255,0.6)';
        ctx.fillRect(sdx - 4, sh.y - 4, 8, 8);
    }

    // Textos flotantes
    for (let i = window.floatingTexts.length - 1; i >= 0; i--) {
        const ft = window.floatingTexts[i];
        ft.timer += 16;
        ft.y += ft.vy;
        ctx.fillStyle = ft.color || '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(ft.text, ft.x - window.camera.x, ft.y);
        if (ft.timer >= ft.life) window.floatingTexts.splice(i, 1);
    }

    // Información en pantalla
    ctx.fillStyle = '#7ef0ff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('NIVEL ' + (window.currentLevel + 1) + ' - ' + lvl.name, 14, 26);
    ctx.fillStyle = 'rgba(126,240,255,0.5)';
    ctx.font = '10px monospace';
    const okCount = window.spriteStatus ? Object.values(window.spriteStatus).filter(s => s === 'ok').length : 0;
    ctx.fillText('Sprites: ' + okCount + '/' + (window.spriteStatus ? Object.keys(window.spriteStatus).length : 0) + ' OK', 14, 42);

    // Indicador de teclas (depuración)
    ctx.fillStyle = '#ffff00';
    ctx.font = '10px monospace';
    ctx.fillText('Keys: R=' + (window.keys.right ? '✓' : '✗') + ' L=' + (window.keys.left ? '✓' : '✗') + ' U=' + (window.keys.up ? '✓' : '✗') + ' D=' + (window.keys.down ? '✓' : '✗'), canvas.width - 220, 20);

    // HUD
    if (typeof drawHUD === 'function') {
        drawHUD();
    } else {
        try {
            document.getElementById('hud-health').textContent = Math.round(window.player.health) + '%';
            document.getElementById('health-bar').style.width = window.player.health + '%';
            document.getElementById('hud-level').textContent = window.currentLevel + '/' + (LEVELS.length - 1);
            document.getElementById('hud-progress').textContent = '0%';
            document.getElementById('hud-enemies').textContent = window.enemiesDefeated + '/' + LEVELS[window.currentLevel].enemyCount;
            document.getElementById('hud-score').textContent = window.score + ' pts';
        } catch (e) {}
    }
}

// --- FUNCIONES DE ESTADO DEL JUEGO ---
function startLevel(idx) {
    try {
        ensurePlayer();

        window.currentLevel = idx;
        window.camera.worldWidth = getWorldWidthForLevel(idx);
        window.camera.x = 0;
        window.camera.targetX = 0;

        window.enemies = [];
        window.boss = null;
        window.projectiles = [];
        window.iceTrails = [];
        window.iceShatters = [];
        window.frostDecals = [];
        window.crates = [];
        window.bossProjectiles = [];
        window.pickups = [];
        window.floatingTexts = [];
        window.enemiesDefeated = 0;
        window.bossSpawned = false;
        window.currentWave = 0;
        window.waitingForAdvance = false;
        showWaveArrow(false);
        if (typeof resetWaves === 'function') resetWaves();

        window.player.x = 120;
        window.player.health = 100;
        window.score = 0;

        setupCanvas();

        const lvl = LEVELS[idx];
        document.getElementById('story-title').textContent = lvl.name;
        document.getElementById('story-sub').textContent = lvl.subtitle;
        document.getElementById('story-text').textContent = lvl.story;
        document.getElementById('story-boss').textContent = 'JEFE: ' + lvl.boss + ' - ' + lvl.bossTitle;
        document.getElementById('story-meta').textContent = 'Mundo: ' + window.camera.worldWidth + 'px • Enemigos: ' + lvl.enemyCount + ' • Tipos: ' + lvl.enemyTypes.join(', ');

        showMenu('story');
        setTimeout(function() {
            if (typeof spawnWave === 'function') {
                console.log('🔄 Llamando a spawnWave desde startLevel');
                spawnWave();
            }
        }, 400);

        updateLiveButtonVisibility();

        const bo = document.getElementById('btn-editor-open');
        const isEd = !!(LEVELS[window.currentLevel] && LEVELS[window.currentLevel].isEditor);
        if (bo) bo.style.display = isEd ? 'block' : 'none';
        if (isEd) {
            setTimeout(() => {
                if (typeof openLiveEditor === 'function') openLiveEditor();
                const btn = document.getElementById('btn-open-live');
                if (btn) btn.style.display = 'block';
            }, 300);
        } else {
            if (typeof closeLiveEditor === 'function') closeLiveEditor();
        }

        if (!window.gameLoopStarted && window.currentState === 'PLAYING') {
            window.gameLoopStarted = true;
            window.lastFrameTime = performance.now();
            requestAnimationFrame(loop);
            console.log('🚀 Bucle iniciado desde startLevel');
        }
    } catch (e) {
        alert('Error nivel: ' + e.message);
        console.error(e);
    }
}

function startGameInit() {
    try {
        ensurePlayer();
        setupCanvas();
        if (!window.laneTop) {
            window.laneTop = 180;
            window.laneBottom = 360;
            window.playerLaneY = 360;
        }
        window.currentState = 'PLAYING';
        window.isPaused = false;

        document.querySelectorAll('.menu-overlay').forEach(function(m) {
            m.style.display = 'none';
        });

        document.getElementById('hud').style.display = 'flex';
        document.getElementById('top-bar').style.display = 'none';
        document.getElementById('btn-pause').style.display = 'block';
        document.getElementById('btn-pause').textContent = '⏸ PAUSA';
        document.getElementById('controls').style.display = 'flex';

        if (!window.gameLoopStarted) {
            window.gameLoopStarted = true;
            window.lastFrameTime = performance.now();
            requestAnimationFrame(loop);
            console.log('🚀 Bucle iniciado desde startGameInit');
        }
    } catch (e) {
        alert('Error inicio: ' + e.message);
        console.error(e);
    }
}

// --- FUNCIONES DE MENÚ ---
function showMenu(id) {
    try {
        document.querySelectorAll('.menu-overlay').forEach(function(m) {
            m.style.display = 'none';
        });
        const el = document.getElementById('menu-' + id);
        if (el) el.style.display = 'flex';
        if (id === 'main') {
            document.getElementById('hud').style.display = 'none';
            document.getElementById('btn-pause').style.display = 'none';
            document.getElementById('controls').style.display = 'none';
            if (typeof initWinterMenu === 'function' && !window.menuSnowRunning) {
                setTimeout(initWinterMenu, 100);
            }
        }
        if (id === 'sprites') {
            if (typeof updateSpriteUI === 'function') updateSpriteUI();
        }
        if (id === 'levels') populateLevelGrid();
    } catch (e) {
        console.error('Error en showMenu:', e);
    }
}

function showPauseOverlay() {
    // ...
}

function hideOverlays() {
    // ...
}

function exitToMenu() {
    // ...
}

function showHowToPlay() {
    // ...
}

function refreshContinueButton() {
    // ...
}

function updateLiveButtonVisibility() {
    // ...
}

// --- EXPORTAR FUNCIONES GLOBALES ---
window.ensurePlayer = ensurePlayer;
window.startLevel = startLevel;
window.startGameInit = startGameInit;
window.showMenu = showMenu;
window.showHowToPlay = showHowToPlay;
window.exitToMenu = exitToMenu;
window.saveGameState = saveGameState;
window.refreshContinueButton = refreshContinueButton;
window.populateLevelGrid = populateLevelGrid;
window.setupCanvas = setupCanvas;
window.loop = loop;
window.updateCamera = updateCamera;

console.log('✅ main.js cargado correctamente');