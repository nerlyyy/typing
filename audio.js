// ==========================================
// AUDIO SYSTEM MODULE
// ==========================================
import { GameState } from '../core/state.js';
import { PlayerSkinRegistry, EnemySkinRegistry } from '../visual/skinRegistry.js';

export const AudioSys = {
    ctx: null,
    bgmElement: null,
    
    // Cache untuk Custom Audio Files agar tidak reload terus
    audioCache: {}, 

    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.bgmElement = document.getElementById('bgmAudio');
            
            // Unlock Audio Context (Browser Policy)
            const unlock = () => {
                if (this.ctx.state === 'suspended') this.ctx.resume();
                document.removeEventListener('click', unlock);
                document.removeEventListener('keydown', unlock);
            };
            document.addEventListener('click', unlock);
            document.addEventListener('keydown', unlock);
        }
    },

    // --- BGM MANAGER (ANTI-OVERLAP) ---
    playBGM: function(type) {
        if (GameState.isMutedBGM || !this.bgmElement) return;

        // 1. Cek apakah lagu yang diminta SAMA dengan yang sedang main?
        if (GameState.activeBGMType === type && !this.bgmElement.paused) {
            return; // Jangan restart lagu kalau sama
        }

        // 2. STOP & RESET Lagu Sebelumnya
        this.stopBGM();

        // 3. SET SOURCE BARU
        let sourceUrl = '';
        if (type === 'MENU') {
            // URL Lagu Menu (Bisa diganti file lokal)
            sourceUrl = 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'; 
            this.bgmElement.volume = 0.5;
            this.bgmElement.playbackRate = 1.0;
        } else if (type === 'GAME') {
            // URL Lagu Gameplay (Contoh pakai lagu sama tapi dipercepat sedikit biar beda)
            // IDEALNYA: Ganti ini dengan path file MP3 gameplay kamu, misal './audio/bgm/battle.mp3'
            sourceUrl = 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'; 
            this.bgmElement.volume = 0.4;
            this.bgmElement.playbackRate = 1.15; // Sedikit lebih ngebut
        }

        // 4. LOAD & PLAY
        if (sourceUrl) {
            // Hack kecil: Kalau URL sama persis, browser kadang tidak mau reload
            // Tapi karena kita mainkan playbackRate, kita force reset src jika perlu
            if (this.bgmElement.src !== sourceUrl) {
                this.bgmElement.src = sourceUrl;
            }
            
            const playPromise = this.bgmElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Auto-play prevented by browser. Interaction needed.");
                });
            }
            GameState.activeBGMType = type;
        }
    },

    stopBGM: function() {
        if (this.bgmElement) {
            this.bgmElement.pause();
            this.bgmElement.currentTime = 0;
            GameState.activeBGMType = null;
        }
    },

    toggleBGM: function() {
        GameState.isMutedBGM = !GameState.isMutedBGM;
        if (GameState.isMutedBGM) {
            this.stopBGM();
        } else {
            // Resume based on current state
            const type = (GameState.currentState === 'PLAYING') ? 'GAME' : 'MENU';
            this.playBGM(type);
        }
        return GameState.isMutedBGM;
    },

    toggleSFX: function() {
        GameState.isMutedSFX = !GameState.isMutedSFX;
        return GameState.isMutedSFX;
    },

    // --- DYNAMIC SKIN SFX HANDLER ---
    /**
     * Memainkan SFX berdasarkan Skin yang dipakai.
     * @param {string} entityType - 'PLAYER' atau 'ENEMY'
     * @param {string} skinId - ID Skin (misal 'TRIANGLE_SHIP')
     * @param {string} action - 'shoot', 'explode', 'impact'
     */
    playSkinSFX: function(entityType, skinId, action) {
        if (GameState.isMutedSFX) return;

        let registry = (entityType === 'PLAYER') ? PlayerSkinRegistry : EnemySkinRegistry;
        let skinData = registry[skinId];
        
        // Default fallback jika skin tidak punya config SFX
        let sfxKey = null;

        if (skinData && skinData.sfx && skinData.sfx[action]) {
            sfxKey = skinData.sfx[action];
        }

        if (!sfxKey) return; // Tidak ada suara didefinisikan

        // LOGIC UTAMA: Cek apakah ini Preset Synth atau File Path
        if (sfxKey.includes('/') || sfxKey.includes('.mp3') || sfxKey.includes('.wav')) {
            // INI FILE AUDIO EXTERNAL
            this.playExternalFile(sfxKey);
        } else {
            // INI PRESET SYNTHESIZER
            if (typeof this[sfxKey] === 'function') {
                this[sfxKey]();
            }
        }
    },

    playExternalFile: function(path) {
        // Simple Audio Buffer Cache System
        if (this.audioCache[path]) {
            const sound = this.audioCache[path].cloneNode();
            sound.volume = 0.3;
            sound.play().catch(e => {});
        } else {
            const audio = new Audio(path);
            this.audioCache[path] = audio;
            audio.volume = 0.3;
            audio.play().catch(e => {});
        }
    },

    // --- SYNTHESIZER PRESETS (FALLBACK SOUNDS) ---
    // Suara bawaan tanpa perlu file MP3
    
    playTone: function(freq, type, duration, vol = 0.1) {
        if (GameState.isMutedSFX || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    synthShoot: function() { // Pew Pew standar
        if (GameState.isMutedSFX || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },

    synthExplode: function() { this.playTone(100, 'square', 0.3, 0.2); },
    clickyType: function() { this.playTone(2000, 'triangle', 0.03, 0.05); }, // Suara keyboard mekanik
    trashDelete: function() { this.playTone(50, 'sawtooth', 0.2, 0.05); },  // Suara hapus file
    error: function() { this.playTone(80, 'sawtooth', 0.4, 0.3); },
    lock: function() { this.playTone(2000, 'square', 0.1, 0.05); },
    levelUp: function() { this.playTone(600, 'sine', 0.5, 0.2); }
};