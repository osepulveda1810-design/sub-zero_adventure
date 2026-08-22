// ============================================================
// UTILIDADES - Funciones auxiliares para todo el juego
// ============================================================

// Variables globales para efectos visuales
let floatingTexts = [];
let particles = [];
let iceTrails = [];
let iceShatters = [];
let frostDecals = [];

// Spawn de texto flotante
function spawnText(x, y, text, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color || '#fff',
        timer: 0,
        life: 800,
        vy: -1.2
    });
}

// Spawn de partículas
function spawnParticles(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 10,
                       y: y + (Math.random() - 0.5) * 10,
                       vx: (Math.random() - 0.5) * 6,
                       vy: (Math.random() - 0.5) * 6 - 1,
                       life: 300 + Math.random() * 300,
                       maxLife: 600,
                       color: color || '#7ef0ff',
                       size: 2 + Math.random() * 4,
                       decay: 0.95 + Math.random() * 0.04
        });
    }
}

// Spawn de esquirlas de hielo
function spawnIceShatter(x, y, count = 8, gold = false, cyan = false) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        iceShatters.push({
            x: x + (Math.random() - 0.5) * 10,
                         y: y + (Math.random() - 0.5) * 10,
                         vx: Math.cos(angle) * speed,
                         vy: Math.sin(angle) * speed - Math.random() * 2,
                         life: 300 + Math.random() * 300,
                         maxLife: 600,
                         rot: Math.random() * Math.PI * 2,
                         vr: (Math.random() - 0.5) * 0.3,
                         size: 2 + Math.random() * 4,
                         gold: gold || false,
                         cyan: cyan || false
        });
    }
}

// Spawn de rastro de hielo
function spawnIceTrail(x, y, gold = false) {
    iceTrails.push({
        x: x + (Math.random() - 0.5) * 6,
                   y: y + (Math.random() - 0.5) * 6,
                   vx: (Math.random() - 0.5) * 1.5,
                   vy: (Math.random() - 0.5) * 1.5 - 0.5,
                   life: 200 + Math.random() * 200,
                   maxLife: 400,
                   size: 2 + Math.random() * 3,
                   gold: gold || false
    });
}

// Spawn de decal de escarcha en el suelo
function spawnFrostDecal(x, y, size = 36) {
    frostDecals.push({
        x: x,
        y: y,
        life: 2800,
        maxLife: 2800,
        size: size + Math.random() * 18
    });
}

// Actualizar partículas
function updateParticles() {
    // Actualizar textos flotantes
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.timer += 16;
        ft.y += ft.vy;
        if (ft.timer >= ft.life) {
            floatingTexts.splice(i, 1);
        }
    }

    // Actualizar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 16;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Actualizar trails de hielo
    for (let i = iceTrails.length - 1; i >= 0; i--) {
        const t = iceTrails[i];
        t.x += t.vx;
        t.y += t.vy;
        t.vy += 0.08;
        t.life -= 16;
        if (t.life <= 0) {
            iceTrails.splice(i, 1);
        }
    }

    // Actualizar esquirlas de hielo
    for (let i = iceShatters.length - 1; i >= 0; i--) {
        const sh = iceShatters[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.vy += 0.18;
        sh.rot += sh.vr;
        sh.life -= 16;
        if (sh.life <= 0) {
            iceShatters.splice(i, 1);
        }
    }

    // Actualizar decals de escarcha
    for (let i = frostDecals.length - 1; i >= 0; i--) {
        const f = frostDecals[i];
        f.life -= 16;
        if (f.life <= 0) {
            frostDecals.splice(i, 1);
        }
    }
}

// Función para obtener la posición efectiva del jugador (con salto)
function playerEffY() {
    return playerLaneY + (player.jumpOffset || 0);
}

// Función para obtener el mundo X a partir de la cámara
function worldToScreenX(worldX) {
    return worldX - camera.x;
}

// Función para obtener el mundo Y a partir de la cámara
function worldToScreenY(worldY) {
    return worldY;
}

// Helper para dibujar un rectángulo con esquinas redondeadas
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
