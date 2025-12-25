import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';
import { AudioSys } from './audio.js';

let lastSpeedUpScore = 0;

export const DifficultySys = {
    reset() {
        lastSpeedUpScore = 0;
    },

    checkProgression() {
        if (GameState.gameMode !== 'CLASSIC') return;

        // Naikkan level setiap kelipatan skor 5000
        if (GameState.score - lastSpeedUpScore >= 5000) {
            lastSpeedUpScore = Math.floor(GameState.score / 5000) * 5000;
            
            // Logic Scaling
            GameState.spawnInterval = Math.max(400, GameState.spawnInterval - 100);
            GameState.enemySpeed += 0.1;

            // Visual Notification
            GameState.scoreAnimations.push({
                x: Constants.CANVAS_WIDTH_LANDSCAPE / 2, // Posisi default (nanti di-override render)
                y: GameState.playerVisualY - 100,
                targetX: Constants.CANVAS_WIDTH_LANDSCAPE / 2,
                targetY: GameState.playerVisualY - 200,
                lifetime: 0,
                duration: 1500,
                color: '#f472b6',
                value: "SPEED UP!",
                type: 'float'
            });

            AudioSys.levelUp();
        }

        // Micro-scaling setiap 50 poin
        if (GameState.score % 50 === 0 && GameState.score > 0) {
            GameState.enemySpeed += 0.05;
            GameState.spawnInterval = Math.max(800, GameState.spawnInterval - 20);
        }
    }
};