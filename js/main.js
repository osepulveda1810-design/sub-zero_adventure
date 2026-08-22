// Variables globales
let canvas, ctx;
let enemies = [], projectiles = [], iceTrails = [], iceShatters = [], floatingTexts = [];
let currentState = 'MENU', currentLevel = 0, score = 0;
let gameLoopStarted = false, isPaused = false;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    setupCanvas();
    initSprites();
    setupEventListeners();
    showMenu('main');
});

// Bucle principal
function loop(time) {
    requestAnimationFrame(loop);
    if (currentState !== 'PLAYING' || isPaused) return;

    update();
    render();
}

function update() {
    // Actualizar física, IA, colisiones, etc.
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateParticles();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawObjects();
    drawHUD();
}
