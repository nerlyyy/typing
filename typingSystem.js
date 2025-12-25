import { GameState } from '../core/state.js';
import { AudioSys } from './audio.js';
import { createExplosion } from '../visual/effects.js';
import { HUD } from '../ui/hud.js';
import { Constants } from '../core/constants.js';
import { DifficultySys } from './difficultySystem.js';

export const TypingSys = {
    
    // Cari musuh yang kata-katanya berawalan 'prefix'
    getPotentialTargets(prefix) {
        if (!prefix) return [];
        const potential = GameState.enemies.filter(e => 
            e.word.startsWith(prefix.toLowerCase()) && 
            !e.isDying
        );
        // Prioritaskan musuh yang paling bawah (paling dekat player)
        potential.sort((a, b) => b.y - a.y);
        return potential;
    },

    updateTypingState(prefix) {
        const potentialTargets = this.getPotentialTargets(prefix);
        GameState.disambiguationTargets = potentialTargets;

        if (potentialTargets.length === 1) {
            // Lock target jika hanya sisa 1 kandidat
            if (GameState.currentTarget !== potentialTargets[0]) {
                AudioSys.lock();
            }
            GameState.currentTarget = potentialTargets[0];
        } else {
            // Reset target jika ambigu atau tidak ada
            GameState.currentTarget = null;
        }
    },

    processInputChar(char) {
        AudioSys.init(); // Pastikan audio context jalan
        
        // Visual Pulse Effect
        GameState.clickPulseScale = 0.8;
        setTimeout(() => { GameState.clickPulseScale = 1.0; }, 50);

        const lowerKey = char.toLowerCase();

        // Mulai timer jika ketikan pertama
        if (GameState.startTime === 0 && lowerKey.match(/[a-z]/i)) {
            GameState.startTime = Date.now();
        }

        const nextInput = GameState.userInput + lowerKey;
        const potentialTargets = this.getPotentialTargets(nextInput);

        if (potentialTargets.length > 0) {
            // --- KETIKAN BENAR ---
            GameState.userInput = nextInput;
            this.updateTypingState(GameState.userInput);
            AudioSys.playSkinSFX('PLAYER', GameState.equippedSkins.player, 'shoot'); // Suara ngetik/nembak

            // Cek apakah ada kata yang selesai diketik sempurna?
            const finishedEnemy = GameState.enemies.find(e => e.word === GameState.userInput && !e.isDying);
            
            if (finishedEnemy) {
                this.destroyEnemy(finishedEnemy);
            }

        } else {
            // --- TYPO / SALAH KETIK ---
            this.handleTypingError();
        }
    },

    processBackspace() {
        AudioSys.playSkinSFX('PLAYER', GameState.equippedSkins.player, 'shoot');
        if (GameState.userInput.length > 0) {
            GameState.userInput = GameState.userInput.substring(0, GameState.userInput.length - 1);
            GameState.isTypingError = false;
            this.updateTypingState(GameState.userInput);
        }
    },

    handleTypingError() {
        AudioSys.error();
        GameState.playerKnockbackTimer = 200; // Efek visual layar getar
        
        // Cari target terdekat untuk diberi efek "Access Denied"
        const targetToShake = GameState.disambiguationTargets.length > 0 
            ? GameState.disambiguationTargets[0] 
            : null;

        if (targetToShake) {
            GameState.aimAnimations.push({ 
                x: targetToShake.x, 
                y: targetToShake.y, 
                type: 'miss', 
                duration: 400, 
                timer: 0, 
                color: Constants.COLORS.TYPO 
            });
            targetToShake.isInterrupted = true;
            targetToShake.interruptTimer = Constants.TYPO_SHAKE_DURATION;
            targetToShake.isAccessDenied = true;
            targetToShake.deniedTimer = 500;
        }

        // Pinalti Combo
        if (GameState.comboStreak > 0) {
            GameState.comboStreak = Math.max(0, GameState.comboStreak - 0.5);
        } else if (GameState.comboLevel > 1) {
            GameState.comboLevel--;
            GameState.comboStreak = Constants.MAX_BAR_COMBO - 0.5;
            GameState.enemySpeed = Math.max(1.0, GameState.enemySpeed - 0.2);
        }

        // Efek Gembok Pecah Visual
        if (GameState.currentTarget) {
            GameState.brokenLockAnimation = { 
                x: GameState.currentTarget.x, 
                y: GameState.currentTarget.y, 
                timer: 150 
            };
        }

        // Reset Input
        this.resetInput();
        GameState.isTypingError = true;
        
        // Hilangkan border merah setelah sebentar
        setTimeout(() => { 
            GameState.isTypingError = false; 
            HUD.updateDisplays(); 
        }, 200);
    },

    destroyEnemy(enemy) {
        if (enemy.isDying) return;

        // Visual & Audio Death
        AudioSys.playSkinSFX('ENEMY', GameState.equippedSkins.enemy, 'explode');
        createExplosion(enemy.x, enemy.y, enemy.isBoss ? Constants.COLORS.BOSS : Constants.COLORS.ENEMY);
        
        enemy.isDying = true;
        enemy.dyingTimer = 0;

        // Shoot Bullet Visual
        GameState.bullets.push({ 
            x: GameState.playerVisualX, 
            y: GameState.playerVisualY - 20, 
            targetX: enemy.x, 
            targetY: enemy.y 
        });

        // Score Calculation
        let baseScore = enemy.isBoss ? 25 : 10;
        GameState.comboStreak++;
        
        if (GameState.comboStreak >= Constants.MAX_BAR_COMBO) {
            GameState.comboStreak -= Constants.MAX_BAR_COMBO;
            GameState.comboLevel++;
            GameState.enemySpeed += 0.2; // Makin tinggi combo, makin cepat musuh
            
            // Floating Text Level Up
            GameState.scoreAnimations.push({ 
                x: GameState.playerVisualX, 
                y: GameState.playerVisualY - 80, 
                targetX: GameState.playerVisualX, 
                targetY: GameState.playerVisualY - 150, 
                lifetime: 0, 
                duration: 1000, 
                color: '#facc15', 
                value: "LEVEL UP!", 
                type: 'float' 
            });
            AudioSys.levelUp();
        }

        let finalScore = Math.floor(baseScore * GameState.comboLevel);
        
        if (GameState.gameMode === 'CLASSIC') {
            GameState.score += finalScore;
            
            // Floating Score
            GameState.scoreAnimations.push({ 
                x: enemy.x, 
                y: enemy.y, 
                targetX: 400, // Menuju score bar (nanti disesuaikan)
                targetY: 30, 
                lifetime: 0, 
                duration: 800, 
                color: Constants.COLORS.BULLET, 
                value: finalScore, 
                type: 'float' 
            });

            DifficultySys.checkProgression();
        }

        // Update Stats
        GameState.totalCorrectWords++;
        GameState.totalCharactersCorrect += enemy.word.length;
        GameState.bossCounter++;

        // Reset Input
        this.resetInput();
        
        // Efek Recoil Player
        GameState.playerReturnTimer = 800;
        
        // Update HUD
        HUD.updateDisplays();
    },

    resetInput() {
        GameState.currentTarget = null;
        GameState.userInput = '';
        this.updateTypingState('');
        
        // Clear hidden input (Mobile)
        const mobileInput = document.getElementById('hiddenMobileInput');
        if (mobileInput) mobileInput.value = "";
    }
};