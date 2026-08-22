// ============================================================
// JUGADOR - Movimiento, combate, habilidades (SOLO FUNCIONES)
// ============================================================

// --- FUNCIONES DE COMBATE ---
function tryPunch() {
    if (player.isIceAttacking || player.isPunching || player.isKicking) return;
    if (!player.grounded) {
        player.isPunching = true;
        player.anim = "punch_air";
        player.frame = 0;
        player.frameTime = 0;
        player.attackHit = false;
        player.punchTimer = 0;
        return;
    }
    player.isPunching = true;
    player.anim = "punch";
    player.frame = 0;
    player.frameTime = 0;
    player.attackHit = false;
    player.punchTimer = 0;
}

function tryKick() {
    if (player.isIceAttacking || player.isPunching || player.isKicking) return;
    if (!player.grounded) {
        player.isKicking = true;
        player.anim = "kick_air";
        player.frame = 0;
        player.frameTime = 0;
        player.kickHit = false;
        player.kickTimer = 0;
        return;
    }
    player.isKicking = true;
    player.anim = "kick";
    player.frame = 0;
    player.frameTime = 0;
    player.kickHit = false;
    player.kickTimer = 0;
}

function tryJump() {
    if (player.isIceAttacking || !player.grounded) return;
    if (player.landingTimer > 0) return;
    player.grounded = false;
    player.vy = JUMP_FORCE * JUMP_POWER;
    player.jumpOffset = -2;
    player.frame = 0;
    player.frameTime = 0;
    player.anim = 'jump';
}

function tryIce() {
    if (player.isIceAttacking || player.isPunching || player.isKicking || !player.grounded) return;
    player.isIceAttacking = true;
    player.anim = 'ice_attack';
    player.frame = 0;
    player.frameTime = 0;
    player.iceAttackTimer = 0;
    player.iceShotFired = false;
    if (!player.iceTarget) player.iceTarget = findIceTarget();
}

// --- HIELO ---
function findIceTarget() {
    const candidates = getIceCandidates();
    return candidates.length > 0 ? candidates[0] : null;
}

function getIceCandidates() {
    const list = [];
    if (!enemies || enemies.length === 0) return list;
    const px = player.x;
    const py = playerLaneY;
    const dir = player.facingRight ? 1 : -1;
    
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || e.frozen > 0) continue;
        const dx = e.x - px;
        if (dir > 0 && dx < 10) continue;
        if (dir < 0 && dx > -10) continue;
        if (Math.abs(dx) > 620) continue;
        if (Math.abs(e.laneY - py) > 90) continue;
        const dist = Math.abs(dx) + Math.abs(e.laneY - py) * 0.6;
        list.push({ e: e, dist: dist });
    }
    list.sort((a, b) => a.dist - b.dist);
    return list.map(o => o.e);
}

function cycleIceTarget(dir) {
    const candidates = getIceCandidates();
    if (candidates.length === 0) { player.iceTarget = null; return; }
    if (!player.iceTarget) { player.iceTarget = candidates[0]; return; }
    let idx = candidates.indexOf(player.iceTarget);
    if (idx === -1) { player.iceTarget = candidates[0]; return; }
    idx = (idx + dir + candidates.length) % candidates.length;
    player.iceTarget = candidates[idx];
    spawnText(player.iceTarget.x, player.iceTarget.laneY - 50, '❄ TARGET ❄', '#7ef0ff');
}

function selectIceTargetAt(worldX, worldY) {
    if (!enemies) return false;
    let best = null;
    let bestDist = 70;
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || e.frozen > 0) continue;
        const dx = e.x - worldX;
        const dy = e.laneY - worldY;
        const d = Math.hypot(dx, dy);
        if (d < bestDist) { bestDist = d; best = e; }
    }
    if (best) {
        player.iceTarget = best;
        spawnText(best.x, best.laneY - 50, '❄ ELEGIDO ❄', '#e0fbff');
        return true;
    }
    return false;
}

function fireIceProjectile() {
    const gScale = typeof PLAYER_GLOBAL_SCALE !== 'undefined' ? PLAYER_GLOBAL_SCALE : 1;
    const pScale = typeof PLAYER_SCALE !== 'undefined' ? PLAYER_SCALE : 1;
    const sc = (1 - ((laneBottom - playerLaneY) / Math.max(1, laneBottom - laneTop)) * 0.12) * pScale;
    const al = ICE_ALIGN.loaded;
    
    const px = player.x + (player.facingRight ? 1 : -1) * (al.x * gScale) * sc;
    const py = playerEffY() + (al.y * gScale);
    
    const target = player.iceTarget || null;
    let vx = (player.facingRight ? 1 : -1) * (typeof ICE_SPEED !== 'undefined' ? ICE_SPEED : 7.5);
    let vy = 0;
    
    if (target && !target.dead && target.frozen <= 0) {
        const dx = target.x - px;
        const dy = target.laneY - py;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 560) {
            const speed = typeof ICE_SPEED !== 'undefined' ? ICE_SPEED : 7.5;
            vx = (dx / dist) * speed;
            vy = (dy / dist) * speed * 0.55;
        }
    }
    
    const baseR = (typeof ICE_ALIGN !== 'undefined' && ICE_ALIGN.ballRadius) ? ICE_ALIGN.ballRadius : 13;
    const r = baseR * gScale;
    
    projectiles.push({
        x: px,
        y: py,
        vx: vx,
        vy: vy,
        type: 'ice',
        life: 3000,
        homing: target ? true : false,
        target: target,
        r: r,
        trail: []
    });
    
    spawnText(player.x, playerLaneY - 20, 'HIELO!', '#7ef0ff');
}

// --- ACTUALIZAR JUGADOR ---
function updatePlayer() {
    if (player.isPunching) {
        player.punchTimer = (player.punchTimer || 0) + 16;
        if (player.punchTimer > 400) {
            player.isPunching = false;
            player.anim = 'idle';
            player.frame = 0;
            player.punchTimer = 0;
            player.attackHit = false;
        }
    } else {
        player.punchTimer = 0;
    }

    if (player.isKicking) {
        player.kickTimer = (player.kickTimer || 0) + 16;
        if (player.kickTimer > 450) {
            player.isKicking = false;
            player.anim = 'idle';
            player.frame = 0;
            player.kickTimer = 0;
            player.kickHit = false;
        }
    } else {
        player.kickTimer = 0;
    }

    if (player.isIceAttacking) {
        const iceCfg = SPRITE_CONFIG['ice_attack'];
        const iceSpd = iceCfg ? iceCfg.speed : 120;
        if (player.frameTime > iceSpd) {
            player.frameTime = 0;
            player.frame++;
            if (player.frame === 2 && !player.iceShotFired) {
                fireIceProjectile();
                player.iceShotFired = true;
            }
            if (player.frame >= iceCfg.frames) {
                player.isIceAttacking = false;
                player.anim = 'idle';
                player.frame = 0;
                player.frameTime = 0;
            }
        }
    }

    if (!player.isIceAttacking) {
        if (player.anim === 'jump') {
            player.frameTime = (player.frameTime || 0) + 16;
            if (player.frameTime > 60) {
                player.frameTime = 0;
                if (player.frame < 11) player.frame++;
            }
        } else {
            player.frameTime = (player.frameTime || 0) + 16;
            const cfg = SPRITE_CONFIG[player.anim];
            const spd = cfg ? cfg.speed : 120;
            if (player.frameTime > spd) {
                player.frameTime = 0;
                player.frame++;
                const frames = cfg ? cfg.frames : 4;
                if (player.frame >= frames) {
                    if (player.anim === 'punch' || player.anim === 'kick' || 
                        player.anim === 'punch_air' || player.anim === 'kick_air') {
                        player.frame = frames - 1;
                    } else {
                        player.frame = 0;
                    }
                }
            }
        }
    }

    detectHits();
}

function detectHits() {
    if (!player.isPunching && !player.isKicking) return;
    
    const isPunch = player.isPunching;
    const alreadyHit = isPunch ? player.attackHit : player.kickHit;
    const timer = isPunch ? (player.punchTimer || 0) : (player.kickTimer || 0);
    
    if (!alreadyHit && timer > 80 && timer < 420) {
        const rangeX = isPunch ? 100 : 115;
        const rangeY = isPunch ? 80 : 95;
        const dmg = isPunch ? 14 : 20;
        
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.dead) continue;
            
            const dx = e.x - player.x;
            const dy = e.laneY - playerEffY();
            if (Math.abs(dy) > rangeY) continue;
            
            const inFront = player.facingRight ? (dx > 8 && dx < rangeX) : (dx < -8 && dx > -rangeX);
            if (!inFront) continue;
            
            const isFrozen = e.frozen > 0;
            const finalDmg = isFrozen ? (dmg + 50) : dmg;
            
            if (isFrozen) {
                if (e.health > 0 && e.maxHealth > 0 && e.health / e.maxHealth < 0.55) {
                    e.health = 0;
                }
                e.frozen = 0;
                spawnText(e.x, e.laneY - 38, 'SHATTER! -' + finalDmg, '#a5f3ff');
                camera.shake = 14;
                score += 120;
                spawnIceShatter(e.x, e.laneY - 18, 12, true);
                for (let g = 0; g < 5; g++) {
                    spawnIceTrail(e.x, e.laneY - 12, true);
                }
            } else {
                spawnText(e.x, e.laneY - 22, '-' + finalDmg, '#ff4444');
            }
            
            e.health -= finalDmg;
            e.hitTimer = isFrozen ? 140 : 320;
            e.frame = 0;
            e.frameTime = 0;
            e.x += player.facingRight ? (isFrozen ? 28 : 14) : (isFrozen ? -28 : -14);
            
            if (isPunch) player.attackHit = true;
            else player.kickHit = true;
            
            if (e.health <= 0) {
                e.dead = true;
                e.deadTimer = 0;
                enemiesDefeated++;
                score += (e.type === 'thug_gun' ? 120 : 100);
                spawnText(e.x, e.laneY - 40, e.frozen > 0 ? 'SHATTER KO!' : 'KO!', '#ffd700');
                if (isFrozen) {
                    spawnIceShatter(e.x, e.laneY - 18, 10);
                }
            }
            break;
        }
        
        if (boss && !boss.dead) {
            const bdx = boss.x - player.x;
            const bdy = boss.laneY - playerEffY();
            if (Math.abs(bdy) <= rangeY + 8) {
                const bInFront = player.facingRight ? (bdx > 10 && bdx < rangeX + 12) : (bdx < -10 && bdx > -(rangeX + 12));
                if (bInFront && !alreadyHit) {
                    boss.health -= dmg * 0.7;
                    boss.hitTimer = 300;
                    spawnText(boss.x, boss.laneY - 30, '-' + Math.round(dmg * 0.7), '#ff8800');
                    if (isPunch) player.attackHit = true;
                    else player.kickHit = true;
                    if (boss.health <= 0) {
                        boss.dead = true;
                        score += 500;
                    }
                }
            }
        }
    }
}

// --- INICIALIZAR JUGADOR ---
player = {
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

console.log('✅ player.js cargado');