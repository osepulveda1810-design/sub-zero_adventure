// ============================================================
// FÍSICA - Gravedad, colisiones, movimiento
// ============================================================

// --- Todas las variables físicas vienen de config.js (window.*) ---

// --- ACTUALIZAR FÍSICA DEL JUGADOR ---
function updatePlayerPhysics() {
    if (!window.player) {
        return false;
    }
    
    // Gravedad
    if (!window.player.grounded) {
        window.player.vy += window.GRAVITY;
        window.player.jumpOffset += window.player.vy;
        if (window.player.jumpOffset >= 0) {
            window.player.jumpOffset = 0;
            window.player.vy = 0;
            window.player.grounded = true;
            window.player.landingTimer = 180;
        }
    } else if (window.player.landingTimer > 0) {
        window.player.landingTimer -= 16;
    }
    
    let moving = false;
    // Movimiento solo si no está atacando
    if (!window.player.isIceAttacking && !window.player.isPunching && !window.player.isKicking) {
        if (window.keys.right) {
            window.player.x += window.player.speed;
            window.player.facingRight = true;
            moving = true;
        }
        if (window.keys.left) {
            window.player.x -= window.player.speed;
            window.player.facingRight = false;
            moving = true;
        }
        if (window.player.grounded) {
            if (window.keys.up) {
                window.playerLaneY = Math.max(window.laneTop, window.playerLaneY - window.player.speed * 0.6);
                moving = true;
            }
            if (window.keys.down) {
                window.playerLaneY = Math.min(window.laneBottom, window.playerLaneY + window.player.speed * 0.6);
                moving = true;
            }
        }
    }
    
    // Colisiones con enemigos (simplificado)
    const prevX = window.player.x;
    const prevY = window.playerLaneY;
    
    if (window.enemies && window.enemies.length > 0) {
        for (let i = 0; i < window.enemies.length; i++) {
            const e = window.enemies[i];
            if (e.isDummy || !e || e.dead) continue;
            
            const dx = window.player.x - e.x;
            const dy = e.laneY - playerEffY();
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const minX = 64;
            const minY = 32;
            
            if (absDx < minX && absDy < minY) {
                if (e.attacking || e.hitTimer > 0 || e.frozen > 0) {
                    if (absDx < minX && absDx >= minY) {
                        if (dx > 0) window.player.x = e.x + minX;
                        else window.player.x = e.x - minX;
                    }
                    if (absDy < minY) {
                        if (dy > 0) window.playerLaneY = e.laneY + minY;
                        else window.playerLaneY = e.laneY - minY;
                    }
                } else {
                    const overlapX = minX - absDx;
                    const overlapY = minY - absDy;
                    if (overlapX < overlapY) {
                        if (dx > 0) window.player.x += overlapX * 0.6;
                        else window.player.x -= overlapX * 0.6;
                    } else {
                        if (dy > 0) window.playerLaneY += overlapY * 0.6;
                        else window.playerLaneY -= overlapY * 0.6;
                    }
                    if (Math.abs(window.player.x - e.x) < 52 && Math.abs(window.playerLaneY - e.laneY) < 28) {
                        window.player.x = prevX;
                        window.playerLaneY = prevY;
                        break;
                    }
                }
            }
        }
    }
    
    // Limitar movimiento
    const cw = window.canvas ? window.canvas.width : 800;
    const minX = window.camera.x + 55;
    const maxX = window.camera.x + cw - 75;
    if (window.player.x < minX) window.player.x = minX;
    if (window.player.x > maxX) window.player.x = maxX;
    if (window.player.x < 20) window.player.x = 20;
    if (window.player.x > window.camera.worldWidth - 60) window.player.x = window.camera.worldWidth - 60;
    
    return moving;
}

// --- FUNCIÓN playerEffY (necesaria para colisiones) ---
function playerEffY() {
    return window.playerLaneY + (window.player ? window.player.jumpOffset || 0 : 0);
}

// --- FUNCIONES DE COLISIÓN ---
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

console.log('✅ physics.js cargado correctamente');