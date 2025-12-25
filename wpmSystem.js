import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';

export const WpmSys = {
    calculate() {
        if (GameState.startTime === 0 || GameState.totalCorrectWords === 0) return 0;
        
        const currentTime = (GameState.currentState === 'PAUSED') ? GameState.pauseStartTime : Date.now();
        let timeElapsedMinutes;

        if (GameState.gameMode === 'TIME') {
            // Di mode Time, WPM dihitung berdasarkan durasi yang dipilih (agar fair)
            // Atau bisa pakai elapsed time berjalan
            const elapsed = GameState.timeLimit - GameState.timeLeft;
            timeElapsedMinutes = elapsed / 60000;
        } else {
            // Mode Klasik
            timeElapsedMinutes = (currentTime - GameState.startTime - GameState.totalPausedTime) / 60000;
        }

        if (timeElapsedMinutes <= 0.001) return 0; // Mencegah infinity di awal

        const wpm = Math.floor(GameState.totalCorrectWords / timeElapsedMinutes);
        return (wpm < 0 || !isFinite(wpm)) ? 0 : wpm;
    }
};