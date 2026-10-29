// ============================================================================
// TANK & BULLET CLASSES & PHYSICS ENGINE
// Harakat, to'qnashuvlar (collision), AI va o'qlar fizikasi
// ============================================================================

// Yo'nalishlar: 0: YUQORI (UP), 1: O'NG (RIGHT), 2: PAST (DOWN), 3: CHAP (LEFT)
const DIR = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

const DIR_VEC = [
    { x: 0, y: -1 }, // UP
    { x: 1, y: 0 },  // RIGHT
    { x: 0, y: 1 },  // DOWN
    { x: -1, y: 0 }  // LEFT
];

// -------------------------------------------------------------
// O'Q SINFI (BULLET)
// -------------------------------------------------------------
class Bullet {
    constructor(x, y, direction, speed, power, owner) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.power = power; // 1: oddiy, 4: po'latni yoradigan super o'q
        this.owner = owner; // Otgan tank
        this.isDestroyed = false;
        this.radius = 3;
    }

    update(map, game) {
        if (this.isDestroyed) return;

        const vec = DIR_VEC[this.direction];
        this.x += vec.x * this.speed;
        this.y += vec.y * this.speed;

        // 1. Ekran chegarasiga urilish
        if (this.x < 0 || this.x > 416 || this.y < 0 || this.y > 416) {
            this.destroy(game, false);
            return;
        }

        // 2. Xarita to'siqlari bilan to'qnashuv
        this.checkMapCollision(map, game);
    }

    checkMapCollision(map, game) {
        // O'qning maydondagi katak koordinatalari (16x16 grid)
        // O'q yo'nalishiga qarab tegish nuqtasini hisoblash
        let testPoints = [];
        if (this.direction === DIR.UP || this.direction === DIR.DOWN) {
            testPoints = [
                { x: this.x - 3, y: this.y },
                { x: this.x + 3, y: this.y }
            ];
        } else {
            testPoints = [
                { x: this.x, y: this.y - 3 },
                { x: this.x, y: this.y + 3 }
            ];
        }

        let hitObstacle = false;

        for (const pt of testPoints) {
            const col = Math.floor(pt.x / 16);
            const row = Math.floor(pt.y / 16);

            if (row < 0 || row >= 26 || col < 0 || col >= 26) continue;

            const tile = map[row][col];

            // G'isht devor
            if (tile === TILES.BRICK) {
                map[row][col] = TILES.EMPTY;
                hitObstacle = true;
                sounds.playHitBrick();
            }
            // Po'lat devor
            else if (tile === TILES.STEEL) {
                if (this.power >= 4) {
                    map[row][col] = TILES.EMPTY;
                    sounds.playExplosionSmall();
                } else {
                    sounds.playHitSteel();
                }
                hitObstacle = true;
            }
            // Shtab burguti
            else if (tile === TILES.BASE) {
                map[24][12] = TILES.BASE_RUIN;
                map[24][13] = TILES.BASE_RUIN;
                map[25][12] = TILES.BASE_RUIN;
                map[25][13] = TILES.BASE_RUIN;
                game.onBaseDestroyed();
                hitObstacle = true;
                sounds.playExplosionLarge();
            }
        }

        if (hitObstacle) {
            this.destroy(game, true);
        }
    }

    destroy(game, spawnSpark = true) {
        this.isDestroyed = true;
        if (spawnSpark && game) {
            game.addExplosion(this.x, this.y, false);
        }
    }
}

// -------------------------------------------------------------
// BAZAVIY TANK SINFI (TANK BASE)
// -------------------------------------------------------------
class Tank {
    constructor(x, y, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = 30; // 32x32 dan biroz erkinroq, koridorlarga sig'ishi oson bo'lishi uchun
        this.height = 30;
        this.direction = DIR.UP;
        this.speed = 1.5;
        this.health = 1;
        this.maxHealth = 1;
        this.level = 1;
        this.isPlayer = isPlayer;
        this.isDestroyed = false;
        this.animTick = 0;
        this.cooldown = 0;
        this.maxCooldown = 30;
        this.shieldTimer = 0;
        this.bullets = [];
        this.maxBullets = 1;
        this.bulletSpeed = 4.0;
        this.bulletPower = 1;
        this.isOnIce = false;
    }

    // Xaritadagi to'siqlar bilan to'qnashuvni tekshirish
    canMoveTo(newX, newY, map, otherTanks) {
        // Chegaralarni tekshirish
        if (newX < 0 || newX + 32 > 416 || newY < 0 || newY + 32 > 416) {
            return false;
        }

        // Kataklar bo'yicha to'qnashuvni tekshirish
        const colStart = Math.floor(newX / 16);
        const colEnd = Math.floor((newX + 31) / 16);
        const rowStart = Math.floor(newY / 16);
        const rowEnd = Math.floor((newY + 31) / 16);

        let onIce = false;

        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                if (r < 0 || r >= 26 || c < 0 || c >= 26) return false;
                const tile = map[r][c];

                if (tile === TILES.BRICK || tile === TILES.STEEL || tile === TILES.WATER || tile === TILES.BASE || tile === TILES.BASE_RUIN) {
                    return false;
                }
                if (tile === TILES.ICE) {
                    onIce = true;
                }
            }
        }

        this.isOnIce = onIce;

        // Boshqa tanklar bilan to'qnashuvni tekshirish
        const myBox = { x: newX + 2, y: newY + 2, w: 28, h: 28 };
        for (const tank of otherTanks) {
            if (tank === this || tank.isDestroyed) continue;
            const otherBox = { x: tank.x + 2, y: tank.y + 2, w: 28, h: 28 };
            if (this.intersects(myBox, otherBox)) {
                return false;
            }
        }

        return true;
    }

    intersects(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    // Yo'nalish o'zgarganda qulay burilish uchun 16px to'rga tekislash (Snap-to-grid)
    alignToGrid(axis) {
        const snapThreshold = 8;
        if (axis === 'x') {
            const remainder = this.x % 16;
            if (remainder < snapThreshold) {
                this.x -= remainder;
            } else if (remainder >= 16 - snapThreshold) {
                this.x += (16 - remainder);
            }
        } else if (axis === 'y') {
            const remainder = this.y % 16;
            if (remainder < snapThreshold) {
                this.y -= remainder;
            } else if (remainder >= 16 - snapThreshold) {
                this.y += (16 - remainder);
            }
        }
    }

    // O'q uzish
    shoot(game) {
        // Faol o'qlarni tozalash
        this.bullets = this.bullets.filter(b => !b.isDestroyed);

        if (this.bullets.length >= this.maxBullets || this.cooldown > 0) {
            return false;
        }

        // Stvol uchidan o'q chiqarish
        let bx = this.x + 16;
        let by = this.y + 16;
        const offset = 18;

        if (this.direction === DIR.UP) {
            by -= offset;
        } else if (this.direction === DIR.RIGHT) {
            bx += offset;
        } else if (this.direction === DIR.DOWN) {
            by += offset;
        } else if (this.direction === DIR.LEFT) {
            bx -= offset;
        }

        const bullet = new Bullet(bx, by, this.direction, this.bulletSpeed, this.bulletPower, this);
        this.bullets.push(bullet);
        game.bullets.push(bullet);
        this.cooldown = this.maxCooldown;

        if (this.isPlayer) {
            sounds.playShoot();
        }

        return true;
    }

    takeDamage(amount = 1) {
        if (this.shieldTimer > 0) {
            return false; // Qalqon himoya qiladi
        }
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDestroyed = true;
            return true; // Tank yo'q qilindi
        }
        return false;
    }
}

// -------------------------------------------------------------
// O'YINCHI TANKI (PLAYER TANK)
// -------------------------------------------------------------
class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, true);
        this.lives = 3;
        this.score = 0;
        this.level = 1;
        this.applyLevelStats();
        this.shieldTimer = 180; // Boshida 3 soniya himoya qalqoni
    }

    applyLevelStats() {
        if (this.level === 1) {
            this.speed = 1.8;
            this.bulletSpeed = 4.2;
            this.maxBullets = 1;
            this.bulletPower = 1;
        } else if (this.level === 2) {
            this.speed = 2.0;
            this.bulletSpeed = 6.0;
            this.maxBullets = 1;
            this.bulletPower = 1;
        } else if (this.level === 3) {
            this.speed = 2.2;
            this.bulletSpeed = 6.5;
            this.maxBullets = 2; // Bir vaqtda 2 ta o'q
            this.bulletPower = 1;
        } else {
            // Daraja 4: Super Tank (Po'lat devorlarni buzadi!)
            this.speed = 2.3;
            this.bulletSpeed = 7.0;
            this.maxBullets = 2;
            this.bulletPower = 4;
        }
    }

    upgrade() {
        if (this.level < 4) {
            this.level++;
            this.applyLevelStats();
        }
    }

    respawn() {
        this.x = 128;
        this.y = 384;
        this.direction = DIR.UP;
        this.isDestroyed = false;
        this.health = 1;
        this.shieldTimer = 180; // 3 soniya qalqon
        this.bullets = [];
        this.cooldown = 0;
    }

    update(input, map, otherTanks, game) {
        if (this.isDestroyed) return;

        if (this.cooldown > 0) this.cooldown--;
        if (this.shieldTimer > 0) this.shieldTimer--;

        let isMoving = false;
        let newX = this.x;
        let newY = this.y;

        // Boshqaruv tugmalari (Keyboard & On-screen buttons)
        if (input.up) {
            if (this.direction !== DIR.UP) {
                this.direction = DIR.UP;
                this.alignToGrid('x');
            }
            newY -= this.speed;
            isMoving = true;
        } else if (input.down) {
            if (this.direction !== DIR.DOWN) {
                this.direction = DIR.DOWN;
                this.alignToGrid('x');
            }
            newY += this.speed;
            isMoving = true;
        } else if (input.left) {
            if (this.direction !== DIR.LEFT) {
                this.direction = DIR.LEFT;
                this.alignToGrid('y');
            }
            newX -= this.speed;
            isMoving = true;
        } else if (input.right) {
            if (this.direction !== DIR.RIGHT) {
                this.direction = DIR.RIGHT;
                this.alignToGrid('y');
            }
            newX += this.speed;
            isMoving = true;
        }

        if (isMoving) {
            this.animTick++;
            sounds.startMove();
            if (this.canMoveTo(newX, newY, map, otherTanks)) {
                this.x = newX;
                this.y = newY;
            }
        } else {
            sounds.stopMove();
        }

        // O'q uzish
        if (input.shoot) {
            this.shoot(game);
        }
    }
}

// -------------------------------------------------------------
// DUSHMAN TANKI (ENEMY TANK - SUN'IY INTELLEKT)
// -------------------------------------------------------------
class EnemyTank extends Tank {
    constructor(x, y, type = 0, isFlashing = false) {
        super(x, y, false);
        this.type = type;
        this.isFlashing = isFlashing;
        this.direction = DIR.DOWN; // Dushmanlar pastga qarab harakatlanadi

        // Tank turlariga qarab xususiyatlar
        switch (type) {
            case 0: // Oddiy tank (Basic Tank)
                this.speed = 1.3;
                this.health = 1;
                this.points = 100;
                this.bulletSpeed = 3.5;
                break;
            case 1: // Tezkor razvedkachi (Fast Scout)
                this.speed = 2.4;
                this.health = 1;
                this.points = 200;
                this.bulletSpeed = 4.5;
                break;
            case 2: // Kuchli to'pli tank (Power Tank)
                this.speed = 1.4;
                this.health = 1;
                this.points = 300;
                this.bulletSpeed = 6.0;
                break;
            case 3: // Og'ir zirhli tank (Armor Tank - 4 marta o'q tegishi kerak!)
                this.speed = 1.2;
                this.health = 4;
                this.points = 400;
                this.bulletSpeed = 4.0;
                break;
        }

        this.maxHealth = this.health;
        this.dirChangeTimer = Math.floor(Math.random() * 60) + 40;
        this.shootTimer = Math.floor(Math.random() * 40) + 20;
    }

    update(map, otherTanks, game, isFrozen = false) {
        if (this.isDestroyed) return;

        if (this.cooldown > 0) this.cooldown--;

        // Agar "Soat" (Clock) bonusi faol bo'lsa, dushman muzlaydi!
        if (isFrozen) return;

        this.animTick++;
        this.dirChangeTimer--;
        this.shootTimer--;

        // Vaqti-vaqti bilan yo'nalishni o'zgartirish
        if (this.dirChangeTimer <= 0) {
            this.chooseNewDirection();
            this.dirChangeTimer = Math.floor(Math.random() * 90) + 40;
        }

        // Harakat
        const vec = DIR_VEC[this.direction];
        const newX = this.x + vec.x * this.speed;
        const newY = this.y + vec.y * this.speed;

        if (this.canMoveTo(newX, newY, map, otherTanks)) {
            this.x = newX;
            this.y = newY;
        } else {
            // To'siqqa duch kelganda yangi yo'nalish tanlash
            this.chooseNewDirection();
            // To'siqni yo'q qilish uchun otish
            if (Math.random() < 0.6) {
                this.shoot(game);
            }
        }

        // O'q uzish qarori
        if (this.shootTimer <= 0) {
            this.shoot(game);
            this.shootTimer = Math.floor(Math.random() * 50) + 30;
        }
    }

    chooseNewDirection() {
        // Pastga (Shtab tomon) yo'nalish ehtimolini oshirish (Tactical bias)
        const rand = Math.random();
        if (rand < 0.40) {
            this.direction = DIR.DOWN; // 40% shtab tomon
        } else if (rand < 0.65) {
            this.direction = DIR.LEFT;
        } else if (rand < 0.90) {
            this.direction = DIR.RIGHT;
        } else {
            this.direction = DIR.UP;
        }

        if (this.direction === DIR.UP || this.direction === DIR.DOWN) {
            this.alignToGrid('x');
        } else {
            this.alignToGrid('y');
        }
    }
}
