// ============================================================
// MAIN - Bucle principal, estados del juego, eventos
// ============================================================

// Variables globales del juego
let canvas, ctx;
let camera = { x: 0, targetX: 0, worldWidth: 3500, shake: 0 };
let currentState = 'MENU';
let currentLevel = 0;
let score = 0;
let isPaused = false;
let gameLoopStarted = false;
let lastFrameTime = 0;
let frameDt = 16;
let keys = { right: false, left: false, up: false, down: false };

// Variables de escena
let projectiles = [];
let crates = [];
let pickups = [];
let floatingTexts = [];
let particles = [];
let iceTrails = [];
let iceShatters = [];
let frostDecals = [];
let bossProjectiles = [];
let spawnTimer = 0;

// --- Inicialización ---

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Configurar canvas
    setupCanvas();

    // Inicializar sprites
    initSprites();

    // Configurar eventos
    setupEventListeners();

    // Mostrar menú principal
    showMenu('main');

    // Iniciar menú de nieve
    setTimeout(() => {
        const mainMenu = document.getElementById('menu-main');
        if (mainMenu && mainMenu.style.display !== 'none') {
            initWinterMenu();
        }
    }, 300);

    // Cargar configuración guardada
    loadCtrlCfg();
    loadControlsOpacity();
    refreshContinueButton();
});

// --- Configuración del canvas ---

function setupCanvas() {
    try {
        const wrapper = document.getElementById('canvas-wrapper');
        const w = wrapper.clientWidth || window.innerWidth;
        const h = wrapper.clientHeight || window.innerHeight - 62;
        canvas.width = w;
        canvas.height = h;
        camera.worldWidth = getWorldWidthForLevel(currentLevel);

        const baseBottom = h - 90;
        const baseTop = Math.max(120, baseBottom - 200);
        const oldTop = laneTop, oldBottom = laneBottom;

        if (typeof FLOOR_REF_OFFSET !== 'undefined') {
            laneTop = baseTop + TOP_LIMIT_OFFSET;
            laneBottom = Math.floor(h * LANE_BOTTOM_RATIO);
        } else {
            laneTop = baseTop;
            laneBottom = Math.floor(h * LANE_BOTTOM_RATIO);
        }

        const clampY = function(y) {
            return Math.max(laneTop, Math.min(laneBottom, y));
        };

        if (typeof oldTop === 'number' && typeof oldBottom === 'number' && oldBottom > oldTop && laneBottom > laneTop) {
            const rescaleY = function(y) {
                return clampY(laneTop + (y - oldTop) * (laneBottom - laneTop) / (oldBottom - oldTop));
            };
            playerLaneY = rescaleY(playerLaneY);
            for (let i = 0; i < enemies.length; i++) enemies[i].laneY = rescaleY(enemies[i].laneY);
            for (let c = 0; c < crates.length; c++) crates[c].laneY = rescaleY(crates[c].laneY);
            for (let p = 0; p < pickups.length; p++) pickups[p].laneY = rescaleY(pickups[p].laneY);
            if (boss && !boss.dead) boss.laneY = rescaleY(boss.laneY);
        } else {
            playerLaneY = laneBottom;
        }

        if (camera.x > camera.worldWidth - w) camera.x = Math.max(0, camera.worldWidth - w);
    } catch (e) {
        console.log(e);
    }
}

// --- Eventos ---

