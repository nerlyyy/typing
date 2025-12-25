import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';
import { PlayerSkinRegistry, EnemySkinRegistry } from '../visual/skinRegistry.js';

let canvas, ctx;
let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 600;

// Helper Scaling
const toCanvasX = (x) => x * (canvas.width / CANVAS_WIDTH);
const toCanvasY = (y) => y * (canvas.height / CANVAS_HEIGHT);

export const RenderSys = {
    init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    },

    resizeCanvas() {
        if (!canvas) return;
        
        // Tentukan Base Resolution berdasarkan Mode
        if (GameState.screenRatio === 'PORTRAIT') {
            CANVAS_WIDTH = Constants.CANVAS_WIDTH_PORTRAIT;
            CANVAS_HEIGHT = Constants.CANVAS_HEIGHT_PORTRAIT;
        } else {
            CANVAS_WIDTH = Constants.CANVAS_WIDTH_LANDSCAPE;
            CANVAS_HEIGHT = Constants.CANVAS_HEIGHT_LANDSCAPE;
        }

        // Set ukuran asli canvas (resolusi internal)
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // Set rasio tampilan CSS
        const container = document.getElementById('canvasContainer');
        if (container) container.style.aspectRatio = `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`;
        
        // Update lebar wrapper UI agar pas
        const wrappers = document.querySelectorAll('.dynamic-width-wrapper');
        wrappers.forEach(el => el.style.maxWidth = `${CANVAS_WIDTH}px`);
    },

    setScreenRatio(mode) {
        GameState.screenRatio = mode;
        this.resizeCanvas();
        // Reset posisi player agar di tengah
        GameState.playerVisualX = CANVAS_WIDTH / 2;
        GameState.playerVisualY = CANVAS_HEIGHT - 50;
        
        // Update Tombol Visual di Settings
        const btnNormal = document.getElementById('btnRatioNormal');
        const btnPortrait = document.getElementById('btnRatioPortrait');
        if (mode === 'PORTRAIT') {
            btnPortrait?.classList.replace('bg-gray-700', 'bg-blue-600'); btnPortrait?.classList.replace('text-gray-400', 'text-white');
            btnNormal?.classList.replace('bg-blue-600', 'bg-gray-700'); btnNormal?.classList.replace('text-white', 'text-gray-400');
        } else {
            btnNormal?.classList.replace('bg-gray-700', 'bg-blue-600'); btnNormal?.classList.replace('text-gray-400', 'text-white');
            btnPortrait?.classList.replace('bg-blue-600', 'bg-gray-700'); btnPortrait?.classList.replace('text-white', 'text-gray-400');
        }
    },

    draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Stars (Background)
        import('../visual/effects.js').then(module => {
            module.stars.forEach(star => star.draw(ctx));
        });

        // Skip jika tidak playing/paused/gameover
        if (!['PLAYING', 'PAUSED', 'GAME_OVER'].includes(GameState.currentState)) return;

        // 2. Draw Particles
        GameState.particles.forEach(p => p.draw(ctx));

        // 3. Draw Enemies
        GameState.enemies.forEach(enemy => {
            const registry = EnemySkinRegistry[GameState.equippedSkins.enemy];
            if (registry) {
                // Konversi logic coordinate (800x600) ke canvas coordinate
                const ex = toCanvasX(enemy.x);
                const ey = toCanvasY(enemy.y);
                
                // Cek apakah musuh ini target saat ini?
                let colorOverride = null;
                if (GameState.disambiguationTargets.includes(enemy)) {
                     colorOverride = Constants.COLORS.DISAMBIGUATION;
                }
                if (enemy === GameState.currentTarget) {
                     colorOverride = Constants.COLORS.TARGET_GLOW;
                }

                registry.draw(ctx, ex, ey, enemy.word, enemy.isBoss, (enemy.hitFlashTimer > 0), colorOverride);
                
                // Draw Text
                this.drawEnemyText(enemy, ex, ey);
            }
        });

        // 4. Draw Player
        const playerRegistry = PlayerSkinRegistry[GameState.equippedSkins.player];
        if (playerRegistry) {
            const px = toCanvasX(GameState.playerVisualX);
            const py = toCanvasY(GameState.playerVisualY + GameState.recoilOffset);
            
            // Hitung Rotasi Player ke Target
            let rotation = 0;
            if (GameState.equippedSkins.player === 'TRIANGLE_SHIP' && GameState.currentTarget) {
                const dx = toCanvasX(GameState.currentTarget.x) - px;
                const dy = toCanvasY(GameState.currentTarget.y) - py;
                rotation = Math.atan2(dy, dx) + Math.PI / 2;
            }

            // Knockback Shake
            if (GameState.playerKnockbackTimer > 0) {
                const shake = (Math.random() - 0.5) * 10;
                ctx.save();
                ctx.translate(shake, 0);
            }

            playerRegistry.draw(ctx, px, py, rotation, GameState.isPlayerDamaged, { clickPulse: GameState.clickPulseScale });

            if (GameState.playerKnockbackTimer > 0) ctx.restore();
        }

        // 5. Draw Bullets
        ctx.fillStyle = Constants.COLORS.BULLET;
        GameState.bullets.forEach(b => {
            ctx.beginPath();
            ctx.arc(toCanvasX(b.x), toCanvasY(b.y), toCanvasX(3), 0, Math.PI * 2);
            ctx.fill();
        });

        // 6. Draw UI Overlay Animations (Floating Text, broken lock, etc)
        this.drawAnimations();
    },

    drawEnemyText(enemy, x, y) {
        ctx.font = `bold ${toCanvasX(20)}px "Space Mono", monospace`;
        ctx.textAlign = 'center';
        const textY = y + toCanvasY(40); // Offset text di bawah musuh

        // Shadow Text
        ctx.fillStyle = 'black';
        ctx.fillText(enemy.word.toUpperCase(), x + 2, textY + 2);
        
        // Main Text
        ctx.fillStyle = 'white';
        ctx.fillText(enemy.word.toUpperCase(), x, textY);

        // Highlight Typed Part
        if (GameState.userInput.length > 0 && enemy.word.startsWith(GameState.userInput)) {
            const typedPart = GameState.userInput.toUpperCase();
            const widthTotal = ctx.measureText(enemy.word.toUpperCase()).width;
            const startX = x - (widthTotal / 2);
            
            ctx.textAlign = 'left';
            ctx.fillStyle = Constants.COLORS.DISAMBIGUATION;
            ctx.fillText(typedPart, startX, textY);
        }
    },

    drawAnimations() {
        // Floating Text (Score, Level Up)
        ctx.textAlign = 'center';
        GameState.scoreAnimations.forEach(anim => {
            const x = toCanvasX(anim.x);
            const y = toCanvasY(anim.y); // Y sudah diupdate di logic
            
            ctx.globalAlpha = 1 - (anim.lifetime / anim.duration);
            ctx.fillStyle = anim.color;
            ctx.font = `bold ${toCanvasX(24)}px monospace`;
            
            const val = (typeof anim.value === 'number') ? `+${anim.value}` : anim.value;
            ctx.fillText(val, x, y);
            ctx.globalAlpha = 1.0;
        });

        // Broken Lock
        if (GameState.brokenLockAnimation) {
            const anim = GameState.brokenLockAnimation;
            const x = toCanvasX(anim.x);
            const y = toCanvasY(anim.y);
            
            ctx.strokeStyle = Constants.COLORS.TYPO;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10);
            ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10);
            ctx.stroke();
        }
    }
};