import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';

export const TimerSys = {
    setTimeLimit(seconds) {
        GameState.timeLimit = seconds * 1000;
        GameState.timeLeft = GameState.timeLimit;
    },

    getFormattedTime() {
        if (GameState.gameMode === 'TIME') {
            const seconds = Math.ceil(GameState.timeLeft / 1000);
            return seconds + 's';
        } else {
            // Stopwatch Mode Klasik
            let elapsed = 0;
            if (GameState.startTime > 0) {
                const now = (GameState.currentState === 'PAUSED') ? GameState.pauseStartTime : Date.now();
                elapsed = now - GameState.startTime - GameState.totalPausedTime;
            }
            if (elapsed < 0) elapsed = 0;
            
            const totalSeconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
};