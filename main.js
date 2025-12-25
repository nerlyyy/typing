// main.js

// --- Import Core & State ---
import { initFirebase } from './core/firebase.js';
import { GameState } from './core/state.js';
import { Constants } from './core/constants.js';

// --- Import Systems ---
import { AudioSys } from './systems/audio.js';
import { RenderSys } from './systems/render.js';
import { InputSys } from './systems/input.js';
import { GameLoop } from './systems/loop.js';
import { TimerSys } from './systems/timeModeSystem.js';

// --- Import UI Managers ---
import { UIManager } from './ui/modals.js';
import { HUD } from './ui/hud.js';

// --- Import Visuals ---
import { initStars, resizeCanvas } from './visual/effects.js';

// ==========================================
// GAME ENTRY POINT
// ==========================================

window.onload = function() {
    console.log("🚀 Initializing Game Modules...");

    // 1. Init Firebase (Async)
    initFirebase();

    // 2. Setup Canvas
    RenderSys.init(); // Memanggil init canvas dan resize
    initStars(800, 600); // Init bintang awal

    // 3. Setup Audio System
    AudioSys.init();

    // 4. Setup Input Listeners
    InputSys.init();

    // 5. Setup UI & Buttons (Event Listeners untuk semua tombol)
    UIManager.initEventListeners();

    // 6. Set Default Language & Load User Data
    setTimeout(() => {
        UIManager.setLanguage(Constants.currentLanguage); // Bahasa default
        
        // Cek LocalStorage untuk nama user
        if(GameState.playerUsername) {
            const welcomeText = document.getElementById('welcomeUserText');
            if(welcomeText) welcomeText.textContent = `Hai, ${GameState.playerUsername}!`;
        }
        
        UIManager.showMainMenu();
        HUD.updateDisplays();
    }, 100);

    // 7. Start Game Loop
    requestAnimationFrame(GameLoop.loop);

    console.log("✅ Game Initialized!");
};

// ==========================================
// LEGACY SUPPORT (Agar HTML onclick="..." tidak error)
// ==========================================

window.equipItem = (type, id) => {
    import('./ui/shop.js').then(module => {
        module.ShopSys.equipItem(type, id);
    });
};

window.showSettingsMenu = () => {
    UIManager.showSettings();
};

window.showLeaderboard = () => {
    UIManager.showLeaderboard();
};

window.setScreenRatio = (mode) => {
    RenderSys.setScreenRatio(mode);
};

window.setDeviceMode = (mode) => {
    InputSys.setDeviceMode(mode);
};