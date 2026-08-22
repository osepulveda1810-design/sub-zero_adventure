// ============================================================
// RENDERIZADO - Dibujo de sprites, fondos, HUD
// ============================================================

// Variables de renderizado
let playerSprites = {};
let spriteStatus = {};
let enemySprites = {};
let enemyStatus = {};
let kanoSprites = {};
let spritesReady = false;

// --- Inicialización de sprites ---

function initSprites() {
    const keys = Object.keys(SPRITE_CONFIG);
    let loaded = 0;

    function checkDone() {
        loaded++;
        if (loaded >= keys.length) spritesReady = true;
    }

    keys.forEach(key => {
        const cfg = SPRITE_CONFIG[key];
        spriteStatus[key] = "loading";
        const img = new Image();
        img.onload = function() {
            spriteStatus[key] = "ok";
            checkDone();
        };
        img.onerror = function() {
            spriteStatus[key] = "fail";
            checkDone();
        };
        img.src = SPRITE_BASE + cfg.file;
        playerSprites[key] = img;
    });

    // Sprites de enemigos
    Object.keys(ENEMY_SPRITE_CONFIG).forEach(et => {
        enemySprites[et] = {};
        enemyStatus[et] = {};
        const anims = ENEMY_SPRITE_CONFIG[et];
        Object.keys(anims).forEach(anim => {
            const cfg = anims[anim];
            enemyStatus[et][anim] = "loading";
            const img = new Image();
            img.onload = (function(t, a) {
                return function() {
                    enemyStatus[t][a] = "ok";
                };
            })(et, anim);
            img.onerror = (function(t, a) {
                return function() {
                    enemyStatus[t][a] = "fail";
                };
            })(et, anim);
            img.src = ENEMY_SPRITE_BASE + et + "/" + cfg.file;
            enemySprites[et][anim] = img;
        });
    });

    // Sprites de Kano
    Object.keys(KANO_SPRITE_CONFIG).forEach(key => {
        const img = new Image();
        img.onload = function() {
            img.ok = true;
            if (!__kanoNormSet && key === 'idle') {
                KANO_NORM = 280 / img.height;
                __kanoNormSet = true;
            }
        };
        img.onerror = function() {
            img.ok = false;
        };
        img.src = KANO_SPRITE_BASE + KANO_SPRITE_CONFIG[key].file;
        kanoSprites[key] = img;
    });

    setTimeout(() => {
        if (!spritesReady) spritesReady = true;
    }, 6000);
}

// --- Dibujo del jugador ---

function drawPlayer(time) {
    if (typeof player.frame === 'undefined') player.frame = 0;
    if (typeof player.frameTime === 'undefined') player.frameTime = 0;

    const wanted = player.anim || 'idle';
    const spriteSet = playerSprites;

    function ok(a) {
        return spriteSet && spriteSet[a] && spriteSet[a].complete && spriteSet[a].naturalWidth > 0;
    }

    let animToUse = wanted;
    if (!ok(animToUse)) {
        if (ok('idle')) animToUse = 'idle';
        else animToUse = null;
    }

    if (animToUse && spriteSet && spriteSet[animToUse]) {
        const sprite = spriteSet[animToUse];
        const cfg = SPRITE_CONFIG[animToUse] || { frames: 1, cols: 1 };
        const total = cfg.frames || 1;
        const cols = cfg.cols || cfg.frames;
        const rows = cfg.rows || Math.ceil(cfg.frames / cols);

        const useIntegerFrames = (animToUse === 'jump' || cfg.integerFrames === true);
        const fw = useIntegerFrames ? Math.floor(sprite.naturalWidth / cols) : sprite.naturalWidth / cols;
        const fh = useIntegerFrames ? Math.floor(sprite.naturalHeight / rows) : sprite.naturalHeight / rows;
        const f = (player.frame % total);
        const sx = (f % cols) * fw;
        const sy = Math.floor(f / cols) * fh;

        const gScale = typeof PLAYER_GLOBAL_SCALE !== 'undefined' ? PLAYER_GLOBAL_SCALE : 1;
        const sx2 = cfg.scaleX * gScale;
        const sy2 = cfg.scaleY * gScale;
        const ax = cfg.anchorX * gScale;
        const ay = cfg.anchorY * gScale;
        const sc = 1.15;
        const tw = Math.round(90 * sc * sx2);
        const th = Math.round(110 * sc * sy2);
        const pyEff = playerEffY();
        const dy = Math.round(pyEff - th + 12 + ay);

        try {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            let drawX = Math.round(player.x - camera.x + ax - tw / 2);
            if (!player.facingRight) {
                ctx.translate(drawX + tw / 2, 0);
                ctx.scale(-1, 1);
                ctx.translate(-(drawX + tw / 2), 0);
            }
            ctx.drawImage(sprite, sx, sy, fw, fh, drawX, dy, tw, th);
            ctx.restore();
            return true;
        } catch (err) {}
    }

    // Fallback: rectángulo simple
    ctx.fillStyle = '#4ecca3';
    ctx.fillRect(player.x - camera.x - 20, playerEffY() - 60, 40, 60);
    return true;
}

