import { GameState } from '../core/state.js';
import { TypingSys } from './typingSystem.js';
import { HUD } from '../ui/hud.js';
import { UIManager } from '../ui/modals.js';

export const InputSys = {
    init() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Mobile Hidden Input Listener
        const hiddenInput = document.getElementById('hiddenMobileInput');
        if (hiddenInput) {
            hiddenInput.addEventListener('input', (e) => {
                if (e.inputType === 'deleteContentBackward') {
                    TypingSys.processBackspace();
                } else if (e.data) {
                    const char = e.data.slice(-1);
                    TypingSys.processInputChar(char);
                }
                HUD.updateDisplays();
            });
        }
    },

    handleKeyDown(event) {
        if (GameState.currentState !== 'PLAYING') return;
        
        // Jika mode mobile, abaikan keyboard fisik kecuali Escape (biar gak double input)
        // Kecuali user emang pake keyboard bluetooth di HP
        if (GameState.deviceMode === 'MOBILE' && event.key !== 'Escape') return;

        const key = event.key;

        // Prevent Default keys
        if (key === 'Enter' || key === ' ' || (key.length === 1 && key.match(/[a-z]/i))) {
            event.preventDefault();
        }

        if (key === 'Backspace') {
            TypingSys.processBackspace();
        } 
        else if (key.length === 1 && key.match(/[a-zA-Z]/)) {
            TypingSys.processInputChar(key);
        } 
        else if (key === 'Escape') {
            UIManager.togglePauseGame();
        }

        HUD.updateDisplays();
    },

    setDeviceMode(mode) {
        GameState.deviceMode = mode;
        HUD.updateDisplays();
        
        // Update Tombol di Settings UI (Manual DOM manipulation for visual feedback)
        const btnMobile = document.getElementById('btnMobile');
        const btnPC = document.getElementById('btnPC');
        const hint = document.getElementById('deviceModeHint');
        
        if (mode === 'MOBILE') {
            if(btnMobile) { btnMobile.classList.replace('bg-gray-700', 'bg-green-600'); btnMobile.classList.replace('text-gray-400', 'text-white'); }
            if(btnPC) { btnPC.classList.replace('bg-blue-600', 'bg-gray-700'); btnPC.classList.replace('text-white', 'text-gray-400'); }
            if(hint) hint.textContent = "(Tap layar untuk keyboard)";
        } else {
            if(btnPC) { btnPC.classList.replace('bg-gray-700', 'bg-blue-600'); btnPC.classList.replace('text-gray-400', 'text-white'); }
            if(btnMobile) { btnMobile.classList.replace('bg-green-600', 'bg-gray-700'); btnMobile.classList.replace('text-white', 'text-gray-400'); }
            if(hint) hint.textContent = "PC (Keyboard Fisik)";
        }
    }
};