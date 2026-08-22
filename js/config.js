// ============================================================
// CONFIGURACIÓN GLOBAL - Solo configuraciones
// ============================================================

// --- SPRITES DEL JUGADOR ---
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

// --- CONFIGURACIÓN DE LA BOLA DE HIELO ---
let ICE_ALIGN = {
    loaded: { x: 15.1725, y: -105.4, scale: 1 },
    ballRadius: 14
};

// --- RUTAS DE SPRITES ---
const SPRITE_BASE = "assets/sprites/player/";
const ENEMY_SPRITE_BASE = "assets/sprites/enemies/";
const KANO_SPRITE_BASE = 'assets/sprites/enemies/kano/';

// --- VARIABLES DE REFERENCIA (configuración) ---
let FLOOR_REF_OFFSET = 32;
let TOP_LIMIT_OFFSET = 0;
let LANE_BOTTOM_RATIO = 0.90;
let HITBOX_W = 44;
let HITBOX_H = 96;
let PLAYER_GLOBAL_SCALE = 0.85;
let PLAYER_SCALE = 1.8;
let baseDrawWidth = 90;
let baseDrawHeight = 110;
let laneTop = 180;
let laneBottom = 360;
let playerLaneY = 360;

// --- CONSTANTES FÍSICAS ---
const GRAVITY = 0.78;
const JUMP_FORCE = -14.5;
const JUMP_POWER = 1.25;
const ICE_SPEED = 7.5;

// --- NIVELES ---
const LEVELS = [
    { id: 0, name: "🎨 MODO EDICION", subtitle: "Laboratorio sin enemigos", boss: "Ninguno", bossTitle: "Modo Seguro", story: "Dojo privado para probar sprites sin enemigos.", bgColor: [12, 14, 28], groundColor: [35, 40, 55], enemyTypes: [], enemyCount: 0, isEditor: true },
    { id: 1, name: "Calles de la Ciudad", subtitle: "El Frio Amanece", boss: "Kano", bossTitle: "Lider del Dragon Negro", story: "Tras la muerte de tu hermano Bi-Han, descubres que mercenarios del Dragon Negro secuestran civiles para experimentos del clan Lin Kuei. Debes detenerlos.", bgColor: [15, 20, 35], groundColor: [40, 45, 60], enemyTypes: ['thug', 'thug_gun', 'ninja_renegade'], enemyCount: 12 },
    { id: 2, name: "Fabrica Abandonada", subtitle: "El Frio de la Maquina", boss: "Sektor", bossTitle: "Ciborg del Lin Kuei", story: "Rastreas los secuestros hasta una fabrica donde el Lin Kuei transforma a sus miembros en ciborgs asesinos. Sektor te espera.", bgColor: [25, 20, 15], groundColor: [55, 50, 40], enemyTypes: ['cyborg_basic', 'technician', 'sektor_miniboss'], enemyCount: 13 },
    { id: 3, name: "Templo Shaolin", subtitle: "Sangre sobre los Sagrados", boss: "Baraka", bossTitle: "Guerrero Tarkatano", story: "Los monjes shaolin son masacrados por Tarkatanos de Outworld.", bgColor: [30, 25, 20], groundColor: [80, 70, 50], enemyTypes: ['monk_renegade', 'tarkatan', 'priest_quan'], enemyCount: 14 },
    { id: 4, name: "El Pantano", subtitle: "Niebla Traicionera", boss: "Reptile", bossTitle: "Espia Saurio", story: "Sigues el rastro del mapa robado hasta un pantano tenebroso.", bgColor: [15, 25, 15], groundColor: [35, 55, 30], enemyTypes: ['zombie', 'reptile_mutant', 'shadow_ghost'], enemyCount: 14 },
    { id: 5, name: "Fortaleza del Dragon Negro", subtitle: "Corazon de la Traicion", boss: "Cyrax", bossTitle: "Ciborg Tragico", story: "Descubres que Kano no actuaba solo.", bgColor: [35, 15, 10], groundColor: [60, 30, 20], enemyTypes: ['soldier_elite', 'cyborg_upgrade', 'assassin_lk'], enemyCount: 14 },
    { id: 6, name: "Costa de Outworld", subtitle: "Puerta al Infierno", boss: "Goro", bossTitle: "Principe Shokan", story: "Cruzas a Outworld para enfrentar al verdadero villano.", bgColor: [45, 20, 35], groundColor: [70, 40, 55], enemyTypes: ['shokan', 'sindel_priest', 'shadow_knight'], enemyCount: 15 },
    { id: 7, name: "Templo de la Oscuridad", subtitle: "Alma Corrupta", boss: "Shang Tsung", bossTitle: "Hechicero de Almas", story: "Shang Tsung roba almas para abrir el portal.", bgColor: [20, 10, 30], groundColor: [50, 40, 60], enemyTypes: ['spectre', 'demon_quan', 'statue'], enemyCount: 15 },
    { id: 8, name: "Infierno de Quan Chi", subtitle: "El Final del Linaje", boss: "Noob Saibot", bossTitle: "La Sombra de Bi-Han", story: "Tu hermano ha vuelto como espectro. Debes liberarlo.", bgColor: [30, 10, 10], groundColor: [50, 15, 10], enemyTypes: ['demon_lord', 'shadow_clone', 'hell_beast'], enemyCount: 16 }
];

