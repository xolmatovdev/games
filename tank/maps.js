// ============================================================================
// MAPS & TILE DEFINITIONS FOR BATTLE CITY / TANK 1990
// Grid: 26 ustun x 26 qator (har bir katak 16x16 piksel) -> 416x416 o'yin maydoni
// ============================================================================

const TILES = {
    EMPTY: 0,
    BRICK: 1,
    STEEL: 2,
    FOREST: 3,
    WATER: 4,
    ICE: 5,
    BASE: 9,
    BASE_RUIN: 10
};

// 26x26 bo'sh xarita yaratish
function createEmptyMap() {
    const map = [];
    for (let r = 0; r < 26; r++) {
        map.push(new Array(26).fill(TILES.EMPTY));
    }
    return map;
}

// Baza (Qal'a / Shtab burguti) va uning himoya devorlarini o'rnatish
function setupBase(map, wallTile = TILES.BRICK) {
    // Shtab 2x2 katak: qator 24..25, ustun 12..13
    map[24][12] = TILES.BASE;
    map[24][13] = TILES.BASE;
    map[25][12] = TILES.BASE;
    map[25][13] = TILES.BASE;

    // Himoya devorlari (yuqori, chap, o'ng)
    map[23][11] = wallTile;
    map[23][12] = wallTile;
    map[23][13] = wallTile;
    map[23][14] = wallTile;

    map[24][11] = wallTile;
    map[24][14] = wallTile;

    map[25][11] = wallTile;
    map[25][14] = wallTile;
}

// Xaritaga 2x2 to'siq qo'shish yordamchisi (NES Battle City 32x32 bloklari)
function addBlock(map, r, c, type) {
    if (r >= 0 && r < 25 && c >= 0 && c < 25) {
        map[r][c] = type;
        map[r][c + 1] = type;
        map[r + 1][c] = type;
        map[r + 1][c + 1] = type;
    }
}

// Vertikal yoki gorizontal to'siqlar chizish
function addWall(map, r1, c1, r2, c2, type) {
    for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
            if (r >= 0 && r < 26 && c >= 0 && c < 26) {
                map[r][c] = type;
            }
        }
    }
}

// -------------------------------------------------------------
// BOSQICHLAR XARITALARI (STAGES)
// -------------------------------------------------------------

function getStageMap(stageNumber) {
    const map = createEmptyMap();
    setupBase(map, TILES.BRICK);

    const s = ((stageNumber - 1) % 5) + 1;

    if (s === 1) {
        // Klassik 1-bosqich (Classic Stage 1)
        // Vertikal g'isht ustunlari
        addWall(map, 2, 3, 10, 4, TILES.BRICK);
        addWall(map, 2, 7, 10, 8, TILES.BRICK);
        addWall(map, 4, 11, 8, 14, TILES.BRICK);
        addWall(map, 2, 17, 10, 18, TILES.BRICK);
        addWall(map, 2, 21, 10, 22, TILES.BRICK);

        // Markazdagi po'lat to'siq
        addBlock(map, 12, 12, TILES.STEEL);

        // O'rta qatordagi g'ishtlar
        addWall(map, 13, 0, 14, 4, TILES.BRICK);
        addWall(map, 13, 21, 14, 25, TILES.BRICK);
        addWall(map, 13, 7, 14, 10, TILES.BRICK);
        addWall(map, 13, 15, 14, 18, TILES.BRICK);

        // Pastki ustunlar
        addWall(map, 16, 3, 22, 4, TILES.BRICK);
        addWall(map, 16, 7, 20, 8, TILES.BRICK);
        addWall(map, 16, 17, 20, 18, TILES.BRICK);
        addWall(map, 16, 21, 22, 22, TILES.BRICK);

        // Bir nechta po'lat bloklar
        addBlock(map, 6, 0, TILES.STEEL);
        addBlock(map, 6, 24, TILES.STEEL);
        addBlock(map, 18, 12, TILES.BRICK);
    } 
    else if (s === 2) {
        // 2-bosqich: Daryo va daraxtzorlar (River & Forest)
        // Markazdagi daryo kanali
        addWall(map, 12, 0, 13, 10, TILES.WATER);
        addWall(map, 12, 15, 13, 25, TILES.WATER);

        // Ko'priklar atrofidagi to'siqlar
        addWall(map, 10, 11, 15, 11, TILES.BRICK);
        addWall(map, 10, 14, 15, 14, TILES.BRICK);

        // O'rmonlar (yashirinib olish uchun)
        addWall(map, 2, 2, 6, 6, TILES.FOREST);
        addWall(map, 2, 19, 6, 23, TILES.FOREST);
        addWall(map, 16, 2, 20, 6, TILES.FOREST);
        addWall(map, 16, 19, 20, 23, TILES.FOREST);

        // G'isht va temir istehkomlar
        addWall(map, 4, 11, 7, 14, TILES.BRICK);
        addBlock(map, 8, 4, TILES.STEEL);
        addBlock(map, 8, 20, TILES.STEEL);
        addWall(map, 18, 8, 22, 9, TILES.BRICK);
        addWall(map, 18, 16, 22, 17, TILES.BRICK);
    } 
    else if (s === 3) {
        // 3-bosqich: Po'lat labirint (Steel Maze)
        addWall(map, 2, 4, 3, 21, TILES.BRICK);
        addWall(map, 6, 2, 18, 3, TILES.STEEL);
        addWall(map, 6, 22, 18, 23, TILES.STEEL);

        addWall(map, 6, 8, 7, 17, TILES.BRICK);
        addWall(map, 10, 6, 11, 10, TILES.STEEL);
        addWall(map, 10, 15, 11, 19, TILES.STEEL);

        addWall(map, 14, 8, 15, 17, TILES.BRICK);
        addWall(map, 18, 6, 22, 7, TILES.BRICK);
        addWall(map, 18, 18, 22, 19, TILES.BRICK);

        // Muzliklar (tank sirpanadi)
        addWall(map, 12, 11, 13, 14, TILES.ICE);
        addWall(map, 8, 12, 9, 13, TILES.ICE);
    } 
    else if (s === 4) {
        // 4-bosqich: Qamal va O'rmon (Fortress Siege)
        addWall(map, 1, 6, 5, 8, TILES.FOREST);
        addWall(map, 1, 17, 5, 19, TILES.FOREST);
        addWall(map, 8, 1, 16, 5, TILES.FOREST);
        addWall(map, 8, 20, 16, 24, TILES.FOREST);

        addWall(map, 6, 8, 8, 17, TILES.BRICK);
        addBlock(map, 7, 12, TILES.STEEL);

        addWall(map, 10, 9, 15, 10, TILES.BRICK);
        addWall(map, 10, 15, 15, 16, TILES.BRICK);

        addWall(map, 14, 11, 15, 14, TILES.WATER);

        addWall(map, 18, 3, 22, 5, TILES.BRICK);
        addWall(map, 18, 20, 22, 22, TILES.BRICK);
        addBlock(map, 19, 12, TILES.STEEL);
    } 
    else if (s === 5) {
        // 5-bosqich: Oliy Jang maydoni (Heavy Citadel)
        addWall(map, 2, 2, 8, 3, TILES.STEEL);
        addWall(map, 2, 22, 8, 23, TILES.STEEL);

        addWall(map, 4, 7, 10, 8, TILES.BRICK);
        addWall(map, 4, 17, 10, 18, TILES.BRICK);

        addWall(map, 12, 4, 13, 9, TILES.BRICK);
        addWall(map, 12, 16, 13, 21, TILES.BRICK);
        addWall(map, 10, 11, 14, 14, TILES.WATER);

        addWall(map, 16, 2, 20, 3, TILES.BRICK);
        addWall(map, 16, 22, 20, 23, TILES.BRICK);
        addWall(map, 16, 7, 21, 8, TILES.STEEL);
        addWall(map, 16, 17, 21, 18, TILES.STEEL);

        addWall(map, 18, 11, 20, 14, TILES.FOREST);
    }

    return map;
}
