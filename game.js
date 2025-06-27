// 可爱贪吃蛇游戏
class CuteSnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');

        // 游戏配置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        // 游戏状态
        this.gameState = 'waiting'; // waiting, playing, paused, gameOver
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameSpeed = 150;

        // 蛇的初始状态
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };

        // 食物
        this.food = this.generateFood();

        // 颜色配置
        this.colors = {
            snake: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
            food: ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'],
            background: '#f8f9fa'
        };

        // 粒子系统
        this.particles = [];
        this.animationTime = 0;

        // 音效系统
        this.sounds = {
            eat: this.createSound(800, 0.1),
            gameOver: this.createSound(200, 0.3),
            move: this.createSound(400, 0.05)
        };

        // 游戏统计
        this.gameStats = {
            foodEaten: 0,
            timeStarted: null,
            timePlayed: 0
        };

        // 触摸控制
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.init();
    }

    init() {
        this.updateHighScore();
        this.setupEventListeners();
        this.showOverlay('游戏开始', '按空格键或点击按钮开始游戏');
        this.draw();
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // 开始按钮
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });

        // 防止方向键滚动页面
        window.addEventListener('keydown', (e) => {
            if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);

        // 触摸控制
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            const minSwipeDistance = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0 && this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 }; // 右
                    } else if (deltaX < 0 && this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 }; // 左
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0 && this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 }; // 下
                    } else if (deltaY < 0 && this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 }; // 上
                    }
                }
            }

            this.touchStartX = 0;
            this.touchStartY = 0;
        });
    }

    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.gameState === 'waiting') {
                this.startGame();
            } else if (this.gameState === 'playing') {
                this.pauseGame();
            } else if (this.gameState === 'paused') {
                this.resumeGame();
            } else if (this.gameState === 'gameOver') {
                this.resetGame();
            }
            return;
        }

        if (e.key === 'r' || e.key === 'R') {
            this.resetGame();
            return;
        }

        if (this.gameState !== 'playing') return;

        // 方向控制
        switch (e.code) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.hideOverlay();
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.gameStats.timeStarted = Date.now();
        this.gameLoop();
    }

    pauseGame() {
        this.gameState = 'paused';
        this.showOverlay('游戏暂停', '按空格键继续游戏');
    }

    resumeGame() {
        this.gameState = 'playing';
        this.hideOverlay();
        this.gameLoop();
    }

    resetGame() {
        this.gameState = 'waiting';
        this.score = 0;
        this.updateScore();
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.gameSpeed = 150;
        this.showOverlay('游戏开始', '按空格键或点击按钮开始游戏');
        this.draw();
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.update();
        this.draw();

        setTimeout(() => {
            this.gameLoop();
        }, this.gameSpeed);
    }

    update() {
        // 更新动画时间
        this.animationTime += 16; // 假设60fps

        // 更新粒子
        this.updateParticles();

        // 更新方向
        this.direction = { ...this.nextDirection };

        // 移动蛇头
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // 检查边界碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.gameStats.foodEaten++;
            this.updateScore();
            this.createFoodParticles(this.food.x, this.food.y);
            this.playSound('eat');
            this.food = this.generateFood();

            // 增加游戏速度
            if (this.gameSpeed > 80) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格（可选）
        this.drawGrid();

        // 绘制食物
        this.drawFood();

        // 绘制蛇
        this.drawSnake();

        // 绘制粒子效果
        this.drawParticles();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 蛇头特殊处理
            if (index === 0) {
                this.drawSnakeHead(x, y);
            } else {
                this.drawSnakeBody(x, y, index);
            }
        });
    }

    drawSnakeHead(x, y) {
        // 蛇头渐变色
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ee5a52');

        // 绘制圆角矩形蛇头
        this.ctx.fillStyle = gradient;
        this.drawRoundedRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 6);

        // 蛇眼睛 - 更可爱的大眼睛
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x + 7, y + 7, 3, 0, 2 * Math.PI);
        this.ctx.arc(x + 13, y + 7, 3, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x + 8, y + 7, 1.5, 0, 2 * Math.PI);
        this.ctx.arc(x + 14, y + 7, 1.5, 0, 2 * Math.PI);
        this.ctx.fill();

        // 可爱的腮红
        this.ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x + 4, y + 12, 2, 0, 2 * Math.PI);
        this.ctx.arc(x + 16, y + 12, 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawSnakeBody(x, y, index) {
        const colorIndex = index % this.colors.snake.length;
        const color = this.colors.snake[colorIndex];

        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 20));

        this.ctx.fillStyle = gradient;
        this.drawRoundedRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 4);

        // 添加可爱的高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2 - 2, y + this.gridSize/2 - 2, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;

        const colorIndex = Math.floor(Date.now() / 500) % this.colors.food.length;
        const color = this.colors.food[colorIndex];

        // 食物呼吸动画
        const breathe = Math.sin(this.animationTime * 0.01) * 2;
        const size = this.gridSize/2 - 2 + breathe;

        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, size
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 30));

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, size, 0, 2 * Math.PI);
        this.ctx.fill();

        // 食物闪烁效果
        const sparkle = Math.sin(this.animationTime * 0.02) * 0.3 + 0.4;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkle})`;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2 - 2, y + this.gridSize/2 - 2, 3, 0, 2 * Math.PI);
        this.ctx.fill();

        // 可爱的星星装饰
        this.drawStar(x + this.gridSize/2, y + this.gridSize/2 - 8, 2, 'rgba(255, 255, 255, 0.8)');
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.playSound('gameOver');
        this.updateHighScore();

        // 计算游戏时间
        if (this.gameStats.timeStarted) {
            this.gameStats.timePlayed = Math.floor((Date.now() - this.gameStats.timeStarted) / 1000);
        }

        const message = `得分: ${this.score}\n食物: ${this.gameStats.foodEaten}个\n时间: ${this.gameStats.timePlayed}秒\n\n按空格键或R键重新开始`;
        this.showOverlay('游戏结束', message);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        this.highScoreElement.textContent = this.highScore;
    }

    showOverlay(title, message) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.overlay.classList.add('hidden');
    }

    // 粒子系统方法
    createFoodParticles(x, y) {
        const centerX = x * this.gridSize + this.gridSize/2;
        const centerY = y * this.gridSize + this.gridSize/2;

        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                maxLife: 30,
                color: this.colors.food[Math.floor(Math.random() * this.colors.food.length)]
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 重力
            particle.life--;
            return particle.life > 0;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    // 辅助绘制方法
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawStar(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 144 - 90) * Math.PI / 180;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 音效系统
    createSound(frequency, duration) {
        return () => {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new CuteSnakeGame();
});