function setupEventListeners() {
    // Botones del menú principal
    document.getElementById('btn-play').addEventListener('click', function() {
        startLevel(1);
    });

    document.getElementById('btn-levels').addEventListener('click', function() {
        showMenu('levels');
    });

    document.getElementById('btn-how').addEventListener('click', function() {
        showHowToPlay();
    });

    document.getElementById('btn-settings').addEventListener('click', function() {
        showMenu('settings');
    });

    // Botón de inicio del juego
    document.getElementById('btn-start-game').addEventListener('click', function() {
        startGameInit();
    });

    // Botones de pausa
    document.getElementById('btn-pause').addEventListener('click', function() {
        if (currentState !== 'PLAYING' || isPaused) return;
        isPaused = true;
        showPauseOverlay();
        document.getElementById('btn-pause').textContent = '▶ REANUDAR';
    });

    document.getElementById('btn-resume').addEventListener('click', function() {
        resumeGame();
    });

    document.getElementById('btn-save').addEventListener('click', function() {
        saveGameState();
        const old = document.getElementById('btn-save').textContent;
        document.getElementById('btn-save').textContent = '✔ GUARDADO';
        setTimeout(() => {
            document.getElementById('btn-save').textContent = old;
        }, 1200);
    });

    document.getElementById('btn-exit').addEventListener('click', function() {
        isPaused = false;
        exitToMenu();
    });

    // Botón de continuar partida
    document.getElementById('btn-continue').addEventListener('click', function() {
        try {
            const s = JSON.parse(localStorage.getItem('sz_save_v177'));
            if (!s) return;
            startLevel(s.level || 1);
            score = s.score || 0;
            player.health = (s.health != null) ? s.health : (player.maxHealth || 100);
            enemiesDefeated = s.defeated || 0;
            currentWave = Math.max(0, (s.wave || 1) - 1);
        } catch (e) {}
    });

    // Botones de game over
    document.getElementById('btn-retry').addEventListener('click', function() {
        startLevel(currentLevel);
    });

    document.getElementById('btn-gameover-exit').addEventListener('click', function() {
        exitToMenu();
    });

    // Editor en vivo
    document.getElementById('btn-open-live').addEventListener('click', toggleLiveEditor);
    document.getElementById('btn-editor-close').addEventListener('click', closeLiveEditor);
    document.getElementById('btn-editor-open').addEventListener('click', openLiveEditor);

    // Controles táctiles
    document.getElementById('btn-ice').addEventListener('click', tryIce);
    document.getElementById('btn-punch').addEventListener('click', tryPunch);
    document.getElementById('btn-kick').addEventListener('click', tryKick);
    document.getElementById('btn-jump').addEventListener('click', tryJump);

    // Teclado
    document.addEventListener('keydown', function(e) {
        if ((e.code === 'KeyJ' || e.key === 'j' || e.key === 'J') && !e.repeat) {
            e.preventDefault();
            tryPunch();
            return;
        }
        if ((e.code === 'KeyK' || e.key === 'k' || e.key === 'K') && !e.repeat) {
            e.preventDefault();
            tryKick();
            return;
        }
        if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
        if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'w' || e.key === 'ArrowUp') keys.up = true;
        if (e.key === 's' || e.key === 'ArrowDown') keys.down = true;
        if ((e.key === 'i' || e.key === 'I') && !e.repeat) {
            tryIce();
        }
        if (e.code === 'Space') {
            tryJump();
        }
    });

    document.addEventListener('keyup', function(e) {
        if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
        if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'w' || e.key === 'ArrowUp') keys.up = false;
        if (e.key === 's' || e.key === 'ArrowDown') keys.down = false;
    });

        // Redimensionar
        window.addEventListener('resize', function() {
            if (currentState === 'PLAYING') {
                try { setupCanvas(); } catch (e) {}
            }
        });

        // Target de hielo con click/touch en enemigos
        canvas.addEventListener('click', function(ev) {
            if (!player.isIceAttacking) return;
            const rect = canvas.getBoundingClientRect();
            const sx = ev.clientX - rect.left;
            const sy = ev.clientY - rect.top;
            const worldX = camera.x + sx;
            const worldY = laneTop + (sy / canvas.height) * (laneBottom - laneTop);
            if (selectIceTargetAt(worldX, worldY)) {
                player._manualLock = true;
            }
        });

        canvas.addEventListener('touchstart', function(ev) {
            if (!player.isIceAttacking) return;
            if (ev.touches.length === 0) return;
            const rect = canvas.getBoundingClientRect();
            const t = ev.touches[0];
            const sx = t.clientX - rect.left;
            const sy = t.clientY - rect.top;
            const worldX = camera.x + sx;
            const worldY = laneTop + (sy / canvas.height) * (laneBottom - laneTop);
            if (selectIceTargetAt(worldX, worldY)) {
                player._manualLock = true;
                ev.preventDefault();
            }
        }, { passive: false });
}

// --- Bucle principal ---

