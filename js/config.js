// Configuración de sprites del jugador
const SPRITE_CONFIG = {
    idle: { file: "idle.png", frames: 4, cols: 4, speed: 130, scaleX: 1.55, scaleY: 1.75, anchorX: 0, anchorY: -2 },
    walk: { file: "walk.png", frames: 10, cols: 5, speed: 70, scaleX: 1.85, scaleY: 1.80, anchorX: 1, anchorY: -1 },
    punch: { file: "punch.png", frames: 4, cols: 4, speed: 100, scaleX: 3.50, scaleY: 2.40, anchorX: 14, anchorY: 32 },
    kick: { file: "kick.png", frames: 4, cols: 4, speed: 100, scaleX: 3.50, scaleY: 2.40, anchorX: 9, anchorY: 33 },
    jump: { file: "jump.png", frames: 12, cols: 4, rows: 3, speed: 155, scaleX: 2.65, scaleY: 2.15, anchorX: 0, anchorY: 1, integerFrames: true },
    ice_attack: { file: "ice_attack.png", frames: 4, cols: 4, speed: 120, scaleX: 2.00, scaleY: 1.80, anchorX: 0, anchorY: 0 },
    punch_air: { file: "punch_air.png", frames: 1, cols: 1, speed: 350, scaleX: 1.80, scaleY: 1.60, anchorX: 13, anchorY: 5 },
    kick_air: { file: "kick_air.png", frames: 1, cols: 1, speed: 350, scaleX: 2.00, scaleY: 1.70, anchorX: 15, anchorY: 0 },
};

// Configuración de la bola de hielo
let ICE_ALIGN = {
    loaded: { x: 15.1725, y: -105.4, scale: 1 },
    ballRadius: 14
};

// Constantes físicas
const GRAVITY = 0.78;
const JUMP_FORCE = -14.5;
const JUMP_POWER = 1.25;
const ICE_SPEED = 7.5;

// Niveles
const LEVELS = [
    // ... todos los niveles (copia del HTML)
];

// Configuraciones de enemigos
const ENEMY_SPRITE_CONFIG = {
    // ... configuración de sprites de enemigos
};

const ENEMY_CONFIGS = {
    // ... stats de enemigos
};

const BOSS_CONFIGS = {
    // ... stats de jefes
};