// --- CONFIGURACIÓN DE ENEMIGOS ---
const ENEMY_CONFIGS = {
    thug: { name: "Maton", health: 60, damage: 5, speed: 2.0, color: '#8B4513', height: 50, width: 40 },
    thug_gun: { name: "Maton Armado", health: 50, damage: 8, speed: 1.8, color: '#556B2F', height: 50, width: 40 },
    ninja_renegade: { name: "Ninja Renegado", health: 68, damage: 7, speed: 2.45, color: '#2F4F4F', height: 52, width: 36 },
    cyborg_basic: { name: "Ciborg LK", health: 60, damage: 7, speed: 1.9, color: '#708090', height: 60, width: 44 },
    technician: { name: "Tecnico", health: 50, damage: 4, speed: 1.7, color: '#4682B4', height: 48, width: 36 },
    sektor_miniboss: { name: "Sektor Mini", health: 100, damage: 10, speed: 1.6, color: '#DC143C', height: 65, width: 46 },
    monk_renegade: { name: "Monje Corrupto", health: 65, damage: 6, speed: 1.9, color: '#8B6914', height: 52, width: 40 },
    tarkatan: { name: "Tarkatano", health: 75, damage: 10, speed: 1.7, color: '#8B0000', height: 58, width: 42 },
    priest_quan: { name: "Sacerdote Oscuro", health: 60, damage: 8, speed: 1.8, color: '#4B0082', height: 50, width: 38 },
    zombie: { name: "Zombi", health: 70, damage: 8, speed: 1.2, color: '#556B2F', height: 55, width: 42 },
    reptile_mutant: { name: "Reptil Mutante", health: 70, damage: 7, speed: 2.0, color: '#228B22', height: 52, width: 40 },
    shadow_ghost: { name: "Sombra Espectral", health: 60, damage: 9, speed: 1.9, color: '#483D8B', height: 60, width: 36 },
    soldier_elite: { name: "Soldado Elite", health: 65, damage: 9, speed: 1.8, color: '#2F4F4F', height: 58, width: 44 },
    cyborg_upgrade: { name: "Ciborg MK-II", health: 80, damage: 10, speed: 1.6, color: '#696969', height: 62, width: 46 },
    assassin_lk: { name: "Asesino LK", health: 75, damage: 12, speed: 2.0, color: '#191970', height: 55, width: 40 },
    shokan: { name: "Guerrero Shokan", health: 100, damage: 14, speed: 1.3, color: '#8B4513', height: 80, width: 55 },
    sindel_priest: { name: "Sacerdotisa", health: 65, damage: 10, speed: 1.7, color: '#9370DB', height: 55, width: 40 },
    shadow_knight: { name: "Caballero Sombra", health: 85, damage: 12, speed: 1.5, color: '#2C2C2C', height: 65, width: 48 },
    spectre: { name: "Espectro", health: 75, damage: 11, speed: 1.8, color: '#7B68EE', height: 58, width: 38 },
    demon_quan: { name: "Demonio", health: 80, damage: 13, speed: 1.6, color: '#DC143C', height: 65, width: 44 },
    statue: { name: "Estatua Animada", health: 120, damage: 15, speed: 0.9, color: '#808080', height: 75, width: 50 },
    demon_lord: { name: "Senor Demonio", health: 110, damage: 16, speed: 1.4, color: '#8B0000', height: 75, width: 50 },
    shadow_clone: { name: "Clon de Sombra", health: 70, damage: 12, speed: 1.9, color: '#000000', height: 58, width: 40 },
    hell_beast: { name: "Bestia del Infierno", health: 130, damage: 18, speed: 1.3, color: '#FF4500', height: 70, width: 54 }
};

// --- CONFIGURACIÓN DE JEFES ---
const BOSS_CONFIGS = {
    "Kano": { health: 220, damage: 8, speed: 30.2, color: '#FFD700', height: 80, width: 52 },
    "Sektor": { health: 300, damage: 10, speed: 30.0, color: '#DC143C', height: 85, width: 54 },
    "Baraka": { health: 380, damage: 12, speed: 30.5, color: '#8B0000', height: 78, width: 48 },
    "Reptile": { health: 340, damage: 10, speed: 30.8, color: '#228B22', height: 75, width: 46 },
    "Cyrax": { health: 420, damage: 14, speed: 30.3, color: '#FFD700', height: 82, width: 52 },
    "Goro": { health: 600, damage: 18, speed: 30.8, color: '#8B4513', height: 110, width: 72 },
    "Shang Tsung": { health: 520, damage: 15, speed: 30.0, color: '#4B0082', height: 85, width: 54 },
    "Noob Saibot": { health: 750, damage: 20, speed: 30.4, color: '#000000', height: 85, width: 54 }
};

