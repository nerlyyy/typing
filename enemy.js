import { Constants } from '../core/constants.js';
import { GameState } from '../core/state.js';

export class Enemy {
    constructor(word, x, y, isBoss) {
        this.word = word;
        this.x = x;
        this.y = y; // Biasanya mulai dari -50
        this.baseX = x; // Untuk gerakan gelombang
        
        this.isBoss = isBoss;
        this.width = 20 + word.length * 15;
        this.height = 40;
        
        // State
        this.isDying = false;
        this.dyingTimer = 0;
        this.spawnTimer = 0; // Efek muncul (scale up)
        this.hitFlashTimer = 0;
        this.wobbleOffset = Math.random() * 100;
        
        // Typing Mechanics
        this.isInterrupted = false; // Efek getar saat typo
        this.interruptTimer = 0;
        this.isAccessDenied = false; // Efek denied visual
        this.deniedTimer = 0;
    }

    update(deltaTime, speedMultiplier) {
        // 1. Logic Mati
        if (this.isDying) {
            this.dyingTimer += deltaTime;
            return; // Jangan gerak kalau lagi mati
        }

        // 2. Logic Visual Effect (Hit/Typo)
        if (this.hitFlashTimer > 0) this.hitFlashTimer--;
        if (this.isInterrupted) {
            this.interruptTimer -= deltaTime;
            if (this.interruptTimer <= 0) this.isInterrupted = false;
        }
        if (this.isAccessDenied) {
            this.deniedTimer -= deltaTime;
            if (this.deniedTimer <= 0) this.isAccessDenied = false;
        }

        // 3. Gerakan Turun + Gelombang
        if (this.spawnTimer < 500) this.spawnTimer += deltaTime;

        this.y += GameState.enemySpeed * speedMultiplier;
        
        // Gerakan zig-zag/gelombang sedikit biar organik
        const waveAmp = 5 + (GameState.comboLevel * 2);
        const timeFactor = Date.now() / 500;
        this.x = this.baseX + Math.sin(timeFactor + this.wobbleOffset) * waveAmp;
    }
}