function loop(time) {
    requestAnimationFrame(loop);

    if (currentState !== 'PLAYING') {
        lastFrameTime = time;
        return;
    }
    if (isPaused) {
        lastFrameTime = time;
        return;
    }

    const rawDt = time - lastFrameTime;
    lastFrameTime = time;
    if (!(rawDt > 0)) return;
    if (rawDt > 50) rawDt = 50;
    frameDt = rawDt * GAME_SPEED;

    // Actualizar
    update();

    // Renderizar
    render();
}

// --- Actualización ---

function update() {
    // Actualizar física del jugador
    const moving = updatePlayerPhysics();

    // Actualizar animación y combate del jugador
    updatePlayer();

    // Actualizar cámara
    updateCamera();

    // Actualizar enemigos
    updateEnemies();

    // Actualizar jefe
    updateBoss();

    // Actualizar proyectiles
    updateProjectiles();

    // Actualizar partículas y efectos
    updateParticles();

    // Actualizar cajas y pickups
    updateCrates();
    updatePickups();

    // Sistema de oleadas
    if (!bossSpawned && getAliveCount() === 0 && enemiesDefeated < LEVELS[currentLevel].enemyCount) {
        if (!waitingForAdvance) {
            prepareNextWaveAdvance();
            spawnTimer = 0;
        } else {
            showWaveArrow(true, 'AVANZA - OLEADA ' + (currentWave + 1) + '/' + totalWaves + ' ➡️');
            if (player.x >= nextWaveTriggerX - 20) {
                spawnWave();
                spawnTimer = 0;
            }
        }
    } else if (getAliveCount() > 0) {
        showWaveArrow(false);
        waitingForAdvance = false;
        spawnTimer = 0;
    }

    // Spawnear jefe
    if (!bossSpawned && enemiesDefeated >= LEVELS[currentLevel].enemyCount && getAliveCount() === 0) {
        spawnBoss();
    }

    // Game Over
    if (player.health <= 0 && currentState === 'PLAYING') {
        currentState = 'GAMEOVER';
        isPaused = true;
        try { showWaveArrow(false); } catch (e) {}
        document.getElementById('hud').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('btn-pause').style.display = 'none';
        try {
            document.getElementById('gameover-score').textContent = 'SCORE FINAL: ' + score + ' pts';
        } catch (e) {}
        showMenu('gameover');
    }

    // Victoria contra jefe
    if (boss && boss.dead) {
        spawnText(boss.x, boss.laneY - 30, 'VICTORIA!', '#ffd700');
        setTimeout(function() {
            if (currentLevel < LEVELS.length - 1) {
                currentLevel++;
                startLevel(currentLevel);
            } else {
                currentState = 'MENU';
                showMenu('main');
            }
        }, 1500);
        boss = null;
    }
}

// --- Renderizado ---

