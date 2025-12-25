import { Constants } from './constants.js';

export const GameState = {
    // System States
    currentState: 'MENU',     // MENU, PLAYING, PAUSED, GAME_OVER, SETTINGS, SHOP, LOADOUT
    gameMode: 'CLASSIC',      // CLASSIC, TIME
    deviceMode: 'PC',         // PC, MOBILE
    screenRatio: 'LANDSCAPE', // LANDSCAPE, PORTRAIT
    currentLanguage: 'id',
    
    // Player Data (Disimpan di LocalStorage)
    playerUsername: localStorage.getItem('kbbi_player_name') || "GUEST",
    playerCoins: parseInt(localStorage.getItem('kbbi_coins')) || 0,
    ownedItems: JSON.parse(localStorage.getItem('kbbi_owned_items')) || ['TRIANGLE_SHIP', 'TRIANGLE_ENEMY'],
    
    // Equipped Skins
    equippedSkins: {
        player: 'TRIANGLE_SHIP',
        enemy: 'TRIANGLE_ENEMY',
        theme: 'BASIC'
    },

    // Gameplay Data (Akan di-reset setiap game baru)
    score: 0,
    health: 10,
    userInput: '',
    enemies: [],
    bullets: [],
    particles: [],
    recycleBins: [],
    scoreAnimations: [],
    aimAnimations: [],
    
    // Gameplay Logic Variables
    currentTarget: null,
    disambiguationTargets: [],
    spawnInterval: 1500,
    enemySpeed: 1.0,
    lastSpawnTime: 0,
    bossCounter: 0,
    isTypingError: false,
    brokenLockAnimation: null,
    
    // Stats & Time
    startTime: 0,
    totalCorrectWords: 0,
    totalCharactersCorrect: 0,
    pauseStartTime: 0,
    totalPausedTime: 0,
    
    // Combo System
    comboStreak: 0,
    comboLevel: 1,
    
    // Time Mode Specific
    timeLeft: 0,
    timeLimit: Constants.DEFAULT_TIME_LIMIT,
    timeInterval: null,
    
    // Audio State (Mencegah Overlap)
    isMutedBGM: false,
    isMutedSFX: false,
    activeBGMType: null, // 'MENU' atau 'GAME' (Hanya boleh satu yang aktif)

    // Visual State
    playerVisualX: 0,
    playerVisualY: 0,
    playerReturnTimer: 0,
    recoilOffset: 0,
    isPlayerDamaged: false,
    playerKnockbackTimer: 0,
    clickPulseScale: 1.0,

    // Fungsi Reset Data Permainan
    reset() {
        this.score = 0;
        this.health = 10;
        this.userInput = '';
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.recycleBins = [];
        this.scoreAnimations = [];
        this.aimAnimations = [];
        this.currentTarget = null;
        this.disambiguationTargets = [];
        this.comboStreak = 0;
        this.comboLevel = 1;
        this.totalCorrectWords = 0;
        this.totalCharactersCorrect = 0;
        this.totalPausedTime = 0;
        this.startTime = 0;
        this.lastSpawnTime = Date.now();
        this.isTypingError = false;
        this.brokenLockAnimation = null;
        this.bossCounter = 0;
        
        // Reset difficulty
        if (this.gameMode === 'CLASSIC') {
            this.enemySpeed = 1.0;
            this.spawnInterval = Constants.SPAWN_INTERVAL_START;
        } else {
            this.enemySpeed = 2.0; 
            this.spawnInterval = 800;
        }
    },

    saveUserData() {
        localStorage.setItem('kbbi_coins', this.playerCoins);
        localStorage.setItem('kbbi_owned_items', JSON.stringify(this.ownedItems));
        localStorage.setItem('kbbi_player_name', this.playerUsername);
    }
};