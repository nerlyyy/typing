import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';
import { AudioSys } from '../systems/audio.js';
import { HUD } from './hud.js';
import { TimerSys } from '../systems/timeModeSystem.js';
import { TypingSys } from '../systems/typingSystem.js';
import { ShopSys } from './shop.js';
import { submitScore, getLeaderboard } from '../core/firebase.js';
import { InputSys } from '../systems/input.js';
import { RenderSys } from '../systems/render.js';
import { WpmSys } from '../systems/wpmSystem.js';

export const UIManager = {
    modals: {},

    initEventListeners() {
        this.modals = {
            mainMenu: document.getElementById('mainMenuModal'),
            gameOver: document.getElementById('gameOverModal'),
            pause: document.getElementById('pauseModal'),
            settings: document.getElementById('settingsModal'),
            timeSettings: document.getElementById('timeModeSettingsModal'),
            leaderboard: document.getElementById('leaderboardModal'),
            shop: document.getElementById('shopModal'),
            loadout: document.getElementById('loadoutModal')
        };

        // --- BINDING TOMBOL ---
        // Main Menu
        document.getElementById('startMenuButton').addEventListener('click', () => {
             document.getElementById('startMenuButton').classList.add('hidden');
             document.getElementById('modeSelectionContainer').classList.remove('hidden');
        });
        document.getElementById('classicModeButton').addEventListener('click', () => this.startGame('CLASSIC'));
        document.getElementById('timeModeButton').addEventListener('click', () => {
             this.showModal('timeSettings');
        });

        // Time Settings
        document.querySelectorAll('.time-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                TimerSys.setTimeLimit(parseInt(e.target.dataset.time));
                this.startGame('TIME');
            });
        });
        document.getElementById('backFromTimeSettingsButton').addEventListener('click', () => this.showMainMenu());

        // Pause & Game Over Control
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePauseGame());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePauseGame());
        document.getElementById('endGameFromPauseButton').addEventListener('click', () => this.endGameFromPause());
        document.getElementById('restartButton').addEventListener('click', () => {
            if(GameState.gameMode === 'TIME') TimerSys.setTimeLimit(GameState.timeLimit/1000);
            this.startGame(GameState.gameMode);
        });
        document.getElementById('backToMenuButton').addEventListener('click', () => this.showMainMenu());

        // Settings
        document.getElementById('settingsButton').addEventListener('click', () => this.showSettings());
        document.getElementById('closeSettingsButton').addEventListener('click', () => {
            // Save Username
            const input = document.getElementById('usernameSettingsInput');
            if(input.value.trim()) {
                GameState.playerUsername = input.value.trim().toUpperCase();
                GameState.saveUserData();
            }
            this.showMainMenu();
        });
        
        // Shop & Loadout
        document.getElementById('shopButton').addEventListener('click', () => {
            ShopSys.updateLoadoutUI(); // Pastikan state sync
            HUD.updateDisplays(); // Update koin
            this.showModal('shop');
        });
        document.getElementById('closeShopButton').addEventListener('click', () => this.showMainMenu());
        document.getElementById('openLoadoutButton').addEventListener('click', () => this.showModal('loadout'));
        document.getElementById('backFromLoadoutButton').addEventListener('click', () => this.showModal('shop'));
        
        // --- FIX: BUTTON BELI BUNDLE (OFFICE) ---
        const buyOfficeBtn = document.getElementById('buyOfficeBundleBtn');
        if (buyOfficeBtn) {
            buyOfficeBtn.addEventListener('click', () => {
                ShopSys.buyBundle('OFFICE_BUNDLE');
            });
        }
        
        // Redeem Code
        document.getElementById('redeemButton').addEventListener('click', () => {
            const code = document.getElementById('redeemCodeInput').value;
            ShopSys.redeemCode(code);
        });

        // Leaderboard
        document.getElementById('leaderboardButton').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('closeLeaderboardButton').addEventListener('click', () => this.showMainMenu());
        document.getElementById('submitScoreButton').addEventListener('click', () => this.submitScoreHandler());
    },

    showModal(name) {
        // Sembunyikan semua modal dulu
        Object.values(this.modals).forEach(m => m?.classList.add('opacity-0', 'pointer-events-none'));
        
        // Tampilkan yang diminta
        if (this.modals[name]) {
            this.modals[name].classList.remove('opacity-0', 'pointer-events-none');
        }
    },

    showMainMenu() {
        GameState.currentState = 'MENU';
        AudioSys.playBGM('MENU');
        
        this.showModal('mainMenu');
        document.getElementById('pauseButton').classList.add('hidden');
        
        // Reset tampilan menu awal
        document.getElementById('startMenuButton').classList.remove('hidden');
        document.getElementById('modeSelectionContainer').classList.add('hidden');
        document.getElementById('welcomeUserText').textContent = `Hai, ${GameState.playerUsername}!`;
    },

    startGame(mode) {
        GameState.gameMode = mode;
        GameState.currentState = 'PLAYING';
        GameState.reset(); // Reset logic game

        // Hide modals
        Object.values(this.modals).forEach(m => m?.classList.add('opacity-0', 'pointer-events-none'));
        document.getElementById('pauseButton').classList.remove('hidden');
        
        AudioSys.playBGM('GAME');
        HUD.updateDisplays();
    },

    togglePauseGame() {
        if (GameState.currentState === 'PLAYING') {
            GameState.currentState = 'PAUSED';
            GameState.pauseStartTime = Date.now();
            AudioSys.stopBGM(); 
            this.showModal('pause');
            document.getElementById('inputContainer').classList.add('opacity-50');
        } else if (GameState.currentState === 'PAUSED') {
            GameState.currentState = 'PLAYING';
            const pausedDuration = Date.now() - GameState.pauseStartTime;
            GameState.totalPausedTime += pausedDuration;
            GameState.lastSpawnTime += pausedDuration; 
            
            AudioSys.playBGM('GAME');
            this.modals.pause.classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('inputContainer').classList.remove('opacity-50');
        }
    },

    gameOver() {
        GameState.currentState = 'GAME_OVER';
        AudioSys.stopBGM();
        this.showModal('gameOver');
        document.getElementById('pauseButton').classList.add('hidden');
        
        // Populate Data
        const lang = Constants.LANGUAGES[GameState.currentLanguage];
        const titleEl = document.getElementById('gameOverTitle');
        
        document.getElementById('finalScoreDisplay').textContent = GameState.score;
        document.getElementById('finalWordsTypedDisplay').textContent = GameState.totalCorrectWords;
        document.getElementById('finalWpmDisplay').textContent = WpmSys.calculate();

        if (GameState.gameMode === 'CLASSIC') {
            titleEl.textContent = lang.gameOverTitle;
            document.getElementById('finalScoreContainer').classList.remove('hidden');
            document.getElementById('finalDurationContainer').classList.remove('hidden');
            document.getElementById('finalDurationDisplay').textContent = TimerSys.getFormattedTime();
            document.getElementById('wpmStatsContainer').classList.add('hidden');
            
            // Show Submit Score
            document.getElementById('submitScoreForm').classList.remove('hidden');
            document.getElementById('submitPlayerNameDisplay').textContent = GameState.playerUsername;
            document.getElementById('submitStatus').textContent = "";
            document.getElementById('submitScoreButton').disabled = false;
            document.getElementById('submitScoreButton').textContent = "KIRIM SKOR";
        } else {
            titleEl.textContent = lang.timeUpTitle;
            document.getElementById('finalScoreContainer').classList.add('hidden');
            document.getElementById('finalDurationContainer').classList.add('hidden');
            document.getElementById('wpmStatsContainer').classList.remove('hidden');
            document.getElementById('finalCharsDisplayWPM').textContent = GameState.totalCharactersCorrect;
            document.getElementById('submitScoreForm').classList.add('hidden');
        }
    },

    endGameFromPause() {
        this.gameOver();
    },

    showSettings() {
        this.showModal('settings');
        document.getElementById('usernameSettingsInput').value = GameState.playerUsername;
    },

    async showLeaderboard() {
        this.showModal('leaderboard');
        const tbody = document.getElementById('leaderboardBody');
        const loading = document.getElementById('leaderboardLoading');
        const error = document.getElementById('leaderboardError');
        
        tbody.innerHTML = '';
        loading.classList.remove('hidden');
        error.classList.add('hidden');

        const data = await getLeaderboard();
        loading.classList.add('hidden');

        if (data.length === 0) {
            error.classList.remove('hidden');
            error.textContent = "Data kosong atau Offline.";
        } else {
            data.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td class="text-yellow-400 font-bold">${entry.score}</td>
                    <td class="text-gray-500 text-xs">${new Date(entry.timestamp.seconds * 1000).toLocaleDateString()}</td>
                `;
                tbody.appendChild(row);
            });
        }
    },

    async submitScoreHandler() {
        const btn = document.getElementById('submitScoreButton');
        const status = document.getElementById('submitStatus');
        
        btn.disabled = true;
        btn.textContent = "MENGIRIM...";
        
        const success = await submitScore(GameState.playerUsername, GameState.score);
        
        if (success) {
            btn.textContent = "TERKIRIM!";
            status.textContent = "Skor tersimpan di Leaderboard.";
            status.className = "text-[10px] mt-1 h-3 text-green-400 font-bold";
        } else {
            btn.textContent = "GAGAL";
            status.textContent = "Cek koneksi internet.";
            status.className = "text-[10px] mt-1 h-3 text-red-400 font-bold";
            btn.disabled = false;
        }
    },

    setLanguage(langCode) {
        GameState.currentLanguage = langCode;
        const lang = Constants.LANGUAGES[langCode];
        
        // Update Title & Meta
        document.title = lang.title;
        
        // Update Text Elements via data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (lang[key]) {
                if (el.tagName === 'BUTTON' || el.tagName === 'A') {
                    const icon = el.querySelector('svg');
                    if (icon) {
                         const textNode = Array.from(el.childNodes).find(node => node.nodeType === 3);
                         if(textNode) textNode.textContent = " " + lang[key];
                    } else {
                        el.textContent = lang[key];
                    }
                } else {
                    el.innerHTML = lang[key];
                }
            }
        });

        document.getElementById('inputPlaceholderText').textContent = lang.inputPlaceholder;
    }
};