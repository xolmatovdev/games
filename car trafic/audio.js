// Web Audio API procedural sound synthesizer for 3D Car Game
// Zero external assets required, 100% offline and low-latency

class SoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.engineOsc = null;
        this.engineOsc2 = null;
        this.engineGain = null;
        this.engineFilter = null;
        this.isEngineRunning = false;
        
        // Music sequencer
        this.musicInterval = null;
        this.musicStep = 0;
        this.isMusicPlaying = false;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startEngine() {
        if (this.isMuted || !this.ctx) return;
        if (this.isEngineRunning) return;

        try {
            // Main low rumble oscillator
            this.engineOsc = this.ctx.createOscillator();
            this.engineOsc.type = 'sawtooth';
            this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

            // Secondary harmonic oscillator for mechanical grit
            this.engineOsc2 = this.ctx.createOscillator();
            this.engineOsc2.type = 'triangle';
            this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

            // Filter for engine body resonance
            this.engineFilter = this.ctx.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
            this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

            // Engine master gain
            this.engineGain = this.ctx.createGain();
            this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

            // Connect graph
            this.engineOsc.connect(this.engineFilter);
            this.engineOsc2.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.ctx.destination);

            this.engineOsc.start();
            this.engineOsc2.start();
            this.isEngineRunning = true;
        } catch (e) {
            console.warn('Audio init error:', e);
        }
    }

    updateEngine(speedRatio, isAccelerating, isBraking) {
        if (!this.isEngineRunning || !this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Pitch mapping: 40Hz idle to 220Hz top RPM
        const baseFreq = 42 + Math.pow(speedRatio, 1.2) * 160;
        const throttleBoost = isAccelerating ? 25 : (isBraking ? -15 : 0);
        const targetFreq = Math.max(35, baseFreq + throttleBoost);

        this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
        this.engineOsc2.frequency.setTargetAtTime(targetFreq * 2.02, now, 0.08);

        // Filter opens up as RPM rises
        const targetCutoff = 180 + speedRatio * 850 + (isAccelerating ? 200 : 0);
        this.engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.1);

        // Volume dynamics
        const targetGain = 0.05 + speedRatio * 0.09 + (isAccelerating ? 0.04 : 0);
        this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    }

    stopEngine() {
        if (!this.isEngineRunning) return;
        try {
            if (this.engineGain) {
                this.engineGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.1);
            }
            setTimeout(() => {
                try {
                    if (this.engineOsc) this.engineOsc.stop();
                    if (this.engineOsc2) this.engineOsc2.stop();
                } catch(e){}
                this.isEngineRunning = false;
            }, 120);
        } catch (e) {
            this.isEngineRunning = false;
        }
    }

    // Tire drift / screech sound using filtered white noise
    playSkid(volume = 0.2) {
        if (!this.ctx || this.isMuted) return;
        if (this.skidPlaying) return;
        this.skidPlaying = true;

        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(Math.min(0.25, volume), this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();

        this.skidSource = noise;
        this.skidGain = gain;
    }

    stopSkid() {
        if (!this.skidPlaying) return;
        if (this.skidGain && this.ctx) {
            this.skidGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.08);
            setTimeout(() => {
                try {
                    if (this.skidSource) this.skidSource.stop();
                } catch(e){}
                this.skidPlaying = false;
            }, 100);
        } else {
            this.skidPlaying = false;
        }
    }

    // Nitro activate whoosh + jet blast
    playNitro() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub bass drop
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(180, now);
        subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.6);

        // White noise whoosh
        const bufferSize = this.ctx.sampleRate * 0.7;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3500, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.7);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.7);
    }

    // Close call / Near miss swoosh sound
    playNearMiss() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.22);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Crash explosion impact sound
    playCrash() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Heavy low boom
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);

        // Metal crunch noise
        const bufferSize = this.ctx.sampleRate * 0.6;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.6);
    }

    // UI Click sound
    playClick() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Sleek minimalist dark-synth background pulse rhythm (toggleable)
    startMusic() {
        if (this.isMusicPlaying || !this.ctx || this.isMuted) return;
        this.isMusicPlaying = true;
        this.musicStep = 0;

        // Dark bass progression: Dm -> Bb -> F -> C
        const bassNotes = [
            73.42, 73.42, 73.42, 73.42,   // D2
            58.27, 58.27, 58.27, 58.27,   // Bb1
            87.31, 87.31, 87.31, 87.31,   // F2
            65.41, 65.41, 65.41, 65.41    // C2
        ];

        const stepTime = 135; // ~111 BPM sixteenth notes

        this.musicInterval = setInterval(() => {
            if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const noteIndex = Math.floor(this.musicStep / 2) % bassNotes.length;
            const isKick = (this.musicStep % 4 === 0);
            const isHat = (this.musicStep % 2 === 1);

            // Bass pulse
            if (this.musicStep % 2 === 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(bassNotes[noteIndex], now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(280, now);
                filter.frequency.exponentialRampToValueAtTime(90, now + 0.18);

                gain.gain.setValueAtTime(0.045, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.2);
            }

            // Minimalist electronic kick
            if (isKick) {
                const kick = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kick.type = 'sine';
                kick.frequency.setValueAtTime(130, now);
                kick.frequency.exponentialRampToValueAtTime(38, now + 0.08);

                kickGain.gain.setValueAtTime(0.08, now);
                kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                kick.connect(kickGain);
                kickGain.connect(this.ctx.destination);
                kick.start(now);
                kick.stop(now + 0.12);
            }

            // Crisp dark hi-hat
            if (isHat) {
                const hatSize = Math.floor(this.ctx.sampleRate * 0.03);
                const hatBuf = this.ctx.createBuffer(1, hatSize, this.ctx.sampleRate);
                const hatData = hatBuf.getChannelData(0);
                for (let i = 0; i < hatSize; i++) {
                    hatData[i] = (Math.random() * 2 - 1) * 0.15;
                }
                const hatSource = this.ctx.createBufferSource();
                hatSource.buffer = hatBuf;
                const hatFilter = this.ctx.createBiquadFilter();
                hatFilter.type = 'highpass';
                hatFilter.frequency.setValueAtTime(7500, now);

                const hatGain = this.ctx.createGain();
                hatGain.gain.setValueAtTime(0.025, now);
                hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                hatSource.connect(hatFilter);
                hatFilter.connect(hatGain);
                hatGain.connect(this.ctx.destination);
                hatSource.start(now);
            }

            this.musicStep++;
        }, stepTime);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        this.isMusicPlaying = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopEngine();
            this.stopSkid();
            this.stopMusic();
        } else {
            this.startEngine();
            this.startMusic();
        }
        return this.isMuted;
    }
}

window.soundCtrl = new SoundController();
