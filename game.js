const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const bgMusic = new Audio('music.mp3'); 
bgMusic.loop = true; 
bgMusic.volume = 0.5;
let isMusicPlaying = false;

// متغيرات اللعبة الأساسية
let gameActive = true, speed = 3.3, acceleration = 0.00045, distance = 0;
let highScore = localStorage.getItem("highScore") || 0, obstacles = [], frameCount = 0;
let canRevive = true;

const player = {
    x: 60, y: canvas.height / 2, radius: 12, dy: 0, gravity: 0.45, gravityDir: 1, color: "#00f2ff", visible: true,
    update() {
        if (!this.visible) return;
        this.dy += this.gravity * this.gravityDir;
        this.y += this.dy;

        // منع الغرق تماماً
        if (this.y + this.radius > canvas.height) { this.y = canvas.height - this.radius; this.dy = 0; }
        if (this.y - this.radius < 0) { this.y = this.radius; this.dy = 0; }
    },
    draw() {
        if (!this.visible) return;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill();
        ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    }
};

function spawnObstacle() {
    let h = canvas.height * 0.4;
    let y = Math.random() < 0.5 ? 0 : canvas.height - h;
    obstacles.push({ x: canvas.width + 50, y: y, w: 30, h: h, color: "#ff0055" });
}

function gameOver() {
    gameActive = false; 
    player.visible = false;
    document.getElementById('currentScore').innerText = Math.floor(distance) + "m";
    document.getElementById('bestScore').innerText = "Best: " + highScore + "m";
    document.getElementById('gameOverUI').style.display = 'block';
    
    // إظهار زر الإحياء فقط إذا كان متاحاً
    let rBtn = document.getElementById('reviveBtn');
    if (rBtn) rBtn.style.display = canRevive ? "block" : "none";
}

// دالة الإحياء: تعيد الكرة للعمل فوراً "بدون ريفريش"
window.reviveAction = function() {
    canRevive = false; // تُستخدم مرة واحدة فقط في الجولة
    gameActive = true;
    player.visible = true;
    player.y = canvas.height / 2; // إعادة الكرة للمنتصف
    player.dy = 0;
    obstacles = []; // مسح العقبات الحالية لتسهيل البدء
    document.getElementById('gameOverUI').style.display = 'none';
};

function animate() {
    ctx.fillStyle = "#050010"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        distance += speed/10; speed += acceleration; frameCount++;
        player.update();
        if (frameCount % 90 === 0) spawnObstacle();

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= speed;
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

            // منطقة تصادم دقيقة وعادلة
            if (player.x + 8 > obs.x && player.x - 8 < obs.x + obs.w &&
                player.y + 8 > obs.y && player.y - 8 < obs.y + obs.h) {
                if (Math.floor(distance) > highScore) { 
                    highScore = Math.floor(distance); 
                    localStorage.setItem("highScore", highScore); 
                }
                gameOver();
            }
            if (obs.x + obs.w < 0) obstacles.splice(i, 1);
        }
    }

    player.draw();
    ctx.fillStyle = "white"; ctx.font = "bold 18px Arial";
    if(gameActive) ctx.fillText(`${Math.floor(distance)}m`, canvas.width - 70, 40);
    requestAnimationFrame(animate);
}

window.addEventListener('touchstart', (e) => {
    // منع القفز إذا ضغطنا على أزرار الواجهة
    if (e.target.tagName === 'BUTTON') return;
    
    e.preventDefault();
    if (!isMusicPlaying) { bgMusic.play().then(() => isMusicPlaying = true).catch(() => {}); }
    if (gameActive) {
        player.gravityDir *= -1;
        player.dy = player.gravityDir * 8;
    }
}, { passive: false });

animate();