// --- SPRITES DE ENEMIGOS ---
const ENEMY_SPRITE_CONFIG = {
    ninja_renegade: {
        idle: { file: "idle.png", frames: 4, cols: 4, speed: 160, scaleX: 1.90, scaleY: 2.00, anchorX: -80, anchorY: 10 },
        walk: { file: "walk.png", frames: 10, cols: 5, speed: 70, scaleX: 1.40, scaleY: 1.75, anchorX: -59, anchorY: -4 },
        attack: { file: "attack.png", frames: 4, cols: 4, speed: 75, scaleX: 2.20, scaleY: 2.30, anchorX: -80, anchorY: 26 },
        hit: { file: "hit.png", frames: 3, cols: 3, speed: 100, scaleX: 2.05, scaleY: 2.10, anchorX: -80, anchorY: 16 },
        frozen: { file: "frozen.png", frames: 1, cols: 1, speed: 360, scaleX: 1.85, scaleY: 1.90, anchorX: -80, anchorY: -8 },
        dead: { file: "dead.png", frames: 1, cols: 1, speed: 360, scaleX: 2.30, scaleY: 3.45, anchorX: -80, anchorY: 24 },
    },
    thug: {
        idle: { file: "idle.png", frames: 1, cols: 1, speed: 315, scaleX: 1.70, scaleY: 2.15, anchorX: -80, anchorY: 2 },
        walk: { file: "walk.png", frames: 8, cols: 4, speed: 90, scaleX: 1.80, scaleY: 2.05, anchorX: -80, anchorY: 3 },
        attack: { file: "attack.png", frames: 18, cols: 6, speed: 55, scaleX: 2.20, scaleY: 2.25, anchorX: -80, anchorY: 0 },
        hit: { file: "hit.png", frames: 3, cols: 3, speed: 100, scaleX: 2.75, scaleY: 1.95, anchorX: -80, anchorY: -6 },
        frozen: { file: "frozen.png", frames: 1, cols: 1, speed: 360, scaleX: 1.60, scaleY: 2.15, anchorX: -80, anchorY: 8 },
        dead: { file: "dead.png", frames: 6, cols: 6, speed: 120, scaleX: 3.50, scaleY: 2.75, anchorX: -80, anchorY: 17 },
    },
    thug_gun: {
        idle: { file: "idle.png", frames: 1, cols: 1, speed: 315, scaleX: 1.70, scaleY: 2.15, anchorX: -80, anchorY: 2 },
        walk: { file: "walk.png", frames: 8, cols: 4, speed: 90, scaleX: 1.80, scaleY: 2.05, anchorX: -80, anchorY: 3 },
        attack: { file: "attack.png", frames: 18, cols: 6, speed: 55, scaleX: 2.20, scaleY: 2.25, anchorX: -80, anchorY: 0 },
        hit: { file: "hit.png", frames: 3, cols: 3, speed: 100, scaleX: 2.75, scaleY: 1.95, anchorX: -80, anchorY: -6 },
        frozen: { file: "frozen.png", frames: 1, cols: 1, speed: 360, scaleX: 1.60, scaleY: 2.15, anchorX: -80, anchorY: 8 },
        dead: { file: "dead.png", frames: 6, cols: 6, speed: 120, scaleX: 3.50, scaleY: 2.75, anchorX: -80, anchorY: 17 },
    },
};

// --- SPRITES DE KANO ---
const KANO_SPRITE_CONFIG = {
    idle: { file: 'idle.png', frames: 1, cols: 1, speed: 300, scaleX: 0.95, scaleY: 0.80, anchorX: 0, anchorY: 18 },
    walk: { file: 'walk.png', frames: 8, cols: 4, speed: 120, scaleX: 4.00, scaleY: 2.75, anchorX: 0, anchorY: 15 },
    hit: { file: 'hit.png', frames: 4, cols: 4, speed: 90, scaleX: 4.00, scaleY: 3.80, anchorX: 0, anchorY: 0 },
    attack: { file: 'attack.png', frames: 6, cols: 6, speed: 70, scaleX: 3.40, scaleY: 3.45, anchorX: 0, anchorY: 0 },
    laser: { file: 'laser.png', frames: 4, cols: 4, speed: 120, scaleX: 4.00, scaleY: 2.70, anchorX: 0, anchorY: 0 },
    frozen: { file: 'frozen.png', frames: 1, cols: 1, speed: 300, scaleX: 0.75, scaleY: 0.62, anchorX: 0, anchorY: 17 },
    dead: { file: 'dead.png', frames: 1, cols: 1, speed: 300, scaleX: 1.35, scaleY: 1.60, anchorX: 19, anchorY: 180 }
};

// --- FUNCIÓN AUXILIAR ---
function spriteConfigFor(type) {
    if (type === 'kano') return KANO_SPRITE_CONFIG;
    return ENEMY_SPRITE_CONFIG[type] || null;
}

console.log('✅ config.js cargado');