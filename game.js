const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ضبط الحجم ومنع أي تمرير للشاشة
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

let gameActive = true, speed = 3.3, acceleration = 0.00045, distance = 0;
let highScore = localStorage.getItem("highScore") || 0, obstacles = [], frameCount = 0;
let canRevive = true;

const player = {
    x: 60, y: canvas.height / 2, radius: 12, dy: 0, gravity: 0.45, gravityDir: 1,
    update() {
        if (!this.visible) return;
        this.dy += this.gravity * this.gravityDir;
        this.y += this.dy;

        // --- القفل الحديدي للحواف (مستحيل تخرج) ---
        let limitTop = this.radius;
        let limitBottom = canvas.height - this.radius;
        
        if (this.y < limitTop) { this.y = limitTop; this.dy = 0; }
        if (this.y > limitBottom) { this.y = limitBottom; this.dy = 0; }
    },
    draw() {
        if (!this.visible) return;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#00f2ff"; ctx.fill();
        ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    },
    visible: true
};

function spawn() {
    let h = canvas.height * 0.38;
    let y = Math.random() < 0.5 ? 0 : canvas.height - h;
    obstacles.push({ x: canvas.width + 50, y: y, w: 30, h: h });
}

function gameOver() {
    gameActive = false; player.visible = false;
    document.getElementById('currentScore').innerText = Math.floor(distance) + "m";
    document.getElementById('bestScore').innerText = "Best: " + highScore + "m";
    document.getElementById('gameOverUI').style.display = 'block';
    if(canRevive) document.getElementById('reviveBtn').style.display = 'block';
}

window.reviveAction = function() {
    canRevive = false; gameActive = true; player.visible = true;
    player.y = canvas.height / 2; player.dy = 0; obstacles = [];
    document.getElementById('gameOverUI').style.display = 'none';
};

function animate() {
    ctx.fillStyle = "#050010"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gameActive) {
        distance += speed/10; speed += acceleration; frameCount++;
        player.update();
        if (frameCount % 90 === 0) spawn();
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i]; o.x -= speed;
            ctx.fillStyle = "#ff0055"; ctx.fillRect(o.x, o.y, o.w, o.h);
            // تصادم ذكي
            if (player.x + 8 > o.x && player.x - 8 < o.x + o.w && player.y + 8 > o.y && player.y - 8 < o.y + o.h) {
                if (Math.floor(distance) > highScore) { highScore = Math.floor(distance); localStorage.setItem("highScore", highScore); }
                gameOver();
            }
            if (o.x + o.w < 0) obstacles.splice(i, 1);
        }
    }
    player.draw();
    ctx.fillStyle = "white"; ctx.font = "bold 18px Arial";
    if(gameActive) ctx.fillText(`${Math.floor(distance)}m`, canvas.width - 70, 40);
    requestAnimationFrame(animate);
}

window.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (gameActive) { player.gravityDir *= -1; player.dy = player.gravityDir * 8; }
}, { passive: false });

animate();
