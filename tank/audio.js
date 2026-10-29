// ============================================================================
// RETRO 8-BIT AUDIO SYNTHESIZER (Web Audio API)
// Hech qanday tashqi audio fayllarsiz toza retro 8-bit tovushlar
// ============================================================================

class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.moveOscillator = null;
        this.moveGain = null;
        this.isMoving = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API mavjud emas:", e);
        }
    }

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMove();
        }
        return this.isMuted;
    }

    // O'q otish ovozi (Pew pew)
    playShoot() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // G'isht devorga urilish (Qisqa shovqin zarbasi)
    playHitBrick() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.linearRampToValueAtTime(200, now + 0.05);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Temir devorga urilish (Metall jaranglash - Ding)
    playHitSteel() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1320, now);
        osc.frequency.linearRampToValueAtTime(660, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Kichik portlash (O'qlar to'qnashuvi / kichik narsalar)
    playExplosionSmall() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Katta tank portlashi (Dahshatli gumburlash)
    playExplosionLarge() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const dur = 0.45;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + dur);

        // Qo'shimcha past chastotali bass tebranish
        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(120, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + dur);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.4, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);

        noise.start(now);
        subOsc.start(now);
        subOsc.stop(now + dur);
    }

    // Tank harakati davridagi ovoz (Engine rumble)
    startMove() {
        if (this.isMuted || !this.ctx || this.isMoving) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;
            this.moveOscillator = this.ctx.createOscillator();
            this.moveGain = this.ctx.createGain();

            this.moveOscillator.type = 'triangle';
            this.moveOscillator.frequency.setValueAtTime(65, now);

            this.moveGain.gain.setValueAtTime(0.06, now);

            this.moveOscillator.connect(this.moveGain);
            this.moveGain.connect(this.ctx.destination);

            this.moveOscillator.start(now);
            this.isMoving = true;
        } catch (e) {
            // Audio context xatoliklarini tinch o'tkazib yuborish
        }
    }

    stopMove() {
        if (this.moveOscillator && this.isMoving) {
            try {
                this.moveGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
                this.moveOscillator.stop(this.ctx.currentTime + 0.05);
            } catch (e) {}
            this.moveOscillator = null;
            this.moveGain = null;
            this.isMoving = false;
        }
    }

    // Bonus paydo bo'lishi ovozi
    playPowerupSpawn() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            const time = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.18, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.06);
        });
    }

    // Bonusni yig'ib olish ovozi
    playPowerupPick() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const time = this.ctx.currentTime + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.08);
        });
    }

    // Bosqich boshlanishi klassik kuylari (Battle City Stage Start)
    playStageStart() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        // Retro Dendy Tank 1990 intro jingle
        const melody = [
            { f: 392, d: 0.12 }, // G4
            { f: 523, d: 0.12 }, // C5
            { f: 659, d: 0.12 }, // E5
            { f: 784, d: 0.24 }, // G5
            { f: 659, d: 0.12 }, // E5
            { f: 784, d: 0.35 }  // G5
        ];

        let currTime = this.ctx.currentTime + 0.05;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(note.f, currTime);

            gain.gain.setValueAtTime(0.2, currTime);
            gain.gain.exponentialRampToValueAtTime(0.02, currTime + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(currTime);
            osc.stop(currTime + note.d);
            currTime += note.d + 0.03;
        });
    }

    // Game Over kuylari
    playGameOver() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const melody = [
            { f: 440, d: 0.25 }, // A4
            { f: 415, d: 0.25 }, // G#4
            { f: 392, d: 0.25 }, // G4
            { f: 349, d: 0.50 }  // F4
        ];

        let currTime = this.ctx.currentTime + 0.05;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.f, currTime);

            gain.gain.setValueAtTime(0.25, currTime);
            gain.gain.exponentialRampToValueAtTime(0.01, currTime + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(currTime);
            osc.stop(currTime + note.d);
            currTime += note.d + 0.02;
        });
    }

    // Hisob-kitob (Tally tick)
    playTally() {
        if (this.isMuted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }
}

// Global audio instansiyasi
const sounds = new SoundManager();
