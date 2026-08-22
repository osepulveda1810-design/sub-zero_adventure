// ============================================================
// FÍSICA - Gravedad, colisiones, movimiento (SOLO FUNCIONES)
// ============================================================

let GAME_SPEED = 0.4;
let DIST_STOP = 45;
let DIST_DMG = 45;
let DIST_BODY = 50;

// --- ACTUALIZAR FÍSICA DEL JUGADOR ---
function updatePlayerPhysics() {
    if (!player.grounded) {
        player.vy += GRAVITY;
        player.jumpOffset += player.vy;
        if (player.jumpOffset >= 0) {
            player.jumpOffset = 0;
            player.vy = 0;
            player.grounded = true;
            player.landingTimer = 180;
        }
    } else if (player.landingTimer > 0) {
        player.landingTimer -= 16;
    }
    
    let moving = false;
    if (!player.isIceAttacking && !player.isPunching && !player.isKicking) {
        if (keys.right) {
            player.x += player.speed;
            player.facingRight = true;
            moving = true;
        }
        if (keys.left) {
            player.x -= player.speed;
            player.facingRight = false;
            moving = true;
        }
        if (player.grounded) {
            if (keys.up) {
                playerLaneY = Math.max(laneTop, playerLaneY - player.speed * 0.6);
                moving = true;
            }
            if (keys.down) {
                playerLaneY = Math.min(laneBottom, playerLaneY + player.speed * 0.6);
                moving = true;
            }
        }
    }
    
    const prevX = player.x;
    const prevY = playerLaneY;
    
    if (enemies && enemies.length > 0) {
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.isDummy || !e || e.dead) continue;
            
            const dx = player.x - e.x;
            const dy = e.laneY - playerEffY();
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const minX = 64;
            const minY = 32;
            
            if (absDx < minX && absDy < minY) {
                if (e.attacking || e.hitTimer > 0 || e.frozen > 0) {
                    if (absDx < minX && absDx >= minY) {
                        if (dx > 0) player.x = e.x + minX;
                        else player.x = e.x - minX;
                    }
                    if (absDy < minY) {
                        if (dy > 0) playerLaneY = e.laneY + minY;
                        else playerLaneY = e.laneY - minY;
                    }
                } else {
                    const overlapX = minX - absDx;
                    const overlapY = minY - absDy;
                    if (overlapX < overlapY) {
                        if (dx > 0) player.x += overlapX * 0.6;
                        else player.x -= overlapX * 0.6;
                    } else {
                        if (dy > 0) playerLaneY += overlapY * 0.6;
                        else playerLaneY -= overlapY * 0.6;
                    }
                    if (Math.abs(player.x - e.x) < 52 && Math.abs(playerLaneY - e.laneY) < 28) {
                        player.x = prevX;
                        playerLaneY = prevY;
                        break;
                    }
                }
            }
        }
    }
    
    const cw = canvas.width;
    const minX = camera.x + 55;
    const maxX = camera.x + cw - 75;
    if (player.x < minX) player.x = minX;
    if (player.x > maxX) player.x = maxX;
    if (player.x < 20) player.x = 20;
    if (player.x > camera.worldWidth - 60) player.x = camera.worldWidth - 60;
    
    return moving;
}

// --- COLISIONES ---
function rectCollision(a, b) {
    return a.x - a.width / 2 < b.x + b.width / 2 &&
        a.x + a.width / 2 > b.x - b.width / 2 &&
        a.y - a.height / 2 < b.y + b.height / 2 &&
        a.y + a.height / 2 > b.y - b.height / 2;
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    return dist < r1 + r2;
}

function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w &&
        py >= rect.y && py <= rect.y + rect.h;
}

console.log('✅ physics.js cargado');