// --- Dibujo de enemigos ---

function drawEnemy(e) {
    if (e.type === 'kano' || e.name === 'Kano') {
        drawBossSprite(e);
        return;
    }

    const ex = Math.round(e.x - camera.x);
    if (ex < -250 || ex > canvas.width + 250) return false;

    if (typeof e.frame === 'undefined') e.frame = 0;
    if (typeof e.frameTime === 'undefined') e.frameTime = 0;
    if (typeof e.facingRight === 'undefined') e.facingRight = false;

    const type = e.type || 'thug';
    let wanted = 'idle';
    if (e.previewAnim && e.previewTimer > 0) wanted = e.previewAnim;
    else if (e.frozen > 0) wanted = 'frozen';
    else if (e.dead) wanted = 'dead';
    else if (e.hitTimer > 0) wanted = 'hit';
    else if (e.attacking) wanted = e.previewAnim || 'punch';
    else if (e.isMoving) wanted = 'walk';

    const spriteSet = enemySprites[type];
    function ok(a) {
        return spriteSet && spriteSet[a] && spriteSet[a].complete && spriteSet[a].naturalWidth > 0;
    }

    let animToUse = wanted;
    if (animToUse === 'punch' || animToUse === 'kick') {
        if (ok('attack')) animToUse = 'attack';
    }
    if (!ok(animToUse)) {
        if (ok('idle')) animToUse = 'idle';
        else if (ok('walk')) animToUse = 'walk';
        else if (wanted === 'walk' && ok('attack')) animToUse = 'attack';
        else if (ok('attack')) animToUse = 'attack';
        else animToUse = null;
    }

    if (animToUse && spriteSet && spriteSet[animToUse]) {
        const sprite = spriteSet[animToUse];
        const cfg = (ENEMY_SPRITE_CONFIG[type] && ENEMY_SPRITE_CONFIG[type][animToUse]) || { frames: 1, cols: 1 };
        const cols = cfg.cols || cfg.frames;
        const rows = Math.ceil(cfg.frames / cols);
        const fw = sprite.naturalWidth / cols;
        const fh = sprite.naturalHeight / rows;
        const f = (e.frame % cfg.frames);
        const sx = (f % cols) * fw;
        const sy = Math.floor(f / cols) * fh;

        const sc = (1 - ((laneBottom - e.laneY) / 200) * 0.12) * 1.15;
        const tw = Math.round(90 * sc * (cfg.scaleX || 1));
        const th = Math.round(110 * sc * (cfg.scaleY || 1));
        const ax = (cfg.anchorX || 0) * sc;
        const ay = (cfg.anchorY || 0) * sc;
        const dy = Math.round(e.laneY - th + 12 + ay);

        try {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            if (e.hitTimer > 0) {
                ctx.translate(Math.sin(e.hitTimer * 0.6) * 2.5, 0);
            }
            const drawX = ex + Math.round(ax);
            if (!e.facingRight) {
                ctx.translate(drawX + tw / 2, 0);
                ctx.scale(-1, 1);
                ctx.translate(-(drawX + tw / 2), 0);
            }
            ctx.drawImage(sprite, sx, sy, fw, fh, drawX, dy, tw, th);
            ctx.restore();

            // Barra de vida
            if (!e.dead && e.health < e.maxHealth) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(ex, e.laneY - 66, 70, 4);
                ctx.fillStyle = e.frozen > 0 ? '#7ef0ff' : '#ff4444';
                ctx.fillRect(ex, e.laneY - 66, 70 * (e.health / e.maxHealth), 4);
            }
            return true;
        } catch (err) {}
    }

    // Fallback: rectángulo simple
    const sc2 = (1 - ((laneBottom - e.laneY) / 200) * 0.12) * 1.15;
    const tw2 = Math.round(80 * sc2);
    const th2 = Math.round(100 * sc2);
    ctx.fillStyle = '#8d6e63';
    if (e.attacking) ctx.fillStyle = '#ff9800';
    if (e.hitTimer > 0) ctx.fillStyle = '#ff2222';
    ctx.fillRect(ex, e.laneY - th2, tw2, th2);
    ctx.fillStyle = 'white';
    ctx.font = '9px monospace';
    ctx.fillText('MISS:' + wanted + ' @ ' + ENEMY_SPRITE_BASE + type + '/' + wanted + '.png', ex - 20, e.laneY - th2 - 8);
    return true;
}

