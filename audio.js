/**
 * audio.js
 * Procedural Web Audio API sound synthesizer:
 * 1. Chess game sound effects (moves, captures, castling, checks, win/loss).
 * 2. Retro ambient radio music & rain generator for the authentic vintage cafe vibe!
 * 100% self-contained, no external audio files required.
 */

class ChessAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;

        // Ambient Radio & Music State
        this.isMusicPlaying = false;
        this.musicGain = null;
        this.musicTimer = null;
        this.currentTrackIndex = 0;
        this.trackTimeSeconds = 109; // 1:49 default starting point like in screenshot!
        this.trackTotalSeconds = 407; // 6:47
        this.rainPlaying = false;
        this.rainNode = null;
        this.rainGain = null;

        this.tracks = [
            {
                title: "Morning Ride • Marine Drive Dawn",
                artist: "Omkar's Chill Radio • Far Stellar Edition",
                bpm: 68,
                chords: [
                    [261.63, 329.63, 392.00], // C major (C4, E4, G4)
                    [220.00, 261.63, 329.63], // A minor (A3, C4, E4)
                    [174.61, 220.00, 261.63], // F major (F3, A3, C4)
                    [196.00, 246.94, 293.66]  // G major (G3, B3, D4)
                ]
            },
            {
                title: "Baarish Ki Dhun • Coastal City Lofi",
                artist: "Omkar's Retro Radio • Monsoon Vibes",
                bpm: 60,
                chords: [
                    [293.66, 349.23, 440.00], // D minor
                    [246.94, 293.66, 369.99], // B minor flat
                    [261.63, 329.63, 392.00], // C major
                    [220.00, 261.63, 329.63]  // A minor
                ]
            },
            {
                title: "City Lights & Chess • Midnight Boulevard",
                artist: "Wakwasti Late Night Sessions",
                bpm: 72,
                chords: [
                    [329.63, 392.00, 493.88], // E minor
                    [261.63, 329.63, 392.00], // C major
                    [293.66, 369.99, 440.00], // D major
                    [246.94, 293.66, 369.99]  // B minor
                ]
            }
        ];
    }

    initContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.musicGain) {
            this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else if (!this.muted && this.musicGain && this.isMusicPlaying) {
            this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        }
        return this.muted;
    }

    /* ==========================================
       Chess Board Sound Effects
       ========================================== */
    playMove() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playCapture() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.exponentialRampToValueAtTime(60, now + 0.12);

        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.12);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(450, now);
        osc2.frequency.exponentialRampToValueAtTime(90, now + 0.05);

        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc2.start(now);
        osc2.stop(now + 0.05);
    }

    playCastle() {
        if (this.muted) return;
        this.playMove();
        setTimeout(() => this.playMove(), 110);
    }

    playCheck() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 880];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.22);
        });
    }

    playGameOver(isWin) {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = isWin ? [523.25, 659.25, 783.99, 1046.50] : [587.33, 523.25, 440, 392];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.12;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.28, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    }

    /* ==========================================
       Procedural Retro Ambient Radio Synthesizer
       ========================================== */
    toggleMusic(onUpdate) {
        this.initContext();
        if (this.isMusicPlaying) {
            this.stopMusic();
            return false;
        } else {
            this.startMusic(onUpdate);
            return true;
        }
    }

    startMusic(onUpdate) {
        if (this.isMusicPlaying) return;
        this.initContext();
        if (!this.ctx) return;

        this.isMusicPlaying = true;
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.muted ? 0 : 0.18, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);

        let chordStep = 0;
        const playNextChord = () => {
            if (!this.isMusicPlaying) return;

            const currentTrack = this.tracks[this.currentTrackIndex];
            const chord = currentTrack.chords[chordStep % currentTrack.chords.length];
            const duration = (60 / currentTrack.bpm) * 2; // 2 beats per chord
            const now = this.ctx.currentTime;

            // Warm electric organ / Rhodes synth emulation
            chord.forEach((freq, noteIdx) => {
                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = noteIdx === 0 ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(freq, now);

                // Gentle warm vibrato
                osc.detune.setValueAtTime(noteIdx * 2 - 2, now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(650, now);

                noteGain.gain.setValueAtTime(0.001, now);
                noteGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.3);

                osc.connect(filter);
                filter.connect(noteGain);
                noteGain.connect(this.musicGain);

                osc.start(now);
                osc.stop(now + duration + 0.3);
            });

            // Add gentle vinyl plink / acoustic pluck on beat
            const pluck = this.ctx.createOscillator();
            const pluckGain = this.ctx.createGain();
            pluck.type = 'sine';
            pluck.frequency.setValueAtTime(chord[chord.length - 1] * 2, now + 0.1);
            pluckGain.gain.setValueAtTime(0.05, now + 0.1);
            pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            pluck.connect(pluckGain);
            pluckGain.connect(this.musicGain);
            pluck.start(now + 0.1);
            pluck.stop(now + 0.6);

            chordStep++;
            this.musicTimer = setTimeout(playNextChord, duration * 1000);
        };

        playNextChord();

        // Interval to tick playback time
        if (this.playbackInterval) clearInterval(this.playbackInterval);
        this.playbackInterval = setInterval(() => {
            if (!this.isMusicPlaying) return;
            this.trackTimeSeconds++;
            if (this.trackTimeSeconds >= this.trackTotalSeconds) {
                this.trackTimeSeconds = 0;
            }
            if (onUpdate) onUpdate(this.getCurrentTrackInfo());
        }, 1000);
    }

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicTimer) clearTimeout(this.musicTimer);
        if (this.playbackInterval) clearInterval(this.playbackInterval);
        if (this.musicGain) {
            this.musicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
            setTimeout(() => {
                try { this.musicGain.disconnect(); } catch (e) {}
            }, 500);
        }
    }

    nextTrack(onUpdate) {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.trackTimeSeconds = 0;
        if (this.isMusicPlaying) {
            this.stopMusic();
            this.startMusic(onUpdate);
        } else if (onUpdate) {
            onUpdate(this.getCurrentTrackInfo());
        }
    }

    prevTrack(onUpdate) {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.trackTimeSeconds = 0;
        if (this.isMusicPlaying) {
            this.stopMusic();
            this.startMusic(onUpdate);
        } else if (onUpdate) {
            onUpdate(this.getCurrentTrackInfo());
        }
    }

    getCurrentTrackInfo() {
        const track = this.tracks[this.currentTrackIndex];
        return {
            title: track.title,
            artist: track.artist,
            currentTime: this.formatTime(this.trackTimeSeconds),
            totalTime: this.formatTime(this.trackTotalSeconds),
            progressPercent: (this.trackTimeSeconds / this.trackTotalSeconds) * 100,
            isPlaying: this.isMusicPlaying
        };
    }

    /* ==========================================
       Baarish (Rain) & Chai Vintage Ambiance
       ========================================== */
    toggleRain() {
        this.initContext();
        if (this.rainPlaying) {
            this.stopRain();
            return false;
        } else {
            this.startRain();
            return true;
        }
    }

    startRain() {
        if (this.rainPlaying) return;
        this.initContext();
        if (!this.ctx) return;

        this.rainPlaying = true;
        // White noise buffer with low-pass filtering for soft relaxing rain
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(this.rainGain);
        this.rainGain.connect(this.ctx.destination);

        whiteNoise.start();
        this.rainNode = whiteNoise;
    }

    stopRain() {
        this.rainPlaying = false;
        if (this.rainGain) {
            this.rainGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
            setTimeout(() => {
                if (this.rainNode) {
                    try { this.rainNode.stop(); this.rainNode.disconnect(); } catch (e) {}
                }
            }, 350);
        }
    }

    formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessAudio;
}
