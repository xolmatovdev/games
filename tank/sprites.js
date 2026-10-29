// ============================================================================
// SPRITES & RETRO GRAPHICS RENDERER (Pixel-perfect Canvas 2D)
// Hech qanday tashqi rasm talab qilinmaydi - 100% toza Canvas pixel-art
// ============================================================================

const Sprites = {
    // -------------------------------------------------------------
    // G'ISHT DEVOR (16x16 piksel)
    // -------------------------------------------------------------
    drawBrickTile(ctx, x, y) {
        ctx.fillStyle = '#b84418';
        ctx.fillRect(x, y, 16, 16);

        // G'isht chiziqlari (mortar)
        ctx.fillStyle = '#000000';
        // Gorizontal chiziqlar
        ctx.fillRect(x, y + 4, 16, 1);
        ctx.fillRect(x, y + 8, 16, 1);
        ctx.fillRect(x, y + 12, 16, 1);

        // Vertikal chiziqlar (shaxmat tartibida)
        ctx.fillRect(x + 8, y, 1, 4);
        ctx.fillRect(x + 4, y + 5, 1, 3);
        ctx.fillRect(x + 12, y + 5, 1, 3);
        ctx.fillRect(x + 8, y + 9, 1, 3);
        ctx.fillRect(x + 4, y + 13, 1, 3);
        ctx.fillRect(x + 12, y + 13, 1, 3);

        // G'isht yaltirashi (highlight)
        ctx.fillStyle = '#e86a38';
        ctx.fillRect(x + 1, y + 1, 6, 1);
        ctx.fillRect(x + 9, y + 1, 6, 1);
        ctx.fillRect(x + 1, y + 9, 6, 1);
        ctx.fillRect(x + 9, y + 9, 6, 1);
    },

    // -------------------------------------------------------------
    // PO'LAT / TEMIR DEVOR (16x16 piksel)
    // -------------------------------------------------------------
    drawSteelTile(ctx, x, y) {
        ctx.fillStyle = '#adadad';
        ctx.fillRect(x, y, 16, 16);

        // Ichki metall panellar (4 ta kvadrat)
        const plates = [
            [x + 1, y + 1],
            [x + 9, y + 1],
            [x + 1, y + 9],
            [x + 9, y + 9]
        ];

        plates.forEach(([px, py]) => {
            // Oq nur
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py, 6, 1);
            ctx.fillRect(px, py, 1, 6);

            // To'q soya
            ctx.fillStyle = '#636363';
            ctx.fillRect(px + 1, py + 5, 5, 1);
            ctx.fillRect(px + 5, py + 1, 1, 5);
        });

        // O'rta chiziqlar
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x, y + 7, 16, 2);
        ctx.fillRect(x + 7, y, 2, 16);
    },

    // -------------------------------------------------------------
    // O'RMON / DARAXTZOR (16x16 piksel)
    // -------------------------------------------------------------
    drawForestTile(ctx, x, y) {
        ctx.fillStyle = '#227800';
        ctx.fillRect(x, y, 16, 16);

        // Yashil barg dog'lari
        ctx.fillStyle = '#44b010';
        ctx.fillRect(x + 2, y + 1, 5, 4);
        ctx.fillRect(x + 9, y + 2, 5, 5);
        ctx.fillRect(x + 1, y + 9, 6, 5);
        ctx.fillRect(x + 10, y + 9, 4, 6);

        // Och yashil barg nurlari
        ctx.fillStyle = '#80e030';
        ctx.fillRect(x + 3, y + 2, 2, 2);
        ctx.fillRect(x + 11, y + 3, 2, 2);
        ctx.fillRect(x + 2, y + 10, 2, 2);

        // Qora soya
        ctx.fillStyle = '#0a3a00';
        ctx.fillRect(x, y + 7, 16, 1);
        ctx.fillRect(x + 7, y, 1, 16);
    },

    // -------------------------------------------------------------
    // SUV (16x16 piksel - animatsiyali to'lqinlar)
    // -------------------------------------------------------------
    drawWaterTile(ctx, x, y, tick = 0) {
        ctx.fillStyle = '#1050c0';
        ctx.fillRect(x, y, 16, 16);

        ctx.fillStyle = '#4090f0';
        const offset = Math.floor(tick / 15) % 2;

        if (offset === 0) {
            ctx.fillRect(x + 2, y + 3, 5, 2);
            ctx.fillRect(x + 9, y + 7, 6, 2);
            ctx.fillRect(x + 3, y + 11, 5, 2);
            ctx.fillRect(x + 10, y + 14, 4, 2);
        } else {
            ctx.fillRect(x + 4, y + 2, 6, 2);
            ctx.fillRect(x + 1, y + 6, 5, 2);
            ctx.fillRect(x + 8, y + 10, 6, 2);
            ctx.fillRect(x + 2, y + 13, 5, 2);
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + (offset === 0 ? 3 : 5), y + (offset === 0 ? 3 : 2), 2, 1);
        ctx.fillRect(x + (offset === 0 ? 10 : 9), y + (offset === 0 ? 7 : 10), 2, 1);
    },

    // -------------------------------------------------------------
    // MUZ (16x16 piksel - sirpanchiq sirt)
    // -------------------------------------------------------------
    drawIceTile(ctx, x, y) {
        ctx.fillStyle = '#c0d8e8';
        ctx.fillRect(x, y, 16, 16);

        ctx.fillStyle = '#e8f4fc';
        ctx.fillRect(x + 1, y + 1, 14, 2);
        ctx.fillRect(x + 1, y + 8, 14, 2);

        ctx.fillStyle = '#88a8c0';
        ctx.fillRect(x, y + 15, 16, 1);
        ctx.fillRect(x + 15, y, 1, 16);
    },

    // -------------------------------------------------------------
    // SHTAB BURGUTI (32x32 piksel)
    // -------------------------------------------------------------
    drawBase(ctx, x, y, isRuined = false) {
        if (!isRuined) {
            // Oltin burgut ramzi
            // Orqa fon qora
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, 32, 32);

            // Burgut tanasi va qanotlari (oltin/sariq)
            ctx.fillStyle = '#d8a010';
            // Qanotlar kengligi
            ctx.fillRect(x + 4, y + 6, 24, 18);
            ctx.fillRect(x + 6, y + 4, 20, 22);

            // Och sariq yaltiroq qismlar
            ctx.fillStyle = '#fce438';
            ctx.fillRect(x + 13, y + 6, 6, 14); // Ko'krak
            ctx.fillRect(x + 6, y + 8, 4, 12);  // Chap qanot
            ctx.fillRect(x + 22, y + 8, 4, 12); // O'ng qanot

            // Burgut boshi va tumshug'i
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 13, y + 2, 6, 5);
            ctx.fillStyle = '#e86a10';
            ctx.fillRect(x + 15, y + 4, 2, 3); // Tumshuq

            // Qanot patlari va naqshlar
            ctx.fillStyle = '#804000';
            ctx.fillRect(x + 7, y + 21, 3, 5);
            ctx.fillRect(x + 22, y + 21, 3, 5);
            ctx.fillRect(x + 14, y + 21, 4, 7);

            // Yurak/Yulduz belgisi
            ctx.fillStyle = '#d01010';
            ctx.fillRect(x + 14, y + 11, 4, 5);
        } else {
            // Vayron bo'lgan shtab (o'yin tugadi)
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, 32, 32);

            // Vayronalar kulrang/qizil
            ctx.fillStyle = '#555555';
            ctx.fillRect(x + 4, y + 16, 24, 12);
            ctx.fillRect(x + 8, y + 10, 16, 8);

            // Singan bayroq tayoqchasi
            ctx.fillStyle = '#888888';
            ctx.fillRect(x + 14, y + 4, 3, 18);

            // Singan bayroq
            ctx.fillStyle = '#c02020';
            ctx.fillRect(x + 17, y + 6, 8, 6);
            ctx.fillRect(x + 19, y + 12, 5, 3);

            // Tutun va kul dog'lari
            ctx.fillStyle = '#222222';
            ctx.fillRect(x + 6, y + 22, 6, 4);
            ctx.fillRect(x + 18, y + 20, 8, 5);
        }
    },

    // -------------------------------------------------------------
    // TANK CHIZISH (32x32 piksel, har xil yo'nalish va darajalar)
    // -------------------------------------------------------------
    drawTank(ctx, tank) {
        ctx.save();
        ctx.translate(tank.x + 16, tank.y + 16);

        // Yo'nalish bo'yicha aylantirish: 0: Yuqori, 1: O'ng, 2: Past, 3: Chap
        const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        ctx.rotate(angles[tank.direction]);

        // Ranglar palitrasi
        let primaryColor, secondaryColor, treadColor, trackColor;
        const tick = Math.floor(tank.animTick / 4) % 2;

        if (tank.isPlayer) {
            // O'yinchi tanki darajalariga qarab
            if (tank.level === 1) {
                primaryColor = '#e8a810';   // Sariq-oltin
                secondaryColor = '#fce440'; // Och sariq
            } else if (tank.level === 2) {
                primaryColor = '#309830';   // Yashil
                secondaryColor = '#60e060';
            } else if (tank.level === 3) {
                primaryColor = '#2080d0';   // Moviy ko'k
                secondaryColor = '#60c0ff';
            } else {
                primaryColor = '#e03030';   // Kuchli qizil (Super Tank)
                secondaryColor = '#ff8080';
            }
            treadColor = '#202020';
            trackColor = '#707070';
        } else {
            // Dushman tanki
            if (tank.isFlashing && (Math.floor(Date.now() / 120) % 2 === 0)) {
                // Bonusli dushman (qizil-kumush chaqnash)
                primaryColor = '#e02020';
                secondaryColor = '#ffffff';
                treadColor = '#500000';
                trackColor = '#ffaaaa';
            } else {
                switch (tank.type) {
                    case 0: // Oddiy (Basic)
                        primaryColor = '#a0a0a0';
                        secondaryColor = '#e0e0e0';
                        break;
                    case 1: // Tezkor (Fast Scout)
                        primaryColor = '#4090b0';
                        secondaryColor = '#90e0ff';
                        break;
                    case 2: // Kuchli o'qli (Power)
                        primaryColor = '#a07030';
                        secondaryColor = '#e0b060';
                        break;
                    case 3: // Zirhli (Armor) - joniga qarab rang o'zgaradi!
                        if (tank.health >= 4) {
                            primaryColor = '#208020'; // To'q yashil
                            secondaryColor = '#60d060';
                        } else if (tank.health === 3) {
                            primaryColor = '#a09020'; // Sariq-yashil
                            secondaryColor = '#d0c040';
                        } else if (tank.health === 2) {
                            primaryColor = '#b05020'; // To'q sariq
                            secondaryColor = '#e08040';
                        } else {
                            primaryColor = '#a02020'; // Deyarli yo'q bo'lish arafasidagi qizil
                            secondaryColor = '#e05050';
                        }
                        break;
                    default:
                        primaryColor = '#888888';
                        secondaryColor = '#cccccc';
                }
                treadColor = '#181818';
                trackColor = '#555555';
            }
        }

        // 1. GULISENIYALAR (Chap va o'ng zanjirlar)
        // Chap zanjir
        ctx.fillStyle = treadColor;
        ctx.fillRect(-15, -14, 6, 28);
        // O'ng zanjir
        ctx.fillRect(9, -14, 6, 28);

        // Zanjir chiziqlari (animatsiyali harakat)
        ctx.fillStyle = trackColor;
        for (let i = -12; i <= 12; i += 4) {
            const yPos = i + (tick ? 1 : 0);
            ctx.fillRect(-15, yPos, 6, 2);
            ctx.fillRect(9, yPos, 6, 2);
        }

        // 2. KORPUS (Asosiy tana)
        ctx.fillStyle = primaryColor;
        ctx.fillRect(-9, -11, 18, 22);

        // Korpus nurlari va soyalari
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(-7, -9, 14, 18);

        // 3. MINORA (Turret)
        ctx.fillStyle = primaryColor;
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(-4, -4, 8, 8);

        // Minora markazidagi lyuk
        ctx.fillStyle = '#101010';
        ctx.fillRect(-2, -2, 4, 4);

        // 4. TO'P VA STVOL (Cannon barrel)
        ctx.fillStyle = primaryColor;
        if (tank.level >= 3 && tank.isPlayer) {
            // Qo'shaloq stvol
            ctx.fillRect(-4, -16, 2, 11);
            ctx.fillRect(2, -16, 2, 11);
            ctx.fillStyle = secondaryColor;
            ctx.fillRect(-5, -17, 4, 3);
            ctx.fillRect(1, -17, 4, 3);
        } else {
            // Yagona stvol
            const barrelLen = (tank.level >= 2 && tank.isPlayer) ? 17 : 14;
            ctx.fillRect(-2, -barrelLen, 4, barrelLen - 3);
            // Stvol uchi (Muzzle brake)
            ctx.fillStyle = secondaryColor;
            ctx.fillRect(-3, -barrelLen, 6, 3);
        }

        ctx.restore();

        // 5. QALQON AURA (Shield)
        if (tank.shieldTimer > 0) {
            const auraTick = Math.floor(Date.now() / 50) % 4;
            const shieldColors = ['#00e5ff', '#ffffff', '#ffeb3b', '#00e5ff'];
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = shieldColors[auraTick];
            ctx.lineWidth = 2.5;
            ctx.arc(tank.x + 16, tank.y + 16, 19, 0, Math.PI * 2);
            ctx.stroke();

            // Ichki nuqtali aylanuvchi chiziq
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.arc(tank.x + 16, tank.y + 16, 17, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    },

    // -------------------------------------------------------------
    // O'Q (BULLET)
    // -------------------------------------------------------------
    drawBullet(ctx, bullet) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    },

    // -------------------------------------------------------------
    // BONUSLAR (POWER-UPS) - 28x28 piksel
    // -------------------------------------------------------------
    drawPowerup(ctx, p) {
        const x = p.x;
        const y = p.y;
        const blink = Math.floor(Date.now() / 150) % 2 === 0;

        // Qora ramka
        ctx.fillStyle = blink ? '#101010' : '#222222';
        ctx.fillRect(x, y, 28, 28);
        ctx.strokeStyle = blink ? '#fce438' : '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, 26, 26);

        switch (p.type) {
            case 'helmet': // Qalqon / Himoya shlemi
                ctx.fillStyle = '#00d0ff';
                ctx.beginPath();
                ctx.arc(x + 14, y + 14, 9, Math.PI, 0, false);
                ctx.lineTo(x + 23, y + 19);
                ctx.lineTo(x + 5, y + 19);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 9, y + 10, 3, 4);
                break;

            case 'clock': // Soat (Vaqtni to'xtatish)
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x + 14, y + 14, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 14, y + 14);
                ctx.lineTo(x + 14, y + 8);
                ctx.moveTo(x + 14, y + 14);
                ctx.lineTo(x + 18, y + 14);
                ctx.stroke();
                break;

            case 'shovel': // Kurak (Shtabni po'latga aylantirish)
                ctx.fillStyle = '#adadad';
                ctx.fillRect(x + 11, y + 6, 6, 7);
                ctx.fillStyle = '#e88020';
                ctx.fillRect(x + 13, y + 13, 2, 10);
                ctx.fillRect(x + 11, y + 21, 6, 2);
                break;

            case 'bomb': // Granata (Barcha dushmanlarni yo'q qilish)
                ctx.fillStyle = '#228822';
                ctx.beginPath();
                ctx.arc(x + 14, y + 16, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#888888';
                ctx.fillRect(x + 12, y + 8, 4, 3);
                // Pilik
                ctx.strokeStyle = '#ff3333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 14, y + 8);
                ctx.lineTo(x + 17, y + 5);
                ctx.stroke();
                break;

            case 'star': // Yulduzcha (Tankni takomillashtirish)
                ctx.fillStyle = '#fce438';
                this.drawStar(ctx, x + 14, y + 14, 5, 9, 4);
                break;

            case 'tank': // 1-UP (Qo'shimcha hayot)
                ctx.fillStyle = '#e8a810';
                ctx.fillRect(x + 7, y + 10, 14, 10);
                ctx.fillRect(x + 12, y + 6, 4, 5);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 9, y + 12, 10, 4);
                break;

            case 'gun': // Qurol (Birdaniga super tankka aylantirish)
                ctx.fillStyle = '#d02020';
                ctx.fillRect(x + 7, y + 11, 14, 5);
                ctx.fillRect(x + 8, y + 16, 5, 7);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 16, y + 12, 4, 2);
                break;
        }
    },

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    },

    // -------------------------------------------------------------
    // TANK PAYDO BO'LISH YULDUZI (Spawning star)
    // -------------------------------------------------------------
    drawSpawnStar(ctx, x, y, frame) {
        const sizes = [4, 8, 12, 16, 12, 8, 4];
        const r = sizes[frame % sizes.length];
        ctx.save();
        ctx.fillStyle = '#ffffff';
        this.drawStar(ctx, x + 16, y + 16, 4, r, r / 3);
        ctx.fillStyle = '#ffff00';
        this.drawStar(ctx, x + 16, y + 16, 4, r * 0.7, r / 4);
        ctx.restore();
    },

    // -------------------------------------------------------------
    // PORTLASH (EXPLOSION)
    // -------------------------------------------------------------
    drawExplosion(ctx, exp) {
        const cx = exp.x;
        const cy = exp.y;
        const p = exp.progress; // 0 dan 1 gacha

        if (exp.isLarge) {
            // Katta tank portlashi
            const radius = 6 + p * 24;
            const colors = ['#ffffff', '#ffeb3b', '#ff5722', '#d50000', '#424242'];
            const colorIdx = Math.min(Math.floor(p * colors.length), colors.length - 1);

            ctx.save();
            // Tashqi olovli bulut
            ctx.fillStyle = colors[colorIdx];
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 + p;
                const ox = cx + Math.cos(angle) * (radius * 0.6);
                const oy = cy + Math.sin(angle) * (radius * 0.6);
                ctx.beginPath();
                ctx.arc(ox, oy, radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // O'rta olovli yadro
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Kichik o'q zarbasi
            const radius = 3 + p * 10;
            ctx.save();
            ctx.fillStyle = p < 0.5 ? '#ffffff' : '#ff9800';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
};
