import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';
import { WpmSys } from '../systems/wpmSystem.js';
import { TimerSys } from '../systems/timeModeSystem.js';

export const HUD = {
    elements: {},

    init() {
        // Cache DOM elements agar performa tinggi (tidak querySelector terus menerus)
        this.elements = {
            score: document.getElementById('scoreDisplay'),
            scoreContainer: document.getElementById('scoreContainer'),
            healthOrTimeValue: document.getElementById('healthOrTimeValue'),
            healthOrTimeText: document.getElementById('healthOrTimeText'),
            words: document.getElementById('wordsTypedDisplay'),
            wpm: document.getElementById('wpmDisplay'),
            target: document.getElementById('targetWordDisplay'),
            input: document.getElementById('userInputDisplay'),
            inputContainer: document.getElementById('inputContainer'),
            comboBar: document.getElementById('comboBarFill'),
            multiplier: document.getElementById('multiplierDisplay'),
            stopwatch: document.getElementById('stopwatchDisplay'),
            stopwatchContainer: document.getElementById('stopwatchContainer'),
            coins: document.getElementById('playerCoinsDisplay')
        };
    },

    updateDisplays() {
        if (!this.elements.score) this.init(); // Lazy init
        
        const lang = Constants.LANGUAGES[GameState.currentLanguage];

        // 1. Score & Basic Stats
        this.elements.words.textContent = GameState.totalCorrectWords;
        this.elements.wpm.textContent = WpmSys.calculate();
        if(this.elements.coins) this.elements.coins.textContent = GameState.playerCoins.toLocaleString('id-ID');

        // 2. Combo & Multiplier
        const pct = (GameState.comboStreak / Constants.MAX_BAR_COMBO) * 100;
        this.elements.comboBar.style.width = `${pct}%`;
        
        if (GameState.comboLevel > 1) {
            this.elements.multiplier.classList.remove('hidden');
            this.elements.multiplier.textContent = `x${GameState.comboLevel}`;
        } else {
            this.elements.multiplier.classList.add('hidden');
        }

        // 3. Health vs Time Mode Display
        if (GameState.gameMode === 'CLASSIC') {
            this.elements.scoreContainer.style.display = 'flex';
            this.elements.score.textContent = GameState.score;
            
            this.elements.healthOrTimeText.textContent = lang.health + ':';
            this.elements.healthOrTimeValue.textContent = GameState.health;
            this.elements.healthOrTimeValue.className = `font-bold ml-1 ${GameState.health <= 3 ? 'text-red-500' : 'text-lime-400'}`;
            
            this.elements.stopwatchContainer.classList.remove('hidden');
            this.elements.stopwatch.textContent = TimerSys.getFormattedTime();
        } else {
            // Mode WPM/Time
            this.elements.scoreContainer.style.display = 'none';
            this.elements.stopwatchContainer.classList.add('hidden');
            
            this.elements.healthOrTimeText.textContent = lang.time + ':';
            this.elements.healthOrTimeValue.textContent = TimerSys.getFormattedTime();
            this.elements.healthOrTimeValue.className = `font-bold ml-1 ${GameState.timeLeft <= 5000 ? 'text-red-500' : 'text-sky-400'}`;
        }

        // 4. Target Word Display
        this.updateTargetDisplay(lang);

        // 5. User Input Display (Visual Ketikan)
        this.updateInputDisplay(lang);
        
        // 6. Mobile Hint
        const focusHint = document.getElementById('focusHintText');
        if (GameState.deviceMode === 'MOBILE') {
            this.elements.inputContainer.classList.add('mobile-pulse', 'mobile-input-active');
            if(focusHint) focusHint.textContent = lang.hintMobile;
        } else {
            this.elements.inputContainer.classList.remove('mobile-pulse', 'mobile-input-active');
            if(focusHint) focusHint.textContent = "";
        }
        
        // Error Shake border
        if (GameState.isTypingError) {
            this.elements.inputContainer.classList.add('input-error-border');
        } else {
            this.elements.inputContainer.classList.remove('input-error-border');
        }
    },

    updateTargetDisplay(lang) {
        const el = this.elements.target;
        if (GameState.currentTarget) {
            el.textContent = GameState.currentTarget.word.toUpperCase();
            el.className = "font-bold text-sky-400";
        } else if (GameState.disambiguationTargets.length > 0) {
            el.textContent = `${lang.ambiguous} ${GameState.userInput.toUpperCase()}]`;
            el.className = "font-bold text-red-400";
        } else if (GameState.userInput.length > 0) {
             el.textContent = `[${GameState.userInput.toUpperCase()}${lang.empty}`;
             el.className = "font-bold text-red-400";
        } else {
            el.textContent = '...';
            el.className = "font-bold text-gray-500 italic";
        }
    },

    updateInputDisplay(lang) {
        if (GameState.userInput === '') {
            this.elements.input.innerHTML = `<span class="text-gray-500 text-sm">${lang.inputPlaceholder}</span>`;
        } else {
            let displayHTML = '';
            let typedColor = GameState.isTypingError ? 'text-red-500' : 'text-green-500';
            
            displayHTML += `<span class="${typedColor}">${GameState.userInput}</span>`;
            
            // Suggestion text (sisa kata)
            if (GameState.currentTarget) {
                const untypedPart = GameState.currentTarget.word.substring(GameState.userInput.length);
                displayHTML += `<span class="text-white">${untypedPart}</span>`;
            } else if (GameState.disambiguationTargets.length > 0) {
                 const closestTarget = GameState.disambiguationTargets[0]; 
                 if (closestTarget) {
                     const hintPart = closestTarget.word.substring(GameState.userInput.length);
                     displayHTML += `<span class="text-gray-600">${hintPart}</span>`; 
                 }
            }
            this.elements.input.innerHTML = displayHTML;
        }
    }
};