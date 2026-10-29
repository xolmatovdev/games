// ============================================================================
// MAIN GAME CONTROLLER & GAME LOOP (Battle City / Tank 1990)
// Holatlar (States), O'yin mantig'i, Ballar, Render va Boshqaruv
// ============================================================================

const GAME_STATE = {
    START_SCREEN: 0,
    STAGE_INTRO: 1,
    PLAYING: 2,
    STAGE_CLEAR: 3,
    GAME_OVER: 4,
    PAUSED: 5
};

class TankGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        // Virtual o'lcham: 416 (maydon) + 64 (yon panel) = 480 kenglik, 416 balandlik
        this.width = 480;
        this.height = 416;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.state = GAME_STATE.START_SCREEN;
        this.stage = 1;
        this.maxStages = 5;
        this.highScore = parseInt(localStorage.getItem('tank_high_score') || '20000', 10);

        this.map = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.floatingTexts = [];
        this.powerups = [];
        this.spawningAnimations = [];

        // Bosqich dushmanlar zaxirasi (20 ta tank)
        this.totalEnemiesInStage = 20;
        this.enemiesRemainingToSpawn = [];
        this.maxActiveEnemies = 4;
        this.spawnTimer = 0;
        this.spawnInterval = 120; // Har 2 soniyada bir dushman chiqishi mumkin
        this.spawnPoints = [
            { x: 0, y: 0 },
            { x: 192, y: 0 },
            { x: 384, y: 0 }
        ];
        this.currentSpawnIdx = 0;

        // Bonus effektlari taymerlari
        this.freezeTimer = 0;
        this.shovelTimer = 0;
        this.baseDestroyed = false;

        // Bosqich tugashi / Game Over hisoblagichlari
        this.stateTimer = 0;
        this.tallyStats = { basic: 0, fast: 0, power: 0, armor: 0, total: 0 };
        this.tallyStep = 0;
        this.tallyTick = 0;

        // Boshqaruv klavishlari
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false
        };

        this.waterAnimTick = 0;
        this.lastTime = 0;

        this.initInput();
        this.initVirtualControls();
        this.startGameLoop();
    }

    // -------------------------------------------------------------
    // KLAVIATURA VA BOSHQARUV TIZIMI
    // -------------------------------------------------------------
    initInput() {
        window.addEventListener('keydown', (e) => {
            sounds.resume();

            // To'liq ekran rejimi (F yoki F11)
            if (e.code === 'KeyF') {
                e.preventDefault();
                this.toggleFullscreen();
                return;
            }

            // Ovozni yoqish / o'chirish (M)
            if (e.code === 'KeyM') {
                e.preventDefault();
                const muted = sounds.toggleMute();
                this.updateSoundBtn(muted);
                return;
            }

            // Pauza (P yoki Escape)
            if (e.code === 'KeyP' || e.code === 'Escape') {
                const helpModal = document.getElementById('help-modal');
                if (helpModal && helpModal.classList.contains('active')) {
                    helpModal.classList.remove('active');
                    return;
                }
                e.preventDefault();
                this.togglePause();
                return;
            }

            // Bosqichni tanlash (Bosh menyuda S tugmasi)
            if (this.state === GAME_STATE.START_SCREEN && (e.code === 'KeyS' || e.code === 'Tab')) {
                e.preventDefault();
                this.stage = (this.stage % this.maxStages) + 1;
                sounds.playTally();
                return;
            }

            if (this.state === GAME_STATE.START_SCREEN) {
                if (e.code === 'Enter' || e.code === 'Space' || e.key === 'j' || e.key === 'J') {
                    e.preventDefault();
                    this.startStage(1);
                }
                return;
            }

            if (this.state === GAME_STATE.GAME_OVER) {
                if (this.stateTimer > 90 && (e.code === 'Enter' || e.code === 'Space')) {
                    e.preventDefault();
                    this.state = GAME_STATE.START_SCREEN;
                }
                return;
            }

            // Sahifa siljib ketmasligi uchun o'yin tugmalarida preventDefault
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.input.up = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.input.down = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = true;
                    break;
                case 'Space':
                case 'KeyJ':
                case 'KeyZ':
                    this.input.shoot = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.input.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.input.down = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = false;
                    break;
                case 'Space':
                case 'KeyJ':
                case 'KeyZ':
                    this.input.shoot = false;
                    break;
            }
        });
    }

    // Sensorli va interfeys virtual tugmalari
    initVirtualControls() {
        const bindBtn = (id, onDown, onUp) => {
            const el = document.getElementById(id);
            if (!el) return;

            const handleDown = (e) => {
                e.preventDefault();
                sounds.resume();
                el.classList.add('pressed');
                onDown();
            };
            const handleUp = (e) => {
                e.preventDefault();
                el.classList.remove('pressed');
                if (onUp) onUp();
            };

            el.addEventListener('mousedown', handleDown);
            el.addEventListener('mouseup', handleUp);
            el.addEventListener('mouseleave', handleUp);
            el.addEventListener('touchstart', handleDown, { passive: false });
            el.addEventListener('touchend', handleUp, { passive: false });
            el.addEventListener('touchcancel', handleUp, { passive: false });
        };

        // D-Pad krestovina tugmalari
        bindBtn('dpad-up', () => this.input.up = true, () => this.input.up = false);
        bindBtn('dpad-down', () => this.input.down = true, () => this.input.down = false);
        bindBtn('dpad-left', () => this.input.left = true, () => this.input.left = false);
        bindBtn('dpad-right', () => this.input.right = true, () => this.input.right = false);

        // O't ochish tugmalari (A, B, Turbo X, Turbo Y)
        const handleShoot = () => {
            this.input.shoot = true;
            if (this.state === GAME_STATE.START_SCREEN) this.startStage(1);
            if (this.state === GAME_STATE.GAME_OVER && this.stateTimer > 90) this.state = GAME_STATE.START_SCREEN;
        };
        const handleShootStop = () => {
            this.input.shoot = false;
        };

        bindBtn('btn-a', handleShoot, handleShootStop);
        bindBtn('btn-b', handleShoot, handleShootStop);
        bindBtn('btn-x', handleShoot, handleShootStop);
        bindBtn('btn-y', handleShoot, handleShootStop);

        // Start va Select tugmalari
        bindBtn('btn-start', () => {
            if (this.state === GAME_STATE.START_SCREEN) {
                this.startStage(1);
            } else if (this.state === GAME_STATE.GAME_OVER) {
                this.state = GAME_STATE.START_SCREEN;
            } else {
                this.togglePause();
            }
        });

        bindBtn('btn-select', () => {
            if (this.state === GAME_STATE.START_SCREEN) {
                this.stage = (this.stage % this.maxStages) + 1;
                sounds.playTally();
            }
        });

        // Ovozni yoqish/o'chirish
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const muted = sounds.toggleMute();
                this.updateSoundBtn(muted);
            });
        }

        // Pauza tugmasi
        const pauseBtn = document.getElementById('btn-pause-toggle');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // To'liq Ekran (Fullscreen) tugmasi
        const fsBtn = document.getElementById('btn-fullscreen-toggle') || document.getElementById('btn-mode-toggle');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Sensorli boshqaruv tugmalarini ko'rsatish / yashirish
        const touchToggleBtn = document.getElementById('btn-touch-toggle');
        const touchControls = document.getElementById('touch-controls');
        if (touchToggleBtn && touchControls) {
            touchToggleBtn.addEventListener('click', () => {
                touchControls.classList.toggle('visible');
                const isVisible = touchControls.classList.contains('visible');
                touchToggleBtn.classList.toggle('active', isVisible);
                touchToggleBtn.innerHTML = isVisible 
                    ? '🎮 <span class="btn-text">Sensor: Yoniq</span>' 
                    : '🎮 <span class="btn-text">Sensor: O‘chiq</span>';
            });
        }

        // Qoidalar va yordam modali (Help Modal)
        const helpBtn = document.getElementById('btn-help-toggle');
        const helpModal = document.getElementById('help-modal');
        const helpCloseBtn = document.getElementById('btn-help-close');

        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => {
                helpModal.classList.toggle('active');
                if (this.state === GAME_STATE.PLAYING && helpModal.classList.contains('active')) {
                    this.togglePause();
                }
            });
        }

        if (helpCloseBtn && helpModal) {
            helpCloseBtn.addEventListener('click', () => {
                helpModal.classList.remove('active');
            });
        }

        if (helpModal) {
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.classList.remove('active');
                }
            });
        }

        // Brauzer to'liq ekran holatini kuzatish
        const handleFullscreenChange = () => {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
            document.body.classList.toggle('is-fullscreen', isFs);
            if (fsBtn) {
                fsBtn.innerHTML = isFs 
                    ? '↙ <span class="btn-text">Oynaga Qaytish</span>' 
                    : '⛶ <span class="btn-text">To‘liq Ekran</span>';
                fsBtn.setAttribute('title', isFs ? "Oynaga qaytish (F)" : "To'liq ekran rejimiga o'tish (F)");
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    }

    // Ovoz tugmasi matnini yangilash
    updateSoundBtn(muted) {
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.innerHTML = muted 
                ? '🔇 <span class="btn-text">Ovoz: O‘chiq</span>' 
                : '🔊 <span class="btn-text">Ovoz: Yoniq</span>';
            soundBtn.classList.toggle('muted', muted);
        }
    }

    // Pauza holati va tugmasini yangilash
    togglePause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            sounds.stopMove();
            this.updatePauseBtn(true);
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.updatePauseBtn(false);
        }
    }

    updatePauseBtn(isPaused) {
        const pauseBtn = document.getElementById('btn-pause-toggle');
        if (pauseBtn) {
            pauseBtn.innerHTML = isPaused 
                ? '▶️ <span class="btn-text">Davom</span>' 
                : '⏸️ <span class="btn-text">Pauza</span>';
            pauseBtn.classList.toggle('active', isPaused);
        }
    }

    // Haqiqiy brauzer to'liq ekraniga o'tish (True Fullscreen API)
    toggleFullscreen() {
        const doc = document;
        const docEl = document.documentElement;

        const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        const exitFs = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

        if (!fsElement) {
            if (requestFs) {
                requestFs.call(docEl).catch(() => {
                    document.body.classList.toggle('is-fullscreen');
                });
            } else {
                document.body.classList.toggle('is-fullscreen');
            }
        } else {
            if (exitFs) {
                exitFs.call(doc);
            }
        }
    }

    // -------------------------------------------------------------
    // BOSQICHLARNI BOSHLASH VA BOSHQARISH
    // -------------------------------------------------------------
    startStage(stageNumber) {
        this.stage = stageNumber;
        this.state = GAME_STATE.STAGE_INTRO;
        this.stateTimer = 100; // Kirish animatsiyasi davomiyligi

        this.map = getStageMap(this.stage);
        this.baseDestroyed = false;

        // O'yinchini yaratish yoki qayta tiklash
        if (!this.player || stageNumber === 1 || this.player.lives <= 0) {
            this.player = new PlayerTank(128, 384);
        } else {
            this.player.respawn();
        }

        this.tallyStats = { basic: 0, fast: 0, power: 0, armor: 0, total: 0 };
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.floatingTexts = [];
        this.powerups = [];
        this.spawningAnimations = [];
        this.freezeTimer = 0;
        this.shovelTimer = 0;

        // Dushmanlar ro'yxatini shakllantirish (20 ta tank)
        this.generateEnemyQueue();

        sounds.playStageStart();
    }

    generateEnemyQueue() {
        this.enemiesRemainingToSpawn = [];
        const s = this.stage;

        // Har xil turdagi tanklar taqsimoti
        for (let i = 0; i < 20; i++) {
            let type = 0; // Basic
            if (i >= 5 && i < 11) {
                type = 1; // Fast
            } else if (i >= 11 && i < 16) {
                type = 2; // Power
            } else if (i >= 16) {
                type = 3; // Armor
            }

            // Bonusli (chaqnoq) dushmanlar (har 4-tank bonus olib yuradi)
            const isFlashing = (i === 3 || i === 9 || i === 15);
            this.enemiesRemainingToSpawn.push({ type, isFlashing });
        }

        // Qiziqarli bo'lishi uchun aralashtirish (lekin dastlabki 3 tasi osonroq)
        const early = this.enemiesRemainingToSpawn.slice(0, 4);
        const rest = this.enemiesRemainingToSpawn.slice(4);
        rest.sort(() => Math.random() - 0.5);
        this.enemiesRemainingToSpawn = [...early, ...rest];
    }

    // -------------------------------------------------------------
    // DUSHMANLARNING PAYDO BO'LISHI (SPAWN)
    // -------------------------------------------------------------
    handleEnemySpawning() {
        if (this.enemiesRemainingToSpawn.length === 0) return;
        if (this.enemies.length >= this.maxActiveEnemies) return;

        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval;

            const pt = this.spawnPoints[this.currentSpawnIdx];
            this.currentSpawnIdx = (this.currentSpawnIdx + 1) % this.spawnPoints.length;

            // Chaqnoq yulduzcha animatsiyasi
            this.spawningAnimations.push({
                x: pt.x,
                y: pt.y,
                frame: 0,
                maxFrames: 35,
                enemyData: this.enemiesRemainingToSpawn.shift()
            });
        }
    }

    updateSpawningAnimations() {
        for (let i = this.spawningAnimations.length - 1; i >= 0; i--) {
            const sp = this.spawningAnimations[i];
            sp.frame++;

            if (sp.frame >= sp.maxFrames) {
                // Tankni maydonga tushirish
                const enemy = new EnemyTank(sp.x, sp.y, sp.enemyData.type, sp.enemyData.isFlashing);
                this.enemies.push(enemy);
                this.spawningAnimations.splice(i, 1);
            }
        }
    }

    // -------------------------------------------------------------
    // BONUSLAR (POWER-UPS) VA EFFEKTLAR
    // -------------------------------------------------------------
    spawnPowerup() {
        const types = ['helmet', 'clock', 'shovel', 'bomb', 'star', 'tank', 'gun'];
        const chosen = types[Math.floor(Math.random() * types.length)];

        // Bo'sh joy topish
        let px = 32 + Math.floor(Math.random() * 320);
        let py = 32 + Math.floor(Math.random() * 320);
        px = Math.floor(px / 16) * 16;
        py = Math.floor(py / 16) * 16;

        this.powerups.push({
            type: chosen,
            x: px,
            y: py,
            timer: 900 // 15 soniya maydonda turadi
        });

        sounds.playPowerupSpawn();
    }

    applyPowerup(type) {
        sounds.playPowerupPick();
        this.addScore(500);
        this.addFloatingText(this.player.x, this.player.y, '500');

        switch (type) {
            case 'helmet':
                this.player.shieldTimer = 600; // 10 soniya qalqon
                break;
            case 'clock':
                this.freezeTimer = 600; // 10 soniya dushmanlar qotib qoladi
                break;
            case 'shovel':
                // Shtab himoyasini po'latga aylantirish
                setupBase(this.map, TILES.STEEL);
                this.shovelTimer = 900; // 15 soniya po'lat devor
                break;
            case 'bomb':
                // Maydondagi barcha dushmanlarni bir zumda portlatish!
                [...this.enemies].forEach(enemy => {
                    this.destroyEnemy(enemy, false);
                });
                sounds.playExplosionLarge();
                break;
            case 'star':
                this.player.upgrade();
                break;
            case 'tank':
                this.player.lives++;
                sounds.playPowerupPick();
                break;
            case 'gun':
                this.player.level = 4;
                this.player.applyLevelStats();
                break;
        }
    }

    checkPowerupCollection() {
        const pBox = { x: this.player.x, y: this.player.y, w: 32, h: 32 };
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            const pUpBox = { x: p.x, y: p.y, w: 28, h: 28 };

            if (this.intersects(pBox, pUpBox)) {
                this.applyPowerup(p.type);
                this.powerups.splice(i, 1);
            }
        }
    }

    // -------------------------------------------------------------
    // TO'QNASHUVLAR (COLLISIONS) VA JANG MANTIG'I
    // -------------------------------------------------------------
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(this.map, this);

            if (b.isDestroyed) {
                this.bullets.splice(i, 1);
                continue;
            }

            // 1. O'q va O'q to'qnashuvi (O'qlarni bir-biri bilan urib qaytarish!)
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b2 = this.bullets[j];
                if (b === b2 || b2.isDestroyed) continue;

                // Turli egalarning o'qlari to'qnashsa
                if (b.owner.isPlayer !== b2.owner.isPlayer) {
                    const dist = Math.hypot(b.x - b2.x, b.y - b2.y);
                    if (dist < 8) {
                        b.destroy(this, true);
                        b2.destroy(this, true);
                        sounds.playExplosionSmall();
                        break;
                    }
                }
            }

            if (b.isDestroyed) {
                this.bullets.splice(i, 1);
                continue;
            }

            // 2. O'yinchi o'qi Dushmanga tegishi
            if (b.owner.isPlayer) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    if (enemy.isDestroyed) continue;

                    const enemyBox = { x: enemy.x, y: enemy.y, w: 32, h: 32 };
                    if (this.pointInBox(b.x, b.y, enemyBox)) {
                        b.destroy(this, false);

                        const isDead = enemy.takeDamage(1);
                        if (isDead) {
                            this.destroyEnemy(enemy, true);
                        } else {
                            sounds.playHitSteel();
                        }
                        break;
                    }
                }
            }
            // 3. Dushman o'qi O'yinchiga tegishi
            else {
                if (!this.player.isDestroyed) {
                    const pBox = { x: this.player.x, y: this.player.y, w: 32, h: 32 };
                    if (this.pointInBox(b.x, b.y, pBox)) {
                        b.destroy(this, false);

                        if (this.player.shieldTimer > 0) {
                            sounds.playHitSteel();
                        } else {
                            this.onPlayerHit();
                        }
                    }
                }
            }
        }
    }

    destroyEnemy(enemy, awardScore = true) {
        enemy.isDestroyed = true;
        this.addExplosion(enemy.x + 16, enemy.y + 16, true);
        sounds.playExplosionLarge();

        if (awardScore) {
            this.addScore(enemy.points);
            this.addFloatingText(enemy.x, enemy.y, `${enemy.points}`);

            // Statistika hisobi
            if (enemy.type === 0) this.tallyStats.basic++;
            else if (enemy.type === 1) this.tallyStats.fast++;
            else if (enemy.type === 2) this.tallyStats.power++;
            else if (enemy.type === 3) this.tallyStats.armor++;
        }

        // Agar dushman bonus tashuvchi bo'lsa
        if (enemy.isFlashing) {
            this.spawnPowerup();
        }

        // Ro'yxatdan o'chirish
        this.enemies = this.enemies.filter(e => !e.isDestroyed);

        // Barcha dushmanlar yo'q qilinganini tekshirish
        if (this.enemiesRemainingToSpawn.length === 0 && this.enemies.length === 0) {
            this.triggerStageClear();
        }
    }

    onPlayerHit() {
        this.addExplosion(this.player.x + 16, this.player.y + 16, true);
        sounds.playExplosionLarge();
        this.player.isDestroyed = true;
        this.player.lives--;

        if (this.player.lives > 0) {
            setTimeout(() => {
                if (this.state === GAME_STATE.PLAYING) {
                    this.player.level = 1; // Darajasi boshlang'ichga qaytadi
                    this.player.applyLevelStats();
                    this.player.respawn();
                }
            }, 1000);
        } else {
            this.triggerGameOver();
        }
    }

    onBaseDestroyed() {
        if (this.baseDestroyed) return;
        this.baseDestroyed = true;
        this.addExplosion(24 * 16 + 16, 12 * 16 + 16, true);
        sounds.playExplosionLarge();
        this.triggerGameOver();
    }

    triggerGameOver() {
        this.state = GAME_STATE.GAME_OVER;
        this.stateTimer = 0;
        sounds.stopMove();
        sounds.playGameOver();
    }

    triggerStageClear() {
        this.state = GAME_STATE.STAGE_CLEAR;
        this.stateTimer = 0;
        this.tallyStep = 0;
        this.tallyTick = 0;
        sounds.stopMove();
    }

    // -------------------------------------------------------------
    // ANIMATSIYALAR VA PARTEKLLAR
    // -------------------------------------------------------------
    addExplosion(x, y, isLarge = false) {
        this.explosions.push({
            x,
            y,
            isLarge,
            progress: 0,
            duration: isLarge ? 24 : 12
        });
    }

    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.progress += 1 / exp.duration;
            if (exp.progress >= 1) {
                this.explosions.splice(i, 1);
            }
        }
    }

    addFloatingText(x, y, text) {
        this.floatingTexts.push({
            x,
            y,
            text,
            alpha: 1.0,
            timer: 40
        });
    }

    updateFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= 0.5;
            ft.timer--;
            ft.alpha = ft.timer / 40;
            if (ft.timer <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    addScore(pts) {
        if (this.player) {
            this.player.score += pts;
            if (this.player.score > this.highScore) {
                this.highScore = this.player.score;
                localStorage.setItem('tank_high_score', this.highScore.toString());
            }
        }
    }

    // -------------------------------------------------------------
    // ASOSIY UPDATE SIKLI (GAME UPDATE)
    // -------------------------------------------------------------
    update() {
        this.waterAnimTick++;

        if (this.state === GAME_STATE.STAGE_INTRO) {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = GAME_STATE.PLAYING;
            }
            return;
        }

        if (this.state === GAME_STATE.GAME_OVER) {
            this.stateTimer++;
            this.updateExplosions();
            return;
        }

        if (this.state === GAME_STATE.STAGE_CLEAR) {
            this.stateTimer++;
            // Natijalar hisoblash jadvali (Tally)
            if (this.stateTimer > 40 && this.tallyStep < 4) {
                this.tallyTick++;
                if (this.tallyTick % 8 === 0) {
                    sounds.playTally();
                    this.tallyStep++;
                }
            } else if (this.stateTimer > 200) {
                // Keyingi bosqichga o'tish
                if (this.stage < this.maxStages) {
                    this.startStage(this.stage + 1);
                } else {
                    // O'yin g'alaba bilan yakunlandi! 1-bosqichdan aylanish
                    this.startStage(1);
                }
            }
            return;
        }

        if (this.state === GAME_STATE.PAUSED) {
            return;
        }

        // QURAK (SHOVEL) TAYMERI
        if (this.shovelTimer > 0) {
            this.shovelTimer--;
            if (this.shovelTimer === 0) {
                // Devorni qayta g'ishtga aylantirish
                setupBase(this.map, TILES.BRICK);
            } else if (this.shovelTimer < 180 && Math.floor(this.shovelTimer / 15) % 2 === 0) {
                // Vaqt tugayotganda po'lat va g'isht navbati bilan miltillaydi
                setupBase(this.map, TILES.BRICK);
            } else if (this.shovelTimer < 180) {
                setupBase(this.map, TILES.STEEL);
            }
        }

        // SOAT (CLOCK) TAYMERI
        const isFrozen = this.freezeTimer > 0;
        if (this.freezeTimer > 0) this.freezeTimer--;

        // Yangi dushmanlarni chaqirish
        this.handleEnemySpawning();
        this.updateSpawningAnimations();

        // Tanklar to'qnashuvi uchun umumiy ro'yxat
        const allTanks = [...this.enemies];
        if (this.player && !this.player.isDestroyed) {
            allTanks.push(this.player);
        }

        // O'yinchi harakati
        if (this.player && !this.player.isDestroyed) {
            this.player.update(this.input, this.map, this.enemies, this);
            this.checkPowerupCollection();
        }

        // Dushmanlar harakati
        this.enemies.forEach(enemy => {
            const others = allTanks.filter(t => t !== enemy);
            enemy.update(this.map, others, this, isFrozen);
        });

        // O'qlar harakati va to'qnashuvlar
        this.updateBullets();

        // Bonuslar taymeri
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            this.powerups[i].timer--;
            if (this.powerups[i].timer <= 0) {
                this.powerups.splice(i, 1);
            }
        }

        this.updateExplosions();
        this.updateFloatingTexts();
    }

    // -------------------------------------------------------------
    // GRAFIKA CHIZISH (RENDER)
    // -------------------------------------------------------------
    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.state === GAME_STATE.START_SCREEN) {
            this.renderStartScreen();
            return;
        }

        if (this.state === GAME_STATE.STAGE_INTRO) {
            this.renderStageIntro();
            return;
        }

        if (this.state === GAME_STATE.STAGE_CLEAR) {
            this.renderStageClear();
            return;
        }

        // 1. Maydon foni (Qora)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 416, 416);

        // 2. Quyi qatlam: Xaritadagi to'siqlar (G'isht, Po'lat, Suv, Muz)
        for (let r = 0; r < 26; r++) {
            for (let c = 0; c < 26; c++) {
                const tile = this.map[r][c];
                const tx = c * 16;
                const ty = r * 16;

                if (tile === TILES.BRICK) {
                    Sprites.drawBrickTile(this.ctx, tx, ty);
                } else if (tile === TILES.STEEL) {
                    Sprites.drawSteelTile(this.ctx, tx, ty);
                } else if (tile === TILES.WATER) {
                    Sprites.drawWaterTile(this.ctx, tx, ty, this.waterAnimTick);
                } else if (tile === TILES.ICE) {
                    Sprites.drawIceTile(this.ctx, tx, ty);
                }
            }
        }

        // 3. Shtab Burguti (24..25-qator, 12..13-ustun)
        Sprites.drawBase(this.ctx, 12 * 16, 24 * 16, this.baseDestroyed);

        // 4. Bonuslar (Power-ups)
        this.powerups.forEach(p => {
            Sprites.drawPowerup(this.ctx, p);
        });

        // 5. Spawning animatsiyalari (Chaqnoq yulduzlar)
        this.spawningAnimations.forEach(sp => {
            Sprites.drawSpawnStar(this.ctx, sp.x, sp.y, sp.frame);
        });

        // 6. Tanklar (O'yinchi va Dushmanlar)
        this.enemies.forEach(enemy => {
            Sprites.drawTank(this.ctx, enemy);
        });

        if (this.player && !this.player.isDestroyed) {
            Sprites.drawTank(this.ctx, this.player);
        }

        // 7. O'qlar
        this.bullets.forEach(b => {
            Sprites.drawBullet(this.ctx, b);
        });

        // 8. Yuqori qatlam: O'rmon / Daraxtlar (Tanklar daraxt ostida yashirinadi!)
        for (let r = 0; r < 26; r++) {
            for (let c = 0; c < 26; c++) {
                if (this.map[r][c] === TILES.FOREST) {
                    Sprites.drawForestTile(this.ctx, c * 16, r * 16);
                }
            }
        }

        // 9. Portlashlar
        this.explosions.forEach(exp => {
            Sprites.drawExplosion(this.ctx, exp);
        });

        // 10. Suzuvchi ball matnlari (+100, +500)
        this.floatingTexts.forEach(ft => {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${ft.alpha})`;
            this.ctx.font = '10px "Courier New", monospace';
            this.ctx.fontWeight = 'bold';
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.restore();
        });

        // 11. Yon panel (HUD / Status bar)
        this.renderSidebar();

        // 12. Game Over yoki Pause yozuvlari
        if (this.state === GAME_STATE.GAME_OVER) {
            this.renderGameOver();
        } else if (this.state === GAME_STATE.PAUSED) {
            this.renderPause();
        }
    }

    // -------------------------------------------------------------
    // HUD / YON STATUS PANELI (416 dan 480 gacha)
    // -------------------------------------------------------------
    renderSidebar() {
        const sx = 416;
        this.ctx.fillStyle = '#636363';
        this.ctx.fillRect(sx, 0, 64, 416);

        // Qora ramkalar
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(sx + 2, 2, 60, 412);

        // Dushman tanklari piktogrammalari (20 ta ikonka, 2 ustunda)
        const totalEnemiesLeft = this.enemiesRemainingToSpawn.length + this.enemies.length;
        for (let i = 0; i < 20; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const ix = sx + 14 + col * 20;
            const iy = 16 + row * 16;

            if (i < totalEnemiesLeft) {
                // Kichik dushman tankchasi
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(ix, iy, 12, 12);
                this.ctx.fillStyle = '#8b8b8b';
                this.ctx.fillRect(ix + 1, iy + 1, 10, 10);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(ix + 4, iy + 4, 4, 4);
            }
        }

        // O'yinchi hayotlari (IP - 1 Player)
        const py = 240;
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 12px "Courier New", monospace';
        this.ctx.fillStyle = '#e86a10';
        this.ctx.fillText('IP', sx + 14, py);

        // Kichik sariq tank ikonkasi
        this.ctx.fillStyle = '#fce438';
        this.ctx.fillRect(sx + 14, py + 8, 12, 12);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(sx + 18, py + 11, 4, 4);

        // Hayotlar soni
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px "Courier New", monospace';
        const lives = this.player ? Math.max(0, this.player.lives) : 0;
        this.ctx.fillText(`${lives}`, sx + 34, py + 20);

        // Bosqich bayrog'i (Stage flag)
        const fy = 320;
        this.ctx.fillStyle = '#e86a10';
        // Bayroq ustuni
        this.ctx.fillRect(sx + 16, fy, 3, 22);
        // Bayroq matosi
        this.ctx.fillStyle = '#ff2020';
        this.ctx.beginPath();
        this.ctx.moveTo(sx + 19, fy);
        this.ctx.lineTo(sx + 34, fy + 7);
        this.ctx.lineTo(sx + 19, fy + 14);
        this.ctx.fill();

        // Bosqich raqami
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px "Courier New", monospace';
        this.ctx.fillText(`${this.stage}`, sx + 22, fy + 42);
    }

    // -------------------------------------------------------------
    // START / MENYU EKRANI (BATTLE CITY LOGO & TITLE)
    // -------------------------------------------------------------
    renderStartScreen() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Rekord (High Score)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 13px "Courier New", monospace';
        this.ctx.fillText(`I-    00    HI- ${this.highScore}`, 70, 40);

        // BATTLE CITY / TANK 1990 Logo
        this.ctx.save();
        this.ctx.fillStyle = '#b84418';
        this.ctx.font = 'bold 36px "Impact", "Arial Black", sans-serif';
        this.ctx.fillText('BATTLE', 160, 120);
        this.ctx.fillStyle = '#e86a38';
        this.ctx.fillText('CITY', 200, 160);

        // Oltin "TANK 1990" lentasi
        this.ctx.fillStyle = '#fce438';
        this.ctx.font = 'bold 20px "Courier New", monospace';
        this.ctx.fillText('★ TANK 1990 ★', 150, 195);
        this.ctx.restore();

        // Full Screen Arcade nishoni
        this.ctx.fillStyle = '#00e5ff';
        this.ctx.font = 'bold 12px "Courier New", monospace';
        this.ctx.fillText('FULL SCREEN ARCADE EDITION', 130, 225);

        // Menyu bandlari
        const startY = 270;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px "Courier New", monospace';
        this.ctx.fillText('1 PLAYER', 190, startY);
        this.ctx.fillText(`STAGE: ${this.stage} (SELECT)`, 190, startY + 30);

        // Miltillovchi tank kursor
        const cursorY = startY - 12;
        const tick = Math.floor(Date.now() / 250) % 2;
        if (tick === 0) {
            // Kursor tankchasi
            this.ctx.fillStyle = '#fce438';
            this.ctx.fillRect(160, cursorY, 16, 16);
            this.ctx.fillStyle = '#e8a810';
            this.ctx.fillRect(164, cursorY + 4, 8, 8);
            this.ctx.fillRect(174, cursorY + 6, 6, 4);
        }

        // Boshlash bo'yicha ko'rsatma
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '11px "Courier New", monospace';
        this.ctx.fillText('BOSHLASH: [ENTER], [BO‘SH JOY] YOKI [START]', 80, 360);
        this.ctx.fillText('BOSHQARUV: W,A,S,D / STRELKALAR + SPACE / J', 85, 385);
    }

    // -------------------------------------------------------------
    // BOSQICH BOSHLANISH EKRANI (STAGE INTRO CURTAIN)
    // -------------------------------------------------------------
    renderStageIntro() {
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Qora orqa fon pardasi
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(40, 40, this.width - 80, this.height - 80);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 22px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`STAGE  ${this.stage}`, this.width / 2, this.height / 2);
        this.ctx.textAlign = 'left';
    }

    // -------------------------------------------------------------
    // BOSQICH YAKUNLANISHI VA HISOB-KITOB (STAGE CLEAR TALLY)
    // -------------------------------------------------------------
    renderStageClear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#e86a10';
        this.ctx.font = 'bold 16px "Courier New", monospace';
        this.ctx.fillText(`HI-SCORE   ${this.highScore}`, 140, 40);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`STAGE  ${this.stage}`, 190, 80);

        this.ctx.fillStyle = '#fce438';
        this.ctx.fillText('I-PLAYER', 80, 120);
        this.ctx.fillText(`${this.player ? this.player.score : 0}`, 80, 145);

        // Qatorlar (har bir turdagi tank va hisobi)
        const types = [
            { name: 'ODDIY', pts: 100, count: this.tallyStats.basic, y: 180, color: '#a0a0a0' },
            { name: 'TEZKOR', pts: 200, count: this.tallyStats.fast, y: 220, color: '#4090b0' },
            { name: 'KUCHLI', pts: 300, count: this.tallyStats.power, y: 260, color: '#a07030' },
            { name: 'ZIRHLI', pts: 400, count: this.tallyStats.armor, y: 300, color: '#208020' }
        ];

        types.forEach((t, idx) => {
            if (this.tallyStep >= idx) {
                // Ball
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 14px "Courier New", monospace';
                const totalPts = t.count * t.pts;
                this.ctx.fillText(`${totalPts} PTS`, 80, t.y);

                // Dushman tank ikonkasi
                this.ctx.fillStyle = t.color;
                this.ctx.fillRect(210, t.y - 12, 16, 16);

                // Soni
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(`◄ ${t.count}`, 240, t.y);
            }
        });

        // Chiziq
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(80, 325, 300, 2);

        // Jami
        if (this.tallyStep >= 4) {
            const totalDestroyed = this.tallyStats.basic + this.tallyStats.fast + this.tallyStats.power + this.tallyStats.armor;
            this.ctx.fillText(`JAMI:      ${totalDestroyed} TA TANK`, 120, 355);
        }
    }

    // -------------------------------------------------------------
    // GAME OVER VA PAUSE
    // -------------------------------------------------------------
    renderGameOver() {
        // NES uslubida pastdan sekin ko'tariluvchi qizil "GAME OVER"
        const y = Math.max(180, 416 - this.stateTimer * 2.5);

        this.ctx.save();
        this.ctx.fillStyle = '#d01010';
        this.ctx.font = 'bold 32px "Impact", "Arial Black", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', 208, y);

        if (this.stateTimer > 90) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px "Courier New", monospace';
            this.ctx.fillText('QAYTA BOSHLASH UCHUN [ENTER] YOKI [START]', 208, y + 40);
        }
        this.ctx.restore();
    }

    renderPause() {
        if (Math.floor(Date.now() / 300) % 2 === 0) {
            this.ctx.save();
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.font = 'bold 24px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSE', 208, 208);
            this.ctx.restore();
        }
    }

    // -------------------------------------------------------------
    // ASOSIY SIKL (MAIN GAME LOOP)
    // -------------------------------------------------------------
    startGameLoop() {
        const loop = (timestamp) => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // Geometriya yordamchisi
    intersects(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    pointInBox(x, y, box) {
        return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
    }
}

// O'yinni oynani yuklanganda ishga tushirish
window.addEventListener('load', () => {
    window.game = new TankGame();
});