// --- Dibujo del jefe Kano ---

function drawBossSprite(b) {
    if (b.__rf === window.__rf) return;
    b.__rf = window.__rf;

    const cfg = KANO_SPRITE_CONFIG[b.anim] || KANO_SPRITE_CONFIG.idle;
    const img = kanoSprites[b.anim];
    const bx = Math.round(b.x - camera.x);
    let Hdraw = b.height;

    if (img && img.ok) {
        const cols = cfg.cols || cfg.frames;
        const rows = Math.ceil(cfg.frames / cols);
        const fw = img.width / cols;
        const fh = img.height / rows;
        const f = b.frame % cfg.frames;
        const sx = (f % cols) * fw;
        const sy = Math.floor(f / cols) * fh;
        const W = fw * cfg.scaleX * (typeof KANO_NORM !== 'undefined' ? KANO_NORM : 1);
        const H = fh * cfg.scaleY * (typeof KANO_NORM !== 'undefined' ? KANO_NORM : 1);
        Hdraw = H;
        ctx.save();
        ctx.translate(bx, b.laneY);
        if (!b.facingRight) { ctx.scale(-1, 1); }
        ctx.drawImage(img, sx, sy, fw, fh, -W / 2 + cfg.anchorX, -H + cfg.anchorY, W, H);
        ctx.restore();
    } else {
        ctx.fillStyle = b.frozen > 0 ? '#7ef0ff' : b.color;
        ctx.fillRect(bx, b.laneY - 60, b.width, b.height);
        Hdraw = b.height;
    }

    if (!b.isDummy) {
        const barY = b.laneY - Hdraw - 12;
        const nameY = b.laneY - Hdraw - 18;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx - 30, barY, 60, 4);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(bx - 30, barY, 60 * (b.health / b.maxHealth), 4);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.name.toUpperCase(), bx, nameY);
        ctx.textAlign = 'left';
    }
}

// --- Dibujo de fondos ---

function drawCityBackground(lvl) {
    const w = canvas.width;
    const h = canvas.height;

    // Cargar textura de piso
    if (typeof floorTextureImg === 'undefined') {
        window.floorTextureImg = new Image();
        floorTextureImg.src = "assets/backgrounds/floor_city.jpg";
        floorTextureImg.loaded = false;
        floorTextureImg.onload = function() {
            floorTextureImg.loaded = true;
        };
        floorTextureImg.onerror = function() {
            floorTextureImg.loaded = false;
            floorTextureImg.failed = true;
        };
    }

    if (typeof cityBgImg !== 'undefined' && cityBgImg && cityBgImg.loaded) {
        const imgW = cityBgImg.width;
        const imgH = cityBgImg.height;

        // Cielo
        const skyGrad = ctx.createLinearGradient(0, 0, 0, laneTop);
        skyGrad.addColorStop(0, '#0a0e1e');
        skyGrad.addColorStop(1, '#1a2440');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, laneTop);

        // Skyline lejano
        const skylineSrcH = imgH * 0.32;
        const skylineDestH = laneTop * 0.85;
        const skylineScale = w * 1.2 / imgW;
        const scaledSkyW = imgW * skylineScale;
        const skyOffsetX = -(camera.x * 0.08) % scaledSkyW;
        for (let si = -1; si < 3; si++) {
            ctx.drawImage(cityBgImg, 0, 0, imgW, skylineSrcH, skyOffsetX + si * scaledSkyW, laneTop - skylineDestH, scaledSkyW, skylineDestH);
        }
        ctx.fillStyle = 'rgba(20,30,60,0.35)';
        ctx.fillRect(0, laneTop - skylineDestH * 0.5, w, skylineDestH * 0.5);

        // Edificios medios
        const midSrcY = imgH * 0.28;
        const midSrcH = imgH * 0.50;
        const buildingsDestH = laneTop * 0.95;
        const buildingsScale = buildingsDestH / midSrcH;
        const buildingsW = imgW * buildingsScale * 1.8;
        const midOffsetX = -(camera.x * 0.18) % (buildingsW * 0.6);
        for (let mi = -1; mi < 5; mi++) {
            const mdx = midOffsetX + mi * buildingsW * 0.6;
            ctx.drawImage(cityBgImg, 0, midSrcY, imgW, midSrcH, mdx, laneTop - buildingsDestH, buildingsW, buildingsDestH);
        }

        // Piso
        const streetDestY = laneTop;
        const streetDestH = h - laneTop;

        if (typeof floorTextureImg !== 'undefined' && floorTextureImg.loaded && !floorTextureImg.failed) {
            const texW = 380;
            const texH = 380;
            const offsetX = -(camera.x * 0.55) % texW;
            for (let fx = -2; fx < 6; fx++) {
                for (let fy = 0; fy < 2; fy++) {
                    const ty = streetDestY + fy * texH;
                    if (ty > streetDestY + streetDestH) continue;
                    ctx.drawImage(floorTextureImg, 0, 0, floorTextureImg.width, floorTextureImg.height, offsetX + fx * texW, ty, texW, texH);
                }
            }
        } else {
            const floorGrad = ctx.createLinearGradient(0, streetDestY, 0, streetDestY + streetDestH);
            floorGrad.addColorStop(0, '#1a2436');
            floorGrad.addColorStop(1, '#0a1220');
            ctx.fillStyle = floorGrad;
            ctx.fillRect(0, streetDestY, w, streetDestH);
        }

        // Velo oscuro
        ctx.fillStyle = 'rgba(5,8,14,0.35)';
        ctx.fillRect(0, streetDestY, w, streetDestH);

        // Línea central
        const midLaneY = laneTop + (laneBottom - laneTop) * 0.58;
        ctx.strokeStyle = 'rgba(255,220,90,0.32)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([26, 20]);
        ctx.beginPath();
        ctx.moveTo(-(camera.x * 0.9 % 50), midLaneY);
        ctx.lineTo(w + 60, midLaneY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sombras de suelo
        ctx.fillStyle = 'rgba(180,200,220,0.12)';
        ctx.fillRect(0, laneTop, w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, laneBottom - 3, w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, laneTop, w, 10);

        // Viñeta
        const vignette = ctx.createRadialGradient(w / 2, streetDestY + streetDestH * 0.4, w * 0.25, w / 2, streetDestY + streetDestH * 0.5, w * 0.9);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.38)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, streetDestY, w, streetDestH);
        return;
    }

    // Fallback
    ctx.fillStyle = 'rgb(' + lvl.groundColor[0] + ',' + lvl.groundColor[1] + ',' + lvl.groundColor[2] + ')';
    ctx.fillRect(0, laneTop, canvas.width, canvas.height - laneTop);
}

