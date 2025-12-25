import { GameState } from '../core/state.js';
import { RenderSys } from './render.js';
import { Constants } from '../core/constants.js';
import { HUD } from '../ui/hud.js';
import { UIManager } from '../ui/modals.js';
import { createExplosion } from '../visual/effects.js';
import { AudioSys } from './audio.js';
import { TypingSys } from './typingSystem.js';
// FIX: Import Statis Enemy agar tidak delay
import { Enemy } from '../gameplay/enemy.js';

let lastTime = 0;

// Helper: Spawn Enemy
const spawnEnemy = (isBoss = false) => {
    // Import random word
    const lang = GameState.currentLanguage.toUpperCase();
    const wordList = Constants.WORDS[lang] || Constants.WORDS.ID;
    const word = wordList[Math.floor(Math.random() * wordList.length)];

    // FIX: Gunakan class Enemy yang sudah diimport statis
    let x = 0;
    let attempts = 0;
    const width = 20 + word.length * 15;
    const screenW = (GameState.screenRatio === 'PORTRAIT') ? Constants.CANVAS_WIDTH_PORTRAIT : Constants.CANVAS_WIDTH_LANDSCAPE;
    
    // Loop cari posisi kosong
    do {
        x = Math.random() * (screenW - width) + (width / 2);
        attempts++;
    } while (!isPositionClear(x) && attempts < 10);

    if (attempts < 10) {
        GameState.enemies.push(new Enemy(word, x, -50, isBoss));
    }
};

const isPositionClear = (x) => {
    for (const enemy of GameState.enemies) {
        if (Math.abs(x - enemy.x) < Constants.MIN_ENEMY_SPACING) return false;
    }
    return true;
};

export const GameLoop = {
    loop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (GameState.currentState === 'PLAYING') {
            update(deltaTime);
        }

        RenderSys.draw();
        requestAnimationFrame(GameLoop.loop);
    }
};

function update(deltaTime) {
    const speedMultiplier = deltaTime / 16.67; // Normalize ke 60FPS
    
    // 1. Update Entities
    // Enemies
    for (let i = GameState.enemies.length - 1; i >= 0; i--) {
        const enemy = GameState.enemies[i];
        enemy.update(deltaTime, speedMultiplier);

        // Hapus jika mati & animasi selesai
        if (enemy.isDying && enemy.dyingTimer >= 500) {
            GameState.enemies.splice(i, 1);
            TypingSys.updateTypingState(GameState.userInput); // Refresh target
            continue;
        }

        // Cek Game Over (Musuh lewat bawah layar)
        const limitY = (GameState.screenRatio === 'PORTRAIT') ? Constants.CANVAS_HEIGHT_PORTRAIT : Constants.CANVAS_HEIGHT_LANDSCAPE;
        if (enemy.y > limitY - 50 && !enemy.isDying) {
            handlePlayerDamage(enemy, i);
        }
    }

    // Bullets
    for (let i = GameState.bullets.length - 1; i >= 0; i--) {
        const b = GameState.bullets[i];
        
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = Constants.BULLET_SPEED * speedMultiplier;
        
        if (dist > speed) {
            b.x += (dx/dist) * speed;
            b.y += (dy/dist) * speed;
        } else {
            GameState.bullets.splice(i, 1);
        }
    }

    // Particles (Dynamic import efek visual OK karena jarang diakses logic)
    import('../visual/effects.js').then(module => {
        for (let i = GameState.particles.length - 1; i >= 0; i--) {
            GameState.particles[i].update(deltaTime);
            if (GameState.particles[i].life <= 0) GameState.particles.splice(i, 1);
        }
        // Stars
        module.stars.forEach(s => s.update(speedMultiplier * 0.5));
    });

    // Animations (Floating Text)
    for (let i = GameState.scoreAnimations.length - 1; i >= 0; i--) {
        GameState.scoreAnimations[i].lifetime += deltaTime;
        if (GameState.scoreAnimations[i].lifetime >= GameState.scoreAnimations[i].duration) {
            GameState.scoreAnimations.splice(i, 1);
        } else {
            // Update posisi float
            const anim = GameState.scoreAnimations[i];
            if (anim.type === 'float') {
                const progress = anim.lifetime / anim.duration;
                anim.x += (anim.targetX - anim.x) * 0.05;
                anim.y += (anim.targetY - anim.y) * 0.05;
            }
        }
    }
    
    // Player Visuals
    updatePlayerVisuals(deltaTime);

    // 2. Spawning Logic
    const now = Date.now();
    if (now - GameState.lastSpawnTime > GameState.spawnInterval) {
        spawnEnemy();
        GameState.lastSpawnTime = now;
    }

    // 3. Time Mode Logic
    if (GameState.gameMode === 'TIME') {
        GameState.timeLeft -= deltaTime;
        if (GameState.timeLeft <= 0) {
            UIManager.gameOver();
        }
    }
}

function updatePlayerVisuals(deltaTime) {
    let targetX, targetY;
    const limitY = (GameState.screenRatio === 'PORTRAIT') ? Constants.CANVAS_HEIGHT_PORTRAIT : Constants.CANVAS_HEIGHT_LANDSCAPE;
    const centerX = (GameState.screenRatio === 'PORTRAIT') ? Constants.CANVAS_WIDTH_PORTRAIT / 2 : Constants.CANVAS_WIDTH_LANDSCAPE / 2;

    if (GameState.equippedSkins.player === 'CURSOR_DEFAULT' && GameState.currentTarget) {
        targetX = GameState.currentTarget.x;
        targetY = GameState.currentTarget.y + 20; 
    } else {
        targetX = centerX;
        targetY = limitY - 50;
    }
    
    GameState.playerVisualX += (targetX - GameState.playerVisualX) * 0.1;
    GameState.playerVisualY += (targetY - GameState.playerVisualY) * 0.1;

    if (GameState.recoilOffset > 0) GameState.recoilOffset *= 0.9;
    if (GameState.playerKnockbackTimer > 0) GameState.playerKnockbackTimer -= deltaTime;
}

function handlePlayerDamage(enemy, index) {
    GameState.enemies.splice(index, 1);
    
    if (GameState.gameMode === 'CLASSIC') {
        GameState.health -= enemy.isBoss ? 3 : 1;
        
        AudioSys.error();
        GameState.isPlayerDamaged = true;
        setTimeout(() => GameState.isPlayerDamaged = false, 300);
        createExplosion(GameState.playerVisualX, GameState.playerVisualY, '#ef4444');
        
        GameState.comboStreak = 0;
        GameState.comboLevel = 1;
        
        HUD.updateDisplays();

        if (GameState.health <= 0) {
            UIManager.gameOver();
        }
    }
    
    if (GameState.userInput.length > 0 && enemy.word.startsWith(GameState.userInput)) {
        TypingSys.resetInput();
    }
}