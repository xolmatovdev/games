// Core 3D Highway Driving & Drift Game Engine
// Minimalist, high-performance, responsive

class GameEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        
        // Physics constants
        this.MAX_NORMAL_SPEED = 230; // km/h
        this.MAX_NITRO_SPEED = 320;  // km/h
        this.ACCELERATION = 95;      // km/h per sec
        this.BRAKING = 160;          // km/h per sec
        this.NATURAL_DECEL = 35;     // friction
        this.STEER_SPEED = 24;       // lateral speed
        this.ROAD_WIDTH = 18;
        this.LANES = [-6.75, -2.25, 2.25, 6.75];

        // Player physics state
        this.car = {
            x: 0,
            y: 0,
            z: 0,
            speed: 0,         // km/h
            targetSpeed: 0,
            steerAngle: 0,
            bodyRoll: 0,
            bodyPitch: 0,
            bodyYaw: 0,
            isDrifting: false,
            driftPoints: 0,
            driftMultiplier: 1,
            nitro: 100,        // 0 to 100
            isNitroActive: false,
            color: 0x181c24
        };

        // Input state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            handbrake: false,
            nitro: false
        };

        // Score & Stats
        this.score = 0;
        this.distance = 0; // meters
        this.nearMisses = 0;
        this.maxSpeedReached = 0;
        this.highScore = parseInt(localStorage.getItem('car_game_highscore') || '0', 10);

        // Camera presets
        this.cameraModes = ['chase', 'hood', 'isometric'];
        this.currentCamIndex = 0;

        // Environment & World
        this.roadSegments = [];
        this.segmentLength = 120;
        this.totalSegments = 5;
        this.traffic = [];
        this.maxTrafficCount = 8;
        this.trafficSpawnTimer = 0;

        // Particle pool
        this.particles = [];
        this.speedLines = [];
        this.rainParticles = null;
        this.currentWeather = 'midnight'; // 'midnight' or 'rain'

        // Timers & Delta
        this.clock = new THREE.Clock();
        this.shakeAmount = 0;

        this.initThree();
        this.buildWorld();
        this.setupEventListeners();
        this.setupUI();
        this.animate();
    }

    initThree() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c10);
        this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.012);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(
            62,
            window.innerWidth / window.innerHeight,
            0.1,
            300
        );
        this.camera.position.set(0, 4.5, -8.5);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // 4. Lighting (Moody, focused, sleek)
        this.ambientLight = new THREE.AmbientLight(0x28303e, 0.9);
        this.scene.add(this.ambientLight);

        // Directional moon/sky backlight
        this.dirLight = new THREE.DirectionalLight(0x8fa4c4, 1.4);
        this.dirLight.position.set(20, 45, -30);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 10;
        this.dirLight.shadow.camera.far = 120;
        this.dirLight.shadow.camera.left = -18;
        this.dirLight.shadow.camera.right = 18;
        this.dirLight.shadow.camera.top = 35;
        this.dirLight.shadow.camera.bottom = -35;
        this.scene.add(this.dirLight);

        // Target for directional light follows player
        this.scene.add(this.dirLight.target);
    }

    buildWorld() {
        // 1. Create player car
        this.playerData = ModelBuilder.createPlayerCar(this.car.color);
        this.playerMesh = this.playerData.group;
        this.playerMesh.position.set(0, 0, 0);
        this.scene.add(this.playerMesh);

        // 2. Create continuous looping road segments
        for (let i = 0; i < this.totalSegments; i++) {
            const seg = ModelBuilder.createRoadSegment(this.segmentLength, this.ROAD_WIDTH);
            seg.position.z = i * this.segmentLength - this.segmentLength;
            this.scene.add(seg);
            this.roadSegments.push(seg);
        }

        // 3. Create Speed Lines (Minimalist white streaks along screen edges)
        this.createSpeedLines();

        // 4. Create Rain System
        this.createRainSystem();
    }

    createSpeedLines() {
        const lineCount = 40;
        const lineGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(lineCount * 6); // 2 vertices per line

        for (let i = 0; i < lineCount; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = (4.5 + Math.random() * 8) * side;
            const y = 1.0 + Math.random() * 5.0;
            const z = Math.random() * 40 - 20;

            positions[i * 6] = x;
            positions[i * 6 + 1] = y;
            positions[i * 6 + 2] = z;

            positions[i * 6 + 3] = x;
            positions[i * 6 + 4] = y;
            positions[i * 6 + 5] = z - 3.5;
        }

        lineGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x99bbdd,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending
        });

        this.speedLinesMesh = new THREE.LineSegments(lineGeom, lineMat);
        this.scene.add(this.speedLinesMesh);
    }

    createRainSystem() {
        const dropCount = 1200;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(dropCount * 3);
        const velocities = [];

        for (let i = 0; i < dropCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
            velocities.push(18 + Math.random() * 12);
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0x7799bb,
            size: 0.15,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });

        this.rainParticles = new THREE.Points(geom, mat);
        this.rainVelocities = velocities;
        this.rainParticles.visible = false;
        this.scene.add(this.rainParticles);
    }

    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (this.state === 'PLAYING') {
                switch(e.code) {
                    case 'KeyW':
                    case 'ArrowUp':
                        this.keys.up = true;
                        break;
                    case 'KeyS':
                    case 'ArrowDown':
                        this.keys.down = true;
                        break;
                    case 'KeyA':
                    case 'ArrowLeft':
                        this.keys.left = true;
                        break;
                    case 'KeyD':
                    case 'ArrowRight':
                        this.keys.right = true;
                        break;
                    case 'Space':
                        this.keys.handbrake = true;
                        e.preventDefault();
                        break;
                    case 'ShiftLeft':
                    case 'ShiftRight':
                    case 'KeyF':
                    case 'KeyN':
                        this.activateNitro();
                        break;
                    case 'KeyC':
                        this.cycleCamera();
                        break;
                    case 'KeyP':
                    case 'Escape':
                        this.togglePause();
                        break;
                }
            } else if (this.state === 'MENU' && (e.code === 'Space' || e.code === 'Enter')) {
                this.startGame();
            } else if (this.state === 'GAMEOVER' && (e.code === 'Space' || e.code === 'Enter')) {
                this.restartGame();
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.up = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.down = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.handbrake = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyF':
                case 'KeyN':
                    this.deactivateNitro();
                    break;
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Touch & Onscreen controls for mobile/tablet
        this.setupTouchControls();
    }

    setupTouchControls() {
        const bindButton = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const start = (e) => { e.preventDefault(); onDown(); };
            const end = (e) => { e.preventDefault(); onUp(); };
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };

        bindButton('btn-left', () => { this.keys.left = true; }, () => { this.keys.left = false; });
        bindButton('btn-right', () => { this.keys.right = true; }, () => { this.keys.right = false; });
        bindButton('btn-gas', () => { this.keys.up = true; }, () => { this.keys.up = false; });
        bindButton('btn-brake', () => { this.keys.down = true; }, () => { this.keys.down = false; });
        bindButton('btn-nitro', () => { this.activateNitro(); }, () => { this.deactivateNitro(); });
        bindButton('btn-drift', () => { this.keys.handbrake = true; }, () => { this.keys.handbrake = false; });
    }

    setupUI() {
        // Start Game Button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        // Restart Game Button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());

        // Resume Game Button
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

        // Pause Game Button (HUD)
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

        // Return to Menu from Pause
        const pauseMenuBtn = document.getElementById('pause-menu-btn');
        if (pauseMenuBtn) pauseMenuBtn.addEventListener('click', () => this.returnToMenu());

        // Return to Menu from Game Over
        const goMenuBtn = document.getElementById('go-menu-btn');
        if (goMenuBtn) goMenuBtn.addEventListener('click', () => this.returnToMenu());

        // Camera Switch Button
        const camBtn = document.getElementById('cam-btn');
        if (camBtn) camBtn.addEventListener('click', () => this.cycleCamera());

        // Audio Mute Button
        const audioBtn = document.getElementById('audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                const muted = window.soundCtrl.toggleMute();
                audioBtn.innerHTML = muted ? '🔇 OVOZ: O\'CHIQ' : '🔊 OVOZ: YONIQ';
            });
        }

        // Weather Toggle Button
        const weatherBtn = document.getElementById('weather-btn');
        if (weatherBtn) {
            weatherBtn.addEventListener('click', () => {
                this.toggleWeather();
                weatherBtn.innerHTML = this.currentWeather === 'rain' ? '🌧️ YOMG\'IR' : '🌙 TUNGI OYDIN';
            });
        }

        // Car Color Selector (Restrained sleek colors)
        const colorSwatches = document.querySelectorAll('.color-swatch');
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                const colorHex = parseInt(swatch.dataset.color, 16);
                this.setCarColor(colorHex);
            });
        });

        // Update High Score Display
        this.updateHUDHighScore();
    }

    setCarColor(hex) {
        this.car.color = hex;
        if (this.playerData && this.playerData.bodyMat) {
            this.playerData.bodyMat.color.setHex(hex);
        }
    }

    cycleCamera() {
        this.currentCamIndex = (this.currentCamIndex + 1) % this.cameraModes.length;
        window.soundCtrl.playClick();
    }

    toggleWeather() {
        this.currentWeather = (this.currentWeather === 'midnight') ? 'rain' : 'midnight';
        if (this.currentWeather === 'rain') {
            this.rainParticles.visible = true;
            this.scene.fog.density = 0.016;
            this.playerData.bodyMat.roughness = 0.12; // wet reflective surface
            ModelBuilder.materials.asphalt.roughness = 0.4;
        } else {
            this.rainParticles.visible = false;
            this.scene.fog.density = 0.012;
            this.playerData.bodyMat.roughness = 0.25;
            ModelBuilder.materials.asphalt.roughness = 0.85;
        }
    }

    activateNitro() {
        if (this.car.nitro > 15 && !this.car.isNitroActive && this.state === 'PLAYING') {
            this.car.isNitroActive = true;
            this.playerData.flames.forEach(f => f.visible = true);
            window.soundCtrl.playNitro();
        }
    }

    deactivateNitro() {
        this.car.isNitroActive = false;
        if (this.playerData && this.playerData.flames) {
            this.playerData.flames.forEach(f => f.visible = false);
        }
    }

    startGame() {
        window.soundCtrl.init();
        window.soundCtrl.resume();
        window.soundCtrl.startEngine();
        window.soundCtrl.startMusic();

        this.state = 'PLAYING';
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');

        this.resetStats();
    }

    restartGame() {
        this.resetStats();
        this.clearTraffic();
        this.state = 'PLAYING';
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');

        window.soundCtrl.resume();
        window.soundCtrl.startEngine();
        window.soundCtrl.startMusic();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pause-screen').classList.remove('hidden');
            window.soundCtrl.stopEngine();
            window.soundCtrl.stopSkid();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pause-screen').classList.add('hidden');
            window.soundCtrl.startEngine();
        }
    }

    returnToMenu() {
        this.state = 'MENU';
        window.soundCtrl.stopEngine();
        window.soundCtrl.stopSkid();
        window.soundCtrl.stopMusic();
        this.clearTraffic();
        this.resetStats();

        document.getElementById('hud').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    }

    resetStats() {
        this.car.x = 0;
        this.car.z = 0;
        this.car.speed = 40;
        this.car.nitro = 100;
        this.car.isNitroActive = false;
        this.car.driftPoints = 0;
        this.car.driftMultiplier = 1;
        this.car.bodyRoll = 0;
        this.car.bodyPitch = 0;
        this.car.bodyYaw = 0;
        this.score = 0;
        this.distance = 0;
        this.nearMisses = 0;
        this.maxSpeedReached = 40;
        this.shakeAmount = 0;

        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;
        this.keys.handbrake = false;

        if (this.playerMesh) {
            this.playerMesh.position.set(0, 0, 0);
            this.playerMesh.rotation.set(0, 0, 0);
        }

        // Reset road segments positions cleanly
        for (let i = 0; i < this.roadSegments.length; i++) {
            this.roadSegments[i].position.z = i * this.segmentLength - this.segmentLength;
        }
    }

    clearTraffic() {
        this.traffic.forEach(t => this.scene.remove(t.group));
        this.traffic = [];
    }

    updatePhysics(delta) {
        if (this.state !== 'PLAYING') return;

        // 1. Throttle / Acceleration
        let maxAllowedSpeed = this.car.isNitroActive ? this.MAX_NITRO_SPEED : this.MAX_NORMAL_SPEED;

        if (this.car.isNitroActive) {
            this.car.speed += this.ACCELERATION * 1.8 * delta;
            this.car.nitro -= 24 * delta;
            this.shakeAmount = 0.12;

            if (this.car.nitro <= 0) {
                this.car.nitro = 0;
                this.deactivateNitro();
            }
        } else if (this.keys.up) {
            this.car.speed += this.ACCELERATION * delta;
            // Slowly refill nitro when driving normally
            this.car.nitro = Math.min(100, this.car.nitro + 3.5 * delta);
        } else if (this.keys.down) {
            this.car.speed -= this.BRAKING * delta;
        } else {
            // Natural friction
            if (this.car.speed > 0) {
                this.car.speed -= this.NATURAL_DECEL * delta;
            }
        }

        // Clamp speed
        this.car.speed = Math.max(0, Math.min(maxAllowedSpeed, this.car.speed));
        if (this.car.speed > this.maxSpeedReached) {
            this.maxSpeedReached = Math.round(this.car.speed);
        }

        // 2. Steering & Drifting
        const speedRatio = this.car.speed / this.MAX_NORMAL_SPEED;
        const steerInput = (this.keys.left ? -1 : 0) + (this.keys.right ? 1 : 0);
        this.car.isDrifting = this.keys.handbrake && Math.abs(steerInput) > 0.1 && this.car.speed > 60;

        // Turn responsiveness scales dynamically with speed
        let turnRate = this.STEER_SPEED * (0.35 + 0.65 * speedRatio);
        if (this.car.isDrifting) {
            turnRate *= 1.35; // Sharper angle slip during drift
            this.car.speed -= this.BRAKING * 0.45 * delta; // slight speed loss during drift
            
            // Drift score accumulation
            this.car.driftPoints += Math.round(this.car.speed * delta * 4 * this.car.driftMultiplier);
            this.car.driftMultiplier = Math.min(4.0, this.car.driftMultiplier + 0.3 * delta);

            // Audio & particles
            window.soundCtrl.playSkid(0.2);
            this.spawnTireSmoke();
            this.shakeAmount = Math.max(this.shakeAmount, 0.05);
        } else {
            window.soundCtrl.stopSkid();
            if (this.car.driftPoints > 0) {
                // Bank the drift points into main score
                this.score += Math.round(this.car.driftPoints);
                this.showFloatingText(`DRIFT +${this.car.driftPoints}`, '#99e0ff');
                this.car.driftPoints = 0;
                this.car.driftMultiplier = 1;
            }
        }

        // Lateral movement
        this.car.x += steerInput * turnRate * delta;

        // Road boundaries bounce/limit with scraping sparks
        const halfRoad = this.ROAD_WIDTH / 2 - 1.2;
        if (this.car.x < -halfRoad) {
            this.car.x = -halfRoad;
            this.car.speed *= 0.94;
            this.shakeAmount = 0.18;
            if (this.car.speed > 50) this.spawnBarrierSparks(-halfRoad);
        } else if (this.car.x > halfRoad) {
            this.car.x = halfRoad;
            this.car.speed *= 0.94;
            this.shakeAmount = 0.18;
            if (this.car.speed > 50) this.spawnBarrierSparks(halfRoad);
        }

        // 3. Distance & Score
        const speedMps = (this.car.speed * 1000) / 3600;
        const distDelta = speedMps * delta;
        this.distance += distDelta;
        this.score += Math.round(distDelta * 0.8 * (1 + (this.car.speed / 150)));

        // 4. Car Mesh Visual Feedback (tilt, roll, wheels)
        const targetRoll = -steerInput * (this.car.isDrifting ? 0.22 : 0.08);
        const targetPitch = this.keys.down ? 0.05 : (this.keys.up ? -0.04 : 0);
        const targetYaw = -steerInput * (this.car.isDrifting ? 0.35 : 0.08);

        this.car.bodyRoll += (targetRoll - this.car.bodyRoll) * 10 * delta;
        this.car.bodyPitch += (targetPitch - this.car.bodyPitch) * 8 * delta;
        this.car.bodyYaw += (targetYaw - this.car.bodyYaw) * 12 * delta;

        this.playerMesh.position.x = this.car.x;
        this.playerMesh.rotation.z = this.car.bodyRoll;
        this.playerMesh.rotation.x = this.car.bodyPitch;
        this.playerMesh.rotation.y = this.car.bodyYaw;

        // Wheel animation (spin & turn front wheels)
        const wheelSpin = (speedMps / 0.36) * delta;
        this.playerData.wheels.forEach(w => {
            w.mesh.rotation.x += wheelSpin;
            if (w.isFront) {
                w.anchor.rotation.y = steerInput * 0.32;
            }
        });

        // Audio update
        window.soundCtrl.updateEngine(speedRatio, this.keys.up, this.keys.down);
    }

    updateEnvironment(delta) {
        if (this.state !== 'PLAYING') return;

        const speedMps = (this.car.speed * 1000) / 3600;
        const worldMove = speedMps * delta;

        // 1. Move road segments backward to create infinite highway
        this.roadSegments.forEach(seg => {
            seg.position.z -= worldMove;
            if (seg.position.z < -this.segmentLength * 1.5) {
                // Find farthest forward segment and attach this one in front
                let maxZ = -Infinity;
                this.roadSegments.forEach(s => {
                    if (s.position.z > maxZ) maxZ = s.position.z;
                });
                seg.position.z = maxZ + this.segmentLength;
            }
        });

        // 2. Speed Lines effect
        if (this.speedLinesMesh) {
            const highSpeed = this.car.speed > 160;
            const targetOpacity = highSpeed ? Math.min(0.65, (this.car.speed - 160) / 100) : 0.0;
            this.speedLinesMesh.material.opacity += (targetOpacity - this.speedLinesMesh.material.opacity) * 8 * delta;

            const pos = this.speedLinesMesh.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 6) {
                pos[i + 2] -= worldMove * 1.8;
                pos[i + 5] -= worldMove * 1.8;
                if (pos[i + 2] < -25) {
                    pos[i + 2] += 50;
                    pos[i + 5] += 50;
                }
            }
            this.speedLinesMesh.geometry.attributes.position.needsUpdate = true;
        }

        // 3. Rain update
        if (this.rainParticles && this.rainParticles.visible) {
            const pos = this.rainParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] -= this.rainVelocities[i / 3] * delta * 2.5;
                pos[i + 2] -= worldMove * 0.8;
                if (pos[i + 1] < 0) {
                    pos[i + 1] = 25;
                    pos[i + 2] = (Math.random() - 0.5) * 70;
                }
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
        }

        // 4. Directional light target follows player lateral
        this.dirLight.target.position.set(this.car.x, 0, 10);
    }

    updateTraffic(delta) {
        if (this.state !== 'PLAYING') return;

        const playerSpeedMps = (this.car.speed * 1000) / 3600;

        // Spawn new traffic cars ahead
        this.trafficSpawnTimer -= delta;
        if (this.trafficSpawnTimer <= 0 && this.traffic.length < this.maxTrafficCount) {
            this.spawnTrafficVehicle();
            // Faster spawning as player speed / score increases
            this.trafficSpawnTimer = Math.max(1.2, 3.2 - (this.car.speed / 200));
        }

        // Update each traffic car
        for (let i = this.traffic.length - 1; i >= 0; i--) {
            const t = this.traffic[i];
            const trafficSpeedMps = (t.speed * 1000) / 3600;

            // Relative forward/backward motion
            const relativeSpeedMps = trafficSpeedMps - playerSpeedMps;
            t.group.position.z += relativeSpeedMps * delta;

            // AI Lane changing behavior
            t.laneChangeTimer -= delta;
            if (t.laneChangeTimer <= 0) {
                const laneIdx = Math.floor(Math.random() * this.LANES.length);
                t.targetLane = this.LANES[laneIdx];
                t.laneChangeTimer = 4 + Math.random() * 8;
            }

            // Smooth lane transition
            t.group.position.x += (t.targetLane - t.group.position.x) * 1.5 * delta;

            // Check Collision with player
            if (this.checkCollision(t)) {
                this.triggerGameOver('To\'qnashuv sodir bo\'ldi!');
                return;
            }

            // Check Near-Miss (Exciting near overtake reward)
            this.checkNearMiss(t);

            // Remove if far behind (passed) or too far ahead
            if (t.group.position.z < -45 || t.group.position.z > 280) {
                this.scene.remove(t.group);
                this.traffic.splice(i, 1);
            }
        }
    }

    spawnTrafficVehicle() {
        const types = ['sedan', 'sedan', 'suv', 'truck'];
        const type = types[Math.floor(Math.random() * types.length)];
        const trafficData = ModelBuilder.createTrafficVehicle(type);

        // Pick random lane
        const lane = this.LANES[Math.floor(Math.random() * this.LANES.length)];
        const spawnZ = 120 + Math.random() * 70;

        // Check if lane is already occupied around spawnZ to avoid overlapping
        const isOccupied = this.traffic.some(t => 
            Math.abs(t.group.position.x - lane) < 2.0 && 
            Math.abs(t.group.position.z - spawnZ) < 18.0
        );

        if (isOccupied) return;

        trafficData.group.position.set(lane, 0, spawnZ);
        trafficData.targetLane = lane;
        this.scene.add(trafficData.group);
        this.traffic.push(trafficData);
    }

    checkCollision(trafficObj) {
        const dx = Math.abs(this.car.x - trafficObj.group.position.x);
        const dz = Math.abs(trafficObj.group.position.z); // Player is at z=0

        const hitWidth = (1.85 + trafficObj.width) * 0.44;
        const hitLength = (4.3 + trafficObj.length) * 0.44;

        return (dx < hitWidth && dz < hitLength);
    }

    checkNearMiss(trafficObj) {
        if (trafficObj.nearMissed) return;

        const dx = Math.abs(this.car.x - trafficObj.group.position.x);
        const dz = trafficObj.group.position.z;

        const hitWidth = (1.85 + trafficObj.width) * 0.44;

        // Must be close laterally (just outside collision width up to +1.4m) and passing at high speed
        if (dx >= hitWidth * 0.95 && dx <= hitWidth + 1.4 && Math.abs(dz) <= 2.2 && this.car.speed > 100) {
            trafficObj.nearMissed = true;
            this.nearMisses++;
            
            const bonus = Math.round(250 * (1 + this.car.speed / 150));
            this.score += bonus;
            
            // Nitro recharge boost
            this.car.nitro = Math.min(100, this.car.nitro + 25);

            window.soundCtrl.playNearMiss();
            this.showFloatingText(`XAVFLI O'TISH! +${bonus} PTS`, '#00ffc4');
            this.shakeAmount = 0.1;
        }
    }

    spawnBarrierSparks(xPos) {
        if (Math.random() > 0.4) return;
        const sparkCount = 3;
        for (let i = 0; i < sparkCount; i++) {
            const sparkGeom = new THREE.SphereGeometry(0.04, 4, 4);
            const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffe6aa });
            const sparkMesh = new THREE.Mesh(sparkGeom, sparkMat);
            sparkMesh.position.set(xPos, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 2.0);
            this.scene.add(sparkMesh);

            this.particles.push({
                mesh: sparkMesh,
                life: 0.25,
                maxLife: 0.25,
                vx: (xPos > 0 ? -1 : 1) * (2 + Math.random() * 3),
                vy: 1.5 + Math.random() * 2,
                vz: -4 - Math.random() * 5
            });
        }
    }

    spawnTireSmoke() {
        if (Math.random() > 0.4) return;
        const smokeGeom = new THREE.SphereGeometry(0.25 + Math.random() * 0.15, 6, 6);
        const smokeMat = new THREE.MeshBasicMaterial({
            color: 0x8899aa,
            transparent: true,
            opacity: 0.4
        });
        const mesh = new THREE.Mesh(smokeGeom, smokeMat);
        const rearWheelX = this.car.x + (Math.random() > 0.5 ? 0.95 : -0.95);
        mesh.position.set(rearWheelX, 0.25, -1.8);
        this.scene.add(mesh);

        this.particles.push({
            mesh: mesh,
            life: 0.6,
            maxLife: 0.6,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 0.8 + Math.random() * 1.0,
            vz: -1.2
        });
    }

    updateParticles(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            p.mesh.position.x += p.vx * delta;
            p.mesh.position.y += p.vy * delta;
            p.mesh.position.z += p.vz * delta;
            p.mesh.scale.multiplyScalar(1 + 1.8 * delta);
            p.mesh.material.opacity = (p.life / p.maxLife) * 0.4;
        }
    }

    updateCamera(delta) {
        const mode = this.cameraModes[this.currentCamIndex];
        let targetPos = new THREE.Vector3();
        let lookTarget = new THREE.Vector3(this.car.x * 0.65, 0.8, 12);

        // Screen shake calculation
        let shakeX = 0, shakeY = 0;
        if (this.shakeAmount > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeAmount;
            shakeY = (Math.random() - 0.5) * this.shakeAmount;
            this.shakeAmount = Math.max(0, this.shakeAmount - delta * 0.6);
        }

        if (mode === 'chase') {
            // Dynamic Chase Cam: tilts with drift, pulls back with speed
            const speedRatio = this.car.speed / this.MAX_NORMAL_SPEED;
            const targetCamZ = -7.2 - speedRatio * 1.8;
            const targetCamY = 3.2 + speedRatio * 0.4;
            const targetCamX = this.car.x * 0.75;

            targetPos.set(targetCamX + shakeX, targetCamY + shakeY, targetCamZ);
            this.camera.position.lerp(targetPos, 8 * delta);
            this.camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);

            // Dynamic FOV with speed (sense of speed warp)
            const targetFov = 62 + speedRatio * 14 + (this.car.isNitroActive ? 8 : 0);
            this.camera.fov += (targetFov - this.camera.fov) * 5 * delta;
            this.camera.updateProjectionMatrix();

        } else if (mode === 'hood') {
            // Close Bumper / Hood Cam
            targetPos.set(this.car.x + shakeX, 1.15 + shakeY, 0.8);
            this.camera.position.lerp(targetPos, 16 * delta);
            this.camera.lookAt(this.car.x, 1.0, 30);
            this.camera.fov = 72;
            this.camera.updateProjectionMatrix();

        } else if (mode === 'isometric') {
            // Elevated Arcade Cam
            targetPos.set(this.car.x * 0.5 + 8, 14, -14);
            this.camera.position.lerp(targetPos, 6 * delta);
            this.camera.lookAt(this.car.x, 0, 10);
            this.camera.fov = 50;
            this.camera.updateProjectionMatrix();
        }
    }

    triggerGameOver(reason = 'To\'qnashuv!') {
        this.state = 'GAMEOVER';
        window.soundCtrl.stopEngine();
        window.soundCtrl.stopSkid();
        window.soundCtrl.playCrash();
        this.shakeAmount = 0.55;

        // Save High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('car_game_highscore', this.highScore.toString());
        }

        // Populate Game Over screen
        document.getElementById('hud').classList.add('hidden');
        const goScreen = document.getElementById('gameover-screen');
        goScreen.classList.remove('hidden');

        document.getElementById('go-score').textContent = this.score.toLocaleString();
        document.getElementById('go-highscore').textContent = this.highScore.toLocaleString();
        document.getElementById('go-distance').textContent = Math.round(this.distance) + ' m';
        document.getElementById('go-speed').textContent = this.maxSpeedReached + ' km/s';
        document.getElementById('go-nearmiss').textContent = this.nearMisses;
        document.getElementById('go-reason').textContent = reason;

        this.updateHUDHighScore();
    }

    showFloatingText(text, color = '#ffffff') {
        const container = document.getElementById('floating-alerts');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'floating-popup';
        el.textContent = text;
        el.style.color = color;
        container.appendChild(el);

        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1100);
    }

    updateHUDHighScore() {
        const hsEl = document.getElementById('hud-highscore');
        if (hsEl) hsEl.textContent = this.highScore.toLocaleString();
    }

    syncHUD() {
        if (this.state !== 'PLAYING') return;

        // Speedometer
        const speedVal = Math.round(this.car.speed);
        document.getElementById('hud-speed').textContent = speedVal;
        
        // Speed dial progress bar
        const speedFill = document.getElementById('speed-bar-fill');
        if (speedFill) {
            const pct = Math.min(100, (speedVal / this.MAX_NITRO_SPEED) * 100);
            speedFill.style.width = pct + '%';
        }

        // Nitro bar
        const nitroFill = document.getElementById('nitro-bar-fill');
        if (nitroFill) {
            nitroFill.style.width = this.car.nitro + '%';
        }

        // Score & Distance
        document.getElementById('hud-score').textContent = this.score.toLocaleString();
        document.getElementById('hud-distance').textContent = Math.round(this.distance) + ' m';

        // Drift alert
        const driftAlert = document.getElementById('drift-alert');
        if (this.car.isDrifting && this.car.driftPoints > 0) {
            driftAlert.classList.remove('hidden');
            driftAlert.innerHTML = `DRIFT x${this.car.driftMultiplier.toFixed(1)} &bull; ${this.car.driftPoints} PTS`;
        } else {
            driftAlert.classList.add('hidden');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(0.08, this.clock.getDelta());

        if (this.state === 'PLAYING') {
            this.updatePhysics(delta);
            this.updateEnvironment(delta);
            this.updateTraffic(delta);
            this.updateParticles(delta);
            this.updateCamera(delta);
            this.syncHUD();
        } else if (this.state === 'MENU') {
            // Elegant slow turntable rotation in menu
            if (this.playerMesh) {
                this.playerMesh.rotation.y += 0.008;
            }
            this.camera.position.set(0, 3.2, -6.5);
            this.camera.lookAt(0, 0.8, 0);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate game engine on DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
