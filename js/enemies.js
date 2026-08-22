// ============================================================
// ENEMIGOS - IA, oleadas, jefes (SOLO FUNCIONES)
// ============================================================

// --- FUNCIÓN TEMPORAL (será sobrescrita por main.js) ---
function showWaveArrow(show, text) {
    // Esta función será reemplazada por la de main.js
    // Mientras tanto, no hace nada para evitar errores
}
window.showWaveArrow = showWaveArrow;

// --- FUNCIONES DE ENEMIGOS ---
function createEnemy(type, x, laneY) {
    const cfg = ENEMY_CONFIGS[type];
    if (!cfg) return null;
    return {
        type: type,
        x: x,
        laneY: laneY,
        width: HITBOX_W || 44,
        height: HITBOX_H || 96,
        color: cfg.color,
        health: cfg.health,
        maxHealth: cfg.health,
        speed: cfg.speed,
        damage: cfg.damage,
        dead: false,
        frozen: 0,
        facingRight: false,
        frame: 0,
        frameTime: 0,
        attackTimer: 0,
        isMoving: false,
        attacking: false,
        hitTimer: 0,
        deadTimer: 0,
        hitApplied: false
    };
}

function createBoss(type, x, laneY) {
    const cfg = BOSS_CONFIGS[type];
    if (!cfg) return null;
    return {
        name: type,
        x: x,
        laneY: laneY,
        width: cfg.width || 52,
        height: cfg.height || 80,
        color: cfg.color,
        health: cfg.health,
        maxHealth: cfg.health,
        damage: cfg.damage,
        dead: false,
        frozen: 0,
        facingRight: false,
        frame: 0,
        frameTime: 0,
        isMoving: false,
        attacking: false,
        anim: 'idle',
        hitTimer: 0,
        laserTimer: 0,
        laserFired: false,
        laserCooldown: 2500,
        defeatType: null
    };
}

// --- CONTAR ENEMIGOS VIVOS ---
function getAliveCount() {
    let count = 0;
    for (let i = 0; i < enemies.length; i++) {
        if (!enemies[i].dead) count++;
    }
    return count;
}

// --- RESETEAR OLEADAS ---
function resetWaves() {
    currentWave = 0;
    totalWaves = 3;
    waveSize = 5;
    waveInProgress = false;
    nextWaveTriggerX = 0;
    waitingForAdvance = false;
    enemies = [];
    showWaveArrow(false);
}

// --- SPAWNEAR OLEADA ---
function spawnWave() {
    const lvl = LEVELS[currentLevel];
    if (!lvl) return;
    if (enemiesDefeated >= lvl.enemyCount) return;
    if (getAliveCount() > 0) return;
    if (currentWave >= totalWaves) return;

    const remaining = lvl.enemyCount - enemiesDefeated;
    if (remaining <= 0) return;

    let toSpawn = Math.min(waveSize, remaining);
    if (remaining >= 5 && Math.random() > 0.5) toSpawn = 4;
    else toSpawn = Math.min(3, remaining);
    if (currentWave === totalWaves - 1) toSpawn = remaining;

    const cw = canvas.width;
    const spawnCenterX = camera.x + cw + 280 + currentWave * 90 + Math.random() * 120;

    const ySlots = [];
    const yRange = Math.max(30, laneBottom - laneTop - 30);
    for (let i = 0; i < toSpawn; i++) {
        let baseY = laneTop + 20 + (i + 0.5) * (yRange / toSpawn);
        baseY += (Math.random() * 24 - 12);
        ySlots.push(baseY);
    }

    for (let i = ySlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ySlots[i], ySlots[j]] = [ySlots[j], ySlots[i]];
    }

    for (let i = 0; i < toSpawn; i++) {
        const type = lvl.enemyTypes[Math.floor(Math.random() * lvl.enemyTypes.length)];
        const fromFront = Math.random() > 0.35 || player.x < 450;
        let x;
        if (fromFront) {
            x = spawnCenterX + i * 115 + Math.random() * 70;
        } else {
            x = player.x - 320 - Math.random() * 120 - i * 95;
            if (x < 30) x = 30 + Math.random() * 60;
        }
        let laneY = ySlots[i] || (laneTop + 20 + Math.random() * (laneBottom - laneTop - 40));
        if (laneY < laneTop + 10) laneY = laneTop + 10;
        if (laneY > laneBottom - 10) laneY = laneBottom - 10;

        const e = createEnemy(type, x, laneY);
        if (e) {
            e.fromFront = fromFront;
            enemies.push(e);
        }
    }

    currentWave++;
    waveInProgress = true;
    waitingForAdvance = false;
    showWaveArrow(false);
    nextWaveTriggerX = 0;
    spawnText(camera.x + canvas.width / 2, 110, 'OLEADA ' + currentWave + '/' + totalWaves + ' - ' + toSpawn + ' ENEMIGOS', '#facc15');
}

// --- PREPARAR SIGUIENTE OLEADA ---
function prepareNextWaveAdvance() {
    if (LEVELS[currentLevel] && LEVELS[currentLevel].isEditor) return;
    if (waitingForAdvance) return;
    if (currentWave >= totalWaves) return;
    if (enemiesDefeated >= LEVELS[currentLevel].enemyCount) return;

    waitingForAdvance = true;
    nextWaveTriggerX = player.x + 380 + currentWave * 120;
    if (nextWaveTriggerX > camera.worldWidth - 250) nextWaveTriggerX = camera.worldWidth - 280;
    showWaveArrow(true, 'AVANZA ➡️ OLEADA ' + (currentWave + 1) + '/' + totalWaves);
    spawnText(player.x, playerLaneY - 60, 'AVANZA PARA SIGUIENTE OLEADA', '#facc15');
}

// --- SPAWNEAR JEFE ---
function spawnBoss() {
    const lvl = LEVELS[currentLevel];
    if (lvl && lvl.isEditor) return;
    boss = createBoss(lvl.boss, camera.worldWidth - 200, (laneTop + laneBottom) / 2);
    bossSpawned = true;
    spawnText(camera.x + canvas.width / 2, 150, '! ' + lvl.boss.toUpperCase() + ' !', '#ffd700');
}

// --- DISPARAR LÁSER DE KANO ---
function fireKanoLaser() {
    if (!boss) return;
    const cfg = KANO_SPRITE_CONFIG.laser;
    const img = kanoSprites.laser;
    const norm = typeof KANO_NORM !== 'undefined' ? KANO_NORM : 1;
    const H = (img && img.ok) ? img.height * cfg.scaleY * norm : 140;
    bossProjectiles.push({
        x: boss.x + (boss.facingRight ? 20 : -20),
        y: boss.laneY - H * 0.92,
        vx: boss.facingRight ? 10 : -10,
        life: 1400,
        hit: false
    });
}

// --- ACTUALIZAR ENEMIGOS ---
function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];

        if (e.isDummy) {
            if (e.previewTimer > 0) {
                e.previewTimer -= 16;
                if (e.previewTimer <= 0) {
                    e.previewTimer = 0;
                    e.previewAnim = null;
                }
            }
            e.anim = e.previewAnim || (e.isMoving ? 'walk' : 'idle');
            e.frameTime = (e.frameTime || 0) + 16;
            const dcfg = (spriteConfigFor(e.type) || {})[e.anim] || {};
            const dframes = dcfg.frames || 4;
            const dspeed = dcfg.frameSpeed || dcfg.speed || 100;
            if (e.frameTime > dspeed) {
                e.frameTime = 0;
                e.frame = (e.frame + 1) % dframes;
            }
            continue;
        }

        if (e.dead) {
            if (e.deadTimer > 0) e.deadTimer -= 16;
            continue;
        }

        if (e.frozen > 0) {
            e.frozen -= 16;
            if (e.frozen <= 0) {
                e.frozen = 0;
                e.anim = 'idle';
                e.frame = 0;
            }
            continue;
        }

        if (e.hitTimer > 0) {
            e.hitTimer -= 16;
            if (e.hitTimer <= 0) {
                e.anim = 'idle';
                e.frame = 0;
            }
            continue;
        }

        if (e.attacking) {
            e.attackTimer += 16;
            if (e.attackTimer > 600) {
                e.attacking = false;
                e.anim = 'idle';
                e.frame = 0;
                e.attackTimer = 0;
            }
            if (e.attackTimer > 250 && e.attackTimer < 350 && !e.hitApplied) {
                const dx = Math.abs(e.x - player.x);
                const dy = Math.abs(e.laneY - playerEffY());
                if (dx < DIST_DMG && dy < 35) {
                    if (player.health > 0) {
                        e.hitApplied = true;
                        player.health -= 10;
                        player.hitTimer = 300;
                        player.hurtFlash = 220;
                        player.x = Math.max(0, Math.min(camera.worldWidth - 80, player.x + (e.x < player.x ? 16 : -16)));
                        spawnText(player.x, playerLaneY - 40, '-10', '#ff4444');
                        camera.shake = 8;
                    }
                }
            }
            continue;
        }

        const dxp = player.x - e.x;
        const dyp = e.laneY - playerEffY();
        const dist = Math.hypot(dxp, dyp);
        const inRange = Math.abs(dxp) < DIST_STOP && Math.abs(dyp) < 35;

        if (dist > 400) {
            e.isMoving = false;
            e.anim = 'idle';
        } else if (!inRange) {
            e.isMoving = true;
            e.anim = 'walk';
            const sp = e.speed || 2;
            e.x += (dxp / dist) * sp;
            e.laneY += (-dyp / dist) * sp * 0.7;
            if (dxp > 0) e.facingRight = true;
            else e.facingRight = false;
        } else {
            e.isMoving = false;
            e.attacking = true;
            e.anim = 'attack';
            e.frame = 0;
            e.attackTimer = 0;
            e.hitApplied = false;
        }

        if (e.laneY < laneTop) e.laneY = laneTop;
        if (e.laneY > laneBottom) e.laneY = laneBottom;
    }

    for (let i = 0; i < enemies.length; i++) {
        const e1 = enemies[i];
        if (e1.isDummy || e1.dead) continue;
        for (let j = i + 1; j < enemies.length; j++) {
            const e2 = enemies[j];
            if (e2.isDummy || e2.dead) continue;
            const dx = e2.x - e1.x;
            const dy = e2.laneY - e1.laneY;
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);
            if (adx < 80 && ady < 24) {
                const dirx = dx >= 0 ? 1 : -1;
                const diry = dy >= 0 ? 1 : -1;
                e1.x -= dirx * (80 - adx) * 0.25;
                e2.x += dirx * (80 - adx) * 0.25;
                e1.laneY -= diry * (24 - ady) * 0.15;
                e2.laneY += diry * (24 - ady) * 0.15;
            }
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.isDummy || e.dead || e.frozen > 0) continue;
        const dx = e.x - player.x;
        const dy = e.laneY - playerEffY();
        if (Math.abs(dx) < DIST_BODY && Math.abs(dy) < 30) {
            e.x = player.x + (dx >= 0 ? DIST_BODY : -DIST_BODY);
        }
    }
}

// --- ACTUALIZAR JEFE ---
function updateBoss() {
    if (!boss || boss.dead || boss.frozen > 0) {
        if (boss && boss.dead) {
            boss.anim = 'dead';
            boss.frameTime = (boss.frameTime || 0) + 16;
            const dcf = KANO_SPRITE_CONFIG.dead;
            if (boss.frameTime > dcf.speed) {
                boss.frameTime = 0;
                if (boss.frame < dcf.frames - 1) boss.frame++;
            }
        }
        return;
    }

    if (boss.hitTimer > 0) {
        boss.hitTimer -= 16;
        boss.anim = 'hit';
        boss.isMoving = false;
        if (boss.hitTimer <= 0) boss.anim = 'idle';
    } else if (boss.laserTimer > 0) {
        boss.laserTimer -= 16;
        boss.isMoving = false;
        boss.anim = 'laser';
        if (!boss.laserFired && boss.laserTimer <= 760) {
            boss.laserFired = true;
            fireKanoLaser();
        }
        if (boss.laserTimer <= 0) {
            boss.laserCooldown = 3500;
            boss.anim = 'idle';
        }
    } else {
        boss.laserCooldown -= 16;
        const dx = player.x - boss.x;
        const dy = playerEffY() - boss.laneY;
        const d = Math.sqrt(dx * dx + dy * dy);
        boss.isMoving = false;
        boss.attacking = false;

        if (Math.abs(dx) > 260 && boss.laserCooldown <= 0) {
            boss.laserTimer = 900;
            boss.laserFired = false;
            boss.frame = 0;
            boss.frameTime = 0;
        } else if (d > DIST_STOP + 20) {
            boss.x += (dx / d) * 0.8;
            boss.laneY += (dy / d) * 0.4;
            boss.isMoving = true;
            boss.anim = 'walk';
            if (dx > 0) boss.facingRight = true;
            else if (dx < 0) boss.facingRight = false;
        }

        if (Math.abs(dx) < DIST_DMG + 20 && Math.abs(dy) < 40) {
            boss.attacking = true;
            boss.anim = 'attack';
            player.health -= 0.25;
        }

        if (!boss.isMoving && !boss.attacking && boss.laserTimer <= 0) {
            boss.anim = 'idle';
        }
    }

    boss.frameTime = (boss.frameTime || 0) + 16;
    const bcfg = KANO_SPRITE_CONFIG[boss.anim] || KANO_SPRITE_CONFIG.idle;
    if (boss.frameTime > bcfg.speed) {
        boss.frameTime = 0;
        if (boss.anim === 'laser') {
            if (boss.frame < bcfg.frames - 1) boss.frame++;
        } else {
            boss.frame = (boss.frame + 1) % bcfg.frames;
        }
    }

    if (boss.laneY < laneTop) boss.laneY = laneTop;
    if (boss.laneY > laneBottom) boss.laneY = laneBottom;
}