function drawLevelBackground(lvl) {
    if (!lvl) return;
    if (lvl.id === 1) {
        drawCityBackground(lvl);
    } else {
        ctx.fillStyle = 'rgb(' + lvl.groundColor[0] + ',' + lvl.groundColor[1] + ',' + lvl.groundColor[2] + ')';
        ctx.fillRect(0, laneTop, canvas.width, canvas.height - laneTop);
        ctx.strokeStyle = 'rgba(126,240,255,0.05)';
        for (let i = 0; i < canvas.width; i += 90) {
            const sx = (i - (camera.x % 90));
            ctx.beginPath();
            ctx.moveTo(sx, laneTop);
            ctx.lineTo(sx - 15, canvas.height);
            ctx.stroke();
        }
    }
    const prog = camera.x / Math.max(1, camera.worldWidth - canvas.width);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(canvas.width * 0.22, 8, canvas.width * 0.56, 4);
    ctx.fillStyle = '#7ef0ff';
    ctx.fillRect(canvas.width * 0.22, 8, canvas.width * 0.56 * prog, 4);
}

// --- Dibujo de proyectiles ---

function drawIceBall(p) {
    p.trail = p.trail || [];
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 8) p.trail.shift();

    let r = p.r || 13;
    r = r * (1 + 0.08 * Math.sin((p.life || 0) * 0.05));

    for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        const a = (i / p.trail.length) * 0.22;
        ctx.fillStyle = 'rgba(126,240,255,' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(t.x - camera.x, t.y, r * (0.35 + 0.6 * i / p.trail.length), 0, Math.PI * 2);
        ctx.fill();
    }

    const sx = p.x - camera.x;
    const g = ctx.createRadialGradient(sx, p.y, r * 0.2, sx, p.y, r * 2.2);
    g.addColorStop(0, 'rgba(200,250,255,0.9)');
    g.addColorStop(0.4, 'rgba(126,240,255,0.5)');
    g.addColorStop(1, 'rgba(126,240,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, p.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eaffff';
    ctx.beginPath();
    ctx.arc(sx, p.y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
        const ang = (p.life || 0) * 0.02 + i * 2.09;
        ctx.beginPath();
        ctx.arc(sx, p.y, r * 0.8, ang, ang + 0.9);
        ctx.stroke();
    }
}

function drawLaser(p) {
    const sx = p.x - camera.x;
    const g = ctx.createRadialGradient(sx, p.y, 2, sx, p.y, 26);
    g.addColorStop(0, 'rgba(255,80,80,0.9)');
    g.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, p.y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff5555';
    ctx.fillRect(sx - 18, p.y - 3, 36, 6);
    ctx.fillStyle = '#ffe0e0';
    ctx.fillRect(sx - 10, p.y - 1.5, 20, 3);
}

// --- Dibujo de HUD ---

function drawHUD() {
    // Actualizar elementos del HUD
    try {
        document.getElementById('hud-health').textContent = Math.round(player.health) + '%';
        document.getElementById('health-bar').style.width = player.health + '%';
        document.getElementById('hud-level').textContent = currentLevel + '/' + (LEVELS.length - 1);
        const iceProgDisplay = player.isIceAttacking ? 1 : 0;
        document.getElementById('hud-progress').textContent = Math.round(iceProgDisplay * 100) + '%';
        document.getElementById('hud-enemies').textContent = enemiesDefeated + '/' + LEVELS[currentLevel].enemyCount;
        document.getElementById('hud-score').textContent = score + ' pts';
    } catch (e) {}
}