function render() {
    const lvl = LEVELS[currentLevel];

    // Fondo
    ctx.fillStyle = 'rgb(' + lvl.bgColor[0] + ',' + lvl.bgColor[1] + ',' + lvl.bgColor[2] + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLevelBackground(lvl);

    // Cajas y pickups
    drawCrates();
    drawPickups();

    // Dibujar objetos por profundidad (orden Y)
    try {
        const drawList = [];
        if (typeof player !== 'undefined' && player) {
            drawList.push({ type: 'player', y: (typeof playerLaneY !== 'undefined' ? playerLaneY : laneBottom), obj: player });
        }
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.dead) continue;
            drawList.push({ type: 'enemy', y: e.laneY || 0, obj: e });
        }
        if (boss && !boss.dead) {
            drawList.push({ type: 'boss', y: boss.laneY || 0, obj: boss });
        }
        drawList.sort((a, b) => a.y - b.y);

        for (let i = 0; i < drawList.length; i++) {
            const d = drawList[i];
            if (d.type === 'player') {
                drawPlayer(time);
            } else if (d.type === 'enemy') {
                drawEnemy(d.obj);
            } else if (d.type === 'boss') {
                drawBossSprite(d.obj);
            }
        }
    } catch (err) {
        // Fallback
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.dead) continue;
            drawEnemy(e);
        }
        if (boss && !boss.dead) drawBossSprite(boss);
        drawPlayer(time);
    }

    // Proyectiles
    for (let i = 0; i < projectiles.length; i++) {
        const p = projectiles[i];
        if (p.type !== 'ice') continue;
        drawIceBall(p);
    }

    // Láser del jefe
    for (let i = 0; i < bossProjectiles.length; i++) {
        drawLaser(bossProjectiles[i]);
    }

    // Efectos de hielo
    for (let i = 0; i < iceTrails.length; i++) {
        const tr = iceTrails[i];
        const tdx = Math.round(tr.x - camera.x);
        const ta = (tr.life / tr.maxLife);
        ctx.globalAlpha = ta * 0.85;
        if (tr.gold) {
            ctx.fillStyle = '#d4af37';
            ctx.shadowColor = '#d4af37';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(tdx, tr.y, tr.size * ta, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#7ef0ff';
            ctx.beginPath();
            ctx.arc(tdx, tr.y, tr.size * ta, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    for (let i = 0; i < iceShatters.length; i++) {
        const sh = iceShatters[i];
        const sdx = Math.round(sh.x - camera.x);
        const sa = (sh.life / sh.maxLife);
        ctx.save();
        ctx.translate(sdx, sh.y);
        ctx.rotate(sh.rot);
        ctx.globalAlpha = sa;
        ctx.fillStyle = sh.cyan ? '#7ef0ff' : (sh.gold ? '#d4af37' : '#a5f3ff');
        ctx.beginPath();
        ctx.moveTo(-sh.size, 0);
        ctx.lineTo(0, -sh.size * 0.6);
        ctx.lineTo(sh.size, 0);
        ctx.lineTo(0, sh.size * 0.6);
        ctx.closePath();
        ctx.fill();
        if (!sh.gold) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(0, 0, sh.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;
    }

    // Target de hielo
    drawIceTargeting();

    // Textos flotantes
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.timer += 16;
        ft.y += ft.vy;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(ft.text, ft.x - camera.x, ft.y);
        if (ft.timer >= ft.life) floatingTexts.splice(i, 1);
    }

    // Información en pantalla
    ctx.fillStyle = '#7ef0ff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('NIVEL ' + (currentLevel + 1) + ' - ' + lvl.name, 14, 26);
    ctx.fillStyle = 'rgba(126,240,255,0.5)';
    ctx.font = '10px monospace';
    const okCount = Object.values(spriteStatus).filter(s => s === 'ok').length;
    ctx.fillText('Sprites: ' + okCount + '/' + Object.keys(spriteStatus).length + ' OK', 14, 42);

    // HUD
    drawHUD();
}

// --- Funciones de cámara ---

function updateCamera() {
    const cw = canvas.width;
    camera.targetX = player.x - cw * 0.50;
    camera.x += (camera.targetX - camera.x) * 0.35;
    camera.x = Math.max(0, Math.min(camera.x, camera.worldWidth - cw));
    if (camera.shake > 0) camera.shake -= 16;
}

function getWorldWidthForLevel(i) {
    return i === 0 ? 3600 : 4800;
}

// --- Funciones de estado del juego ---

function startLevel(idx) {
    try {
        currentLevel = idx;
        camera.worldWidth = getWorldWidthForLevel(idx);
        camera.x = 0;
        camera.targetX = 0;

        // Resetear estado
        enemies = [];
        boss = null;
        projectiles = [];
        iceTrails = [];
        iceShatters = [];
        frostDecals = [];
        crates = [];
        bossProjectiles = [];
        pickups = [];
        floatingTexts = [];
        enemiesDefeated = 0;
        bossSpawned = false;
        currentWave = 0;
        waitingForAdvance = false;
        showWaveArrow(false);
        resetWaves();

        player.x = 120;
        player.health = 100;
        score = 0;

        setupCanvas();

        const lvl = LEVELS[idx];
        document.getElementById('story-title').textContent = lvl.name;
        document.getElementById('story-sub').textContent = lvl.subtitle;
        document.getElementById('story-text').textContent = lvl.story;
        document.getElementById('story-boss').textContent = 'JEFE: ' + lvl.boss + ' - ' + lvl.bossTitle;
        document.getElementById('story-meta').textContent = 'Mundo: ' + camera.worldWidth + 'px • Enemigos: ' + lvl.enemyCount + ' • Tipos: ' + lvl.enemyTypes.join(', ');

        showMenu('story');
        setTimeout(function() {
            if (typeof spawnWave === 'function') {
                spawnWave();
            }
        }, 400);

        updateLiveButtonVisibility();

        const bo = document.getElementById('btn-editor-open');
        const isEd = !!(LEVELS[currentLevel] && LEVELS[currentLevel].isEditor);
        if (bo) bo.style.display = isEd ? 'block' : 'none';
        if (isEd) {
            openLiveEditor();
        } else {
            closeLiveEditor();
        }
    } catch (e) {
        alert('Error nivel: ' + e.message);
    }
}

function startGameInit() {
    try {
        setupCanvas();
        if (!laneTop) {
            laneTop = 180;
            laneBottom = 360;
            playerLaneY = 360;
        }
        currentState = 'PLAYING';
        isPaused = false;

        document.querySelectorAll('.menu-overlay').forEach(function(m) {
            m.style.display = 'none';
        });

        document.getElementById('hud').style.display = 'flex';
        document.getElementById('top-bar').style.display = 'none';
        document.getElementById('btn-pause').style.display = 'block';
        document.getElementById('btn-pause').textContent = '⏸ PAUSA';
        document.getElementById('controls').style.display = 'flex';

        if (!gameLoopStarted) {
            gameLoopStarted = true;
            lastFrameTime = performance.now();
            requestAnimationFrame(loop);
        }
    } catch (e) {
        alert('Error inicio: ' + e.message);
    }
}

function pauseGame() {
    if (currentState !== 'PLAYING') return;
    isPaused = true;
    showMenu('pause');
    document.getElementById('controls').style.display = 'none';
}

function resumeGame() {
    isPaused = false;
    document.querySelectorAll('.menu-overlay').forEach(function(m) {
        m.style.display = 'none';
    });
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('controls').style.display = 'flex';
    lastFrameTime = performance.now();
}

function saveGameState() {
    try {
        const data = {
            level: currentLevel,
            score: score,
            health: player.health,
            wave: currentWave,
            defeated: enemiesDefeated
        };
        localStorage.setItem('sz_save_v177', JSON.stringify(data));
        refreshContinueButton();
    } catch (e) {}
}

function exitToMenu() {
    document.getElementById('ctrl-editor-panel').style.display = 'none';
    currentState = 'MENU';
    isPaused = false;
    document.getElementById('top-bar').style.display = 'flex';
    showMenu('main');
    document.getElementById('hud').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    enemies = [];
    boss = null;
    projectiles = [];
    iceTrails = [];
    iceShatters = [];
    frostDecals = [];
    attachedIce = null;
    resetWaves();
    updateLiveButtonVisibility();
    refreshContinueButton();
}

function showHowToPlay() {
    showMenu('howtoplay');
}

// --- Menús ---

function hideAllMenus() {
    const ids = ['menu-main', 'menu-levels', 'menu-controls', 'menu-settings', 'menu-sprites', 'menu-story'];
    for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el) el.style.display = 'none';
    }
}

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
        }
        if (id === 'sprites') updateSpriteUI();
    } catch (e) {}
}