// --- ACTUALIZAR PROYECTILES ---
function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];

        if (p.type === 'ice' && p.homing && p.target && !p.target.dead) {
            const dx = p.target.x - p.x;
            const dy = p.target.laneY - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 500 && dist > 5) {
                const pull = 0.42;
                p.vx += (dx / dist) * pull;
                p.vy += (dy / dist) * pull * 0.6;
                const sp = Math.hypot(p.vx, p.vy);
                const maxSp = (typeof ICE_SPEED !== 'undefined' ? ICE_SPEED : 7.5) * 1.15;
                if (sp > maxSp) {
                    p.vx = (p.vx / sp) * maxSp;
                    p.vy = (p.vy / sp) * maxSp;
                }
            }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 16;
        if (p.life <= 0) {
            projectiles.splice(i, 1);
            continue;
        }

        if (p.type === 'ice' && Math.random() > 0.3) {
            spawnIceTrail(p.x - (p.vx > 0 ? 12 : -12), p.y + (Math.random() * 10 - 5), Math.random() > 0.6);
        }

        let hit = false;
        for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j];
            if (e.dead) continue;

            const isTarget = p.target && p.target === e;
            const radX = isTarget ? 95 : 60;
            const radY = isTarget ? 75 : 50;
            let canHit = false;

            if (isTarget) {
                const d = Math.hypot(p.x - e.x, p.y - e.laneY);
                if (d < 90) canHit = true;
                else if (Math.abs(p.y - e.laneY) < radY && Math.abs(p.x - e.x) < radX) canHit = true;
            } else {
                if (Math.abs(p.y - e.laneY) < radY && Math.abs(p.x - e.x) < radX) canHit = true;
            }

            if (canHit) {
                const wasFrozen = e.frozen > 0;
                if (wasFrozen) {
                    e.health -= 65;
                    spawnText(e.x, e.laneY - 32, 'SHATTER! +150', '#a5f3ff');
                    score += 180;
                    camera.shake = 16;
                    spawnIceShatter(e.x, e.laneY - 18, 14, true);
                    for (let g = 0; g < 6; g++) {
                        spawnIceTrail(e.x, e.laneY - 12, true);
                    }
                    if (e.health <= 0 || e.health / e.maxHealth < 0.5) {
                        e.dead = true;
                        e.deadTimer = 0;
                        enemiesDefeated++;
                        score += 120;
                        spawnText(e.x, e.laneY - 48, 'SHATTER KO!', '#ffd700');
                    } else {
                        e.frozen = 0;
                    }
                } else {
                    e.frozen = 3500;
                    e.health -= 12;
                    spawnText(e.x, e.laneY - 20, 'CONGELADO', '#7ef0ff');
                    camera.shake = 6;
                    spawnIceShatter(e.x, e.laneY - 18, 8, false, true);
                    for (let s = 0; s < 6; s++) {
                        spawnIceShatter(p.x, p.y, 1);
                    }
                    spawnFrostDecal(e.x, e.laneY);
                    if (e.health <= 0) {
                        e.dead = true;
                        e.deadTimer = 0;
                        enemiesDefeated++;
                        score += 100;
                    }
                }
                hit = true;
                break;
            }
        }

        if (!hit && boss && !boss.dead) {
            if (Math.abs(p.y - boss.laneY) < 60 && Math.abs(p.x - boss.x) < 70) {
                const wasFrozen = boss.frozen > 0;
                if (wasFrozen) {
                    boss.health -= 30;
                    score += 150;
                    camera.shake = 12;
                    spawnText(boss.x, boss.laneY - 30, 'SHATTER!', '#a5f3ff');
                    spawnIceShatter(boss.x, boss.laneY - 20, 10);
                } else {
                    boss.frozen = 2500;
                    boss.health -= 12;
                    camera.shake = 6;
                    for (let s = 0; s < 6; s++) {
                        spawnIceShatter(p.x, p.y, 1);
                    }
                    spawnFrostDecal(boss.x, boss.laneY);
                }
                if (boss.health <= 0) {
                    boss.dead = true;
                    score += 500;
                }
                hit = true;
            }
        }

        if (hit) {
            projectiles.splice(i, 1);
            continue;
        }

        if (p.x < camera.x - 100 || p.x > camera.x + canvas.width + 100) {
            projectiles.splice(i, 1);
        }
    }

    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const bp = bossProjectiles[i];
        bp.x += bp.vx * (typeof GAME_SPEED !== 'undefined' ? GAME_SPEED : 1);
        bp.life -= 16;

        if (!bp.hit && Math.abs(bp.x - player.x) < 24 && Math.abs(bp.y - (playerEffY() - 45)) < 34) {
            bp.hit = true;
            player.health -= 10;
            player.hitTimer = 300;
            player.hurtFlash = 220;
            spawnText(player.x, playerLaneY - 40, '-10', '#ff4444');
            camera.shake = 8;
        }

        if (bp.life <= 0 || bp.x < camera.x - 150 || bp.x > camera.x + canvas.width + 150) {
            bossProjectiles.splice(i, 1);
        }
    }
}

// --- INICIALIZAR SPRITES DE KANO ---
(function() {
    for (let key in KANO_SPRITE_CONFIG) {
        const img = new Image();
        img.onload = function() {
            img.ok = true;
            if (!window.__kanoNormSet && key === 'idle') {
                window.KANO_NORM = 280 / img.height;
                window.__kanoNormSet = true;
            }
        };
        img.onerror = function() {
            img.ok = false;
        };
        img.src = KANO_SPRITE_BASE + KANO_SPRITE_CONFIG[key].file;
        kanoSprites[key] = img;
    }
})();

console.log('✅ enemies.js cargado');