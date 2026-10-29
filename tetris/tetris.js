/**
 * TETRIS PRO - Classic & Neon Edition
 * Pure JavaScript Implementation
 */

(function () {
  'use strict';

  // --- O'yin Konfiguratsiyasi va O'lchamlari ---
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30; // 10 * 30 = 300px kenglik, 20 * 30 = 600px balandlik

  // DOM Elementlari
  const canvas = document.getElementById('tetrisCanvas');
  const ctx = canvas.getContext('2d');
  const holdCanvas = document.getElementById('holdCanvas');
  const holdCtx = holdCanvas.getContext('2d');
  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const levelEl = document.getElementById('level');
  const linesEl = document.getElementById('lines');
  const finalScoreEl = document.getElementById('finalScore');
  const finalLinesEl = document.getElementById('finalLines');

  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');

  const startBtn = document.getElementById('startBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const pauseToggleBtn = document.getElementById('pauseToggleBtn');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundState = document.getElementById('soundState');

  // Mobil tugmalar
  const ctrlLeft = document.getElementById('ctrlLeft');
  const ctrlRight = document.getElementById('ctrlRight');
  const ctrlDown = document.getElementById('ctrlDown');
  const ctrlRotate = document.getElementById('ctrlRotate');
  const ctrlDrop = document.getElementById('ctrlDrop');
  const ctrlHold = document.getElementById('ctrlHold');

  // --- Figuralar (Tetrominoes) ---
  const PIECES = {
    I: {
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      color: '#00f0f0',
      glow: 'rgba(0, 240, 240, 0.6)'
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      color: '#2855ff',
      glow: 'rgba(40, 85, 255, 0.6)'
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      color: '#ff8800',
      glow: 'rgba(255, 136, 0, 0.6)'
    },
    O: {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: '#ffee00',
      glow: 'rgba(255, 238, 0, 0.6)'
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      color: '#00ff66',
      glow: 'rgba(0, 255, 102, 0.6)'
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      color: '#b026ff',
      glow: 'rgba(176, 38, 255, 0.6)'
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      color: '#ff0055',
      glow: 'rgba(255, 0, 85, 0.6)'
    }
  };

  const PIECE_KEYS = Object.keys(PIECES);

  // --- Audio Tizimi (Web Audio API - tashqi fayllarsiz ishlaydi) ---
  class SoundManager {
    constructor() {
      this.enabled = localStorage.getItem('tetris_sound') !== 'false';
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('tetris_sound', this.enabled);
      return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error', e);
      }
    }

    move() {
      this.playTone(220, 'triangle', 0.05, 0.08);
    }

    rotate() {
      this.playTone(330, 'sine', 0.08, 0.1);
    }

    drop() {
      this.playTone(150, 'triangle', 0.12, 0.15);
    }

    hardDrop() {
      this.playTone(90, 'sawtooth', 0.18, 0.2);
    }

    clear() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'square', 0.15, 0.12);
        }, idx * 60);
      });
    }

    tetris() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [330, 392, 523, 659, 784];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.2, 0.18);
        }, idx * 75);
      });
    }

    gameOver() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [300, 250, 200, 150];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.3, 0.2);
        }, idx * 120);
      });
    }
  }

  const sound = new SoundManager();

  // --- O'yin Holati ---
  let board = createMatrix(COLS, ROWS);
  let currentPiece = null;
  let nextPieceKey = null;
  let holdPieceKey = null;
  let canHold = true;
  let bag = [];

  let score = 0;
  let highScore = parseInt(localStorage.getItem('tetris_highscore') || '0', 10);
  let level = 1;
  let lines = 0;

  let isPlaying = false;
  let isPaused = false;
  let isGameOver = false;

  let dropCounter = 0;
  let dropInterval = 1000;
  let lastTime = 0;
  let animationFrameId = null;

  // Qator tozalash animatsiyasi uchun zarralar
  let particles = [];

  // --- Matritsa va Yordamchi Funksiyalar ---
  function createMatrix(width, height) {
    const matrix = [];
    for (let h = 0; h < height; h++) {
      matrix.push(new Array(width).fill(0));
    }
    return matrix;
  }

  function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
  }

  // 7-bag random generator (barcha figuralar teng tushishini ta'minlaydi)
  function getNextBagPiece() {
    if (bag.length === 0) {
      bag = [...PIECE_KEYS];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }

  // Yangi figura ob'ekti
  function createPieceObject(type) {
    const pieceDef = PIECES[type];
    const shape = cloneMatrix(pieceDef.shape);
    return {
      type: type,
      shape: shape,
      color: pieceDef.color,
      glow: pieceDef.glow,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: 0
    };
  }

  // To'qnashuvni tekshirish
  function collide(boardMatrix, piece) {
    const shape = piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const newX = piece.x + c;
          const newY = piece.y + r;

          // Devorlar va tag qism
          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          // Mavjud bloklar bilan to'qnashuv
          if (newY >= 0 && boardMatrix[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Figuraning soyasini (Ghost) hisoblash
  function getGhostPiece() {
    if (!currentPiece) return null;
    const ghost = {
      ...currentPiece,
      shape: currentPiece.shape,
      x: currentPiece.x,
      y: currentPiece.y
    };

    while (!collide(board, ghost)) {
      ghost.y++;
    }
    ghost.y--;
    return ghost;
  }

  // Matritsani aylantirish (Clockwise)
  function rotateMatrix(matrix) {
    const n = matrix.length;
    const result = [];
    for (let i = 0; i < n; i++) {
      result.push(new Array(n).fill(0));
    }
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        result[c][n - 1 - r] = matrix[r][c];
      }
    }
    return result;
  }

  // Wall-kick bilan xavfsiz aylantirish
  function playerRotate() {
    if (!currentPiece || !isPlaying || isPaused) return;

    const oldShape = currentPiece.shape;
    const rotated = rotateMatrix(currentPiece.shape);
    currentPiece.shape = rotated;

    // Wall-kick sinovlari: 0, -1, 1, -2, 2
    const kicks = [0, -1, 1, -2, 2];
    let kicked = false;

    for (let i = 0; i < kicks.length; i++) {
      const offset = kicks[i];
      currentPiece.x += offset;
      if (!collide(board, currentPiece)) {
        kicked = true;
        break;
      }
      currentPiece.x -= offset;
    }

    if (!kicked) {
      currentPiece.shape = oldShape; // Qaytarish
    } else {
      sound.rotate();
    }
  }

  // Figuraning chapga/o'ngga siljishi
  function playerMove(dir) {
    if (!currentPiece || !isPlaying || isPaused) return;
    currentPiece.x += dir;
    if (collide(board, currentPiece)) {
      currentPiece.x -= dir;
    } else {
      sound.move();
    }
  }

  // Sekin tushirish
  function playerDrop() {
    if (!currentPiece || !isPlaying || isPaused) return;
    currentPiece.y++;
    if (collide(board, currentPiece)) {
      currentPiece.y--;
      lockPiece();
    } else {
      score += 1;
      updateUI();
      sound.move();
    }
    dropCounter = 0;
  }

  // Birdaniga pastga tushirish (Hard Drop)
  function playerHardDrop() {
    if (!currentPiece || !isPlaying || isPaused) return;
    let droppedRows = 0;
    while (!collide(board, currentPiece)) {
      currentPiece.y++;
      droppedRows++;
    }
    currentPiece.y--;
    score += Math.max(0, droppedRows - 1) * 2;
    updateUI();
    sound.hardDrop();
    lockPiece();
    dropCounter = 0;
  }

  // Figuraning taxtaga mahkamlanishi
  function lockPiece() {
    const shape = currentPiece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = currentPiece.y + r;
          const boardX = currentPiece.x + c;

          if (boardY < 0) {
            triggerGameOver();
            return;
          }
          board[boardY][boardX] = {
            color: currentPiece.color,
            glow: currentPiece.glow
          };
        }
      }
    }

    checkLines();
    spawnNextPiece();
    canHold = true;
  }

  // Qatorlarni tekshirish va o'chirish
  function checkLines() {
    let linesCleared = 0;
    const clearedRowIndices = [];

    for (let r = ROWS - 1; r >= 0; r--) {
      const isFull = board[r].every(cell => cell !== 0);
      if (isFull) {
        linesCleared++;
        clearedRowIndices.push(r);
        board.splice(r, 1);
        board.unshift(new Array(COLS).fill(0));
        r++; // O'chirilgan qator o'rniga yangi qator tushgani uchun indeksni qaytaramiz
      }
    }

    if (linesCleared > 0) {
      lines += linesCleared;

      // Ball berish
      const points = [0, 100, 300, 500, 800];
      score += (points[linesCleared] || 800) * level;

      // Bosqich oshishi (har 10 qatorda)
      level = Math.floor(lines / 10) + 1;
      // Tezlikni oshirish: level oshgani sari dropInterval kamayadi
      dropInterval = Math.max(100, 1000 - (level - 1) * 90);

      // Zarralar effekti
      clearedRowIndices.forEach(rowY => {
        createClearParticles(rowY);
      });

      if (linesCleared >= 4) {
        sound.tetris();
      } else {
        sound.clear();
      }

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetris_highscore', highScore);
      }

      updateUI();
    }
  }

  // Tozalash effektlari uchun zarralar
  function createClearParticles(rowY) {
    const yPos = rowY * BLOCK_SIZE + BLOCK_SIZE / 2;
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * (COLS * BLOCK_SIZE),
        y: yPos,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2,
        color: ['#00f0f0', '#ff0077', '#00ff66', '#ffee00'][Math.floor(Math.random() * 4)],
        alpha: 1,
        life: 0.04
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.life;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles(targetContext) {
    particles.forEach(p => {
      targetContext.save();
      targetContext.globalAlpha = p.alpha;
      targetContext.fillStyle = p.color;
      targetContext.shadowColor = p.color;
      targetContext.shadowBlur = 8;
      targetContext.beginPath();
      targetContext.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      targetContext.fill();
      targetContext.restore();
    });
  }

  // Keyingi figurani tushirish
  function spawnNextPiece() {
    if (!nextPieceKey) {
      nextPieceKey = getNextBagPiece();
    }
    const currentKey = nextPieceKey;
    nextPieceKey = getNextBagPiece();

    currentPiece = createPieceObject(currentKey);

    // Agar paydo bo'lish bilanoq to'qnashsa -> Game Over
    if (collide(board, currentPiece)) {
      triggerGameOver();
    }

    drawPreview(nextCtx, nextPieceKey, nextCanvas);
  }

  // Hold (saqlash) funksiyasi
  function playerHold() {
    if (!currentPiece || !isPlaying || isPaused || !canHold) return;

    sound.rotate();
    const currentType = currentPiece.type;

    if (!holdPieceKey) {
      holdPieceKey = currentType;
      spawnNextPiece();
    } else {
      const temp = holdPieceKey;
      holdPieceKey = currentType;
      currentPiece = createPieceObject(temp);
      if (collide(board, currentPiece)) {
        triggerGameOver();
        return;
      }
    }

    canHold = false;
    drawPreview(holdCtx, holdPieceKey, holdCanvas);
  }

  // O'yin tugash holati
  function triggerGameOver() {
    isPlaying = false;
    isGameOver = true;
    sound.gameOver();

    finalScoreEl.textContent = score;
    finalLinesEl.textContent = lines;
    gameOverOverlay.classList.remove('hidden');
    gameOverOverlay.classList.add('active');
  }

  // O'yinni boshlash
  function startGame() {
    board = createMatrix(COLS, ROWS);
    bag = [];
    particles = [];
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    dropCounter = 0;
    lastTime = 0;
    holdPieceKey = null;
    canHold = true;
    isPlaying = true;
    isPaused = false;
    isGameOver = false;

    startOverlay.classList.add('hidden');
    startOverlay.classList.remove('active');
    pauseOverlay.classList.add('hidden');
    pauseOverlay.classList.remove('active');
    gameOverOverlay.classList.add('hidden');
    gameOverOverlay.classList.remove('active');

    nextPieceKey = getNextBagPiece();
    spawnNextPiece();
    drawPreview(holdCtx, null, holdCanvas);

    updateUI();

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Pauza / Davom ettirish
  function togglePause() {
    if (!isPlaying || isGameOver) return;
    isPaused = !isPaused;

    if (isPaused) {
      pauseOverlay.classList.remove('hidden');
      pauseOverlay.classList.add('active');
      pauseToggleBtn.textContent = 'DAVOM ETISH (P)';
    } else {
      pauseOverlay.classList.add('hidden');
      pauseOverlay.classList.remove('active');
      pauseToggleBtn.textContent = 'PAUZA (P)';
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // UI Yangilash
  function updateUI() {
    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    levelEl.textContent = level;
    linesEl.textContent = lines;
  }

  // --- Chizish Funksiyalari (Rendering) ---
  function drawBlock(targetContext, x, y, color, glow, isGhost = false) {
    const px = x * BLOCK_SIZE;
    const py = y * BLOCK_SIZE;
    const size = BLOCK_SIZE;

    targetContext.save();

    if (isGhost) {
      targetContext.strokeStyle = color;
      targetContext.lineWidth = 1.5;
      targetContext.fillStyle = 'rgba(255, 255, 255, 0.04)';
      targetContext.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
      targetContext.fillRect(px + 1.5, py + 1.5, size - 3, size - 3);
      targetContext.restore();
      return;
    }

    // Blok foni
    targetContext.fillStyle = color;
    targetContext.shadowColor = glow || color;
    targetContext.shadowBlur = 6;
    targetContext.fillRect(px + 1, py + 1, size - 2, size - 2);

    // Neon 3D yorug'lik effekti
    targetContext.fillStyle = 'rgba(255, 255, 255, 0.4)';
    targetContext.fillRect(px + 2, py + 2, size - 4, 3);
    targetContext.fillRect(px + 2, py + 2, 3, size - 4);

    targetContext.fillStyle = 'rgba(0, 0, 0, 0.35)';
    targetContext.fillRect(px + 2, py + size - 5, size - 4, 3);
    targetContext.fillRect(px + size - 5, py + 2, 3, size - 4);

    targetContext.restore();
  }

  // Asosiy doskani chizish
  function draw() {
    // Fonni tozalash
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nozik to'r chizish (Grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(canvas.width, r * BLOCK_SIZE);
      ctx.stroke();
    }

    // Taxtadagi mavjud bloklar
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (cell !== 0) {
          drawBlock(ctx, c, r, cell.color, cell.glow);
        }
      }
    }

    // Ghost figurani chizish
    if (currentPiece) {
      const ghost = getGhostPiece();
      if (ghost && ghost.y !== currentPiece.y) {
        const shape = ghost.shape;
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              drawBlock(ctx, ghost.x + c, ghost.y + r, currentPiece.color, null, true);
            }
          }
        }
      }

      // Hozirgi harakatdagi figurani chizish
      const shape = currentPiece.shape;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, currentPiece.color, currentPiece.glow);
          }
        }
      }
    }

    // Zarralar animatsiyasi
    drawParticles(ctx);
  }

  // Hold va Next uchun miniatyura chizish
  function drawPreview(targetCtx, pieceType, targetCanvas) {
    targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    if (!pieceType) return;

    const pieceDef = PIECES[pieceType];
    const shape = pieceDef.shape;
    const miniSize = 22;

    const shapeWidth = shape[0].length * miniSize;
    const shapeHeight = shape.length * miniSize;
    const offsetX = (targetCanvas.width - shapeWidth) / 2;
    const offsetY = (targetCanvas.height - shapeHeight) / 2;

    targetCtx.save();
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const px = offsetX + c * miniSize;
          const py = offsetY + r * miniSize;

          targetCtx.fillStyle = pieceDef.color;
          targetCtx.shadowColor = pieceDef.glow;
          targetCtx.shadowBlur = 6;
          targetCtx.fillRect(px + 1, py + 1, miniSize - 2, miniSize - 2);

          // Mini 3D effect
          targetCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          targetCtx.fillRect(px + 2, py + 2, miniSize - 4, 2);
          targetCtx.fillRect(px + 2, py + 2, 2, miniSize - 4);
        }
      }
    }
    targetCtx.restore();
  }

  // --- Asosiy O'yin Sikli (Game Loop) ---
  function gameLoop(time = 0) {
    if (!isPlaying) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    if (!isPaused) {
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        if (currentPiece) {
          currentPiece.y++;
          if (collide(board, currentPiece)) {
            currentPiece.y--;
            lockPiece();
          }
        }
        dropCounter = 0;
      }

      updateParticles();
      draw();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Klaviatura Boshqaruvi ---
  window.addEventListener('keydown', e => {
    sound.init();

    // Agar o'yin boshlanmagan bo'lsa va Space yoki Enter bosilsa -> Boshlash
    if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault();
      startGame();
      return;
    }

    // Agar o'yin davom etayotgan bo'lsa, maxsus tugmalarning sahifani aylantirishini to'xtatamiz
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      togglePause();
      return;
    }

    if (!isPlaying || isPaused || isGameOver) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        playerMove(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        playerMove(1);
        break;
      case 'ArrowDown':
      case 'KeyS':
        playerDrop();
        break;
      case 'ArrowUp':
      case 'KeyW':
        playerRotate();
        break;
      case 'Space':
        playerHardDrop();
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        playerHold();
        break;
    }
  });

  // --- Tugmalar va Interfeys Hodisalari ---
  startBtn.addEventListener('click', () => {
    sound.init();
    startGame();
  });

  resumeBtn.addEventListener('click', () => {
    togglePause();
  });

  restartBtn.addEventListener('click', () => {
    startGame();
  });

  pauseToggleBtn.addEventListener('click', () => {
    togglePause();
  });

  resetGameBtn.addEventListener('click', () => {
    startGame();
  });

  // Ovoz tugmasi
  function updateSoundUI() {
    soundIcon.textContent = sound.enabled ? '🔊' : '🔇';
    soundState.textContent = sound.enabled ? 'YOQIQ' : 'OCHIQ';
  }

  soundToggleBtn.addEventListener('click', () => {
    sound.toggle();
    updateSoundUI();
  });

  // Mobil sensorli tugmalar
  function addTouchListener(btn, action) {
    if (!btn) return;
    const trigger = e => {
      e.preventDefault();
      sound.init();
      action();
    };
    btn.addEventListener('touchstart', trigger, { passive: false });
    btn.addEventListener('mousedown', trigger);
  }

  addTouchListener(ctrlLeft, () => playerMove(-1));
  addTouchListener(ctrlRight, () => playerMove(1));
  addTouchListener(ctrlDown, () => playerDrop());
  addTouchListener(ctrlRotate, () => playerRotate());
  addTouchListener(ctrlDrop, () => playerHardDrop());
  addTouchListener(ctrlHold, () => playerHold());

  // Boshlang'ich UI yuklash
  highScoreEl.textContent = highScore;
  updateSoundUI();
  drawPreview(holdCtx, null, holdCanvas);
  drawPreview(nextCtx, null, nextCanvas);

  // Ilk fon to'rini chizib qo'yish
  draw();
})();