function showPauseOverlay() {
    hideAllMenus();
    const mp = document.getElementById('menu-pause');
    if (mp) {
        mp.style.display = 'flex';
        mp.classList.add('active');
    }
}

function hideOverlays() {
    const ms = document.querySelectorAll('.menu-overlay');
    for (let i = 0; i < ms.length; i++) {
        ms[i].style.display = 'none';
        ms[i].classList.remove('active');
    }
}

// --- Utilidades del menú ---

function refreshContinueButton() {
    const b = document.getElementById('btn-continue');
    if (!b) return;
    let has = false;
    try { has = !!localStorage.getItem('sz_save_v177'); } catch (e) {}
    b.style.display = has ? 'block' : 'none';
}

function updateLiveButtonVisibility() {
    const b = document.getElementById('btn-open-live');
    if (!b) return;
    if (typeof currentState !== 'undefined' && currentState === 'PLAYING' && LEVELS[currentLevel] && LEVELS[currentLevel].isEditor) {
        b.style.display = 'block';
    } else {
        b.style.display = 'none';
    }
}

function updatePauseButton() {
    const bp = document.getElementById('btn-pause');
    if (!bp) return;
    if (currentState === 'PLAYING') {
        bp.style.display = 'block';
    } else {
        bp.style.display = 'none';
    }
}
