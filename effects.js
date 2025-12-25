// ==========================================
// VISUAL EFFECTS SYSTEM
// ==========================================
import { GameState } from '../core/state.js';
import { Constants } from '../core/constants.js';

export class Particle {
    constructor(x, y, color, speed, direction, life, type = 'normal') {
        this.x = x; 
        this.y = y; 
        this.color = color; 
        this.life = life; 
        this.maxLife = life; 
        this.type = type; 
        this.vx = Math.cos(direction) * speed; 
        this.vy = Math.sin(direction) * speed; 
        this.gravity = (type === 'spark') ? 0.1 : 0;
    }
    
    update(deltaTime) {
        this.x += this.vx; 
        this.y += this.vy + this.gravity; 
        this.life -= deltaTime;
        if(this.type === 'normal') { 
            this.vx *= 0.95; 
            this.vy *= 0.95; 
        }
    }
    
    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife); 
        ctx.globalAlpha = alpha; 
        ctx.fillStyle = this.color;
        
        const size = this.type === 'thrust' ? 3 : 2; 
        ctx.beginPath();
        if (this.type === 'thrust') { 
            ctx.shadowBlur = 10; 
            ctx.shadowColor = this.color; 
        }
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.globalAlpha = 1.0; 
        ctx.shadowBlur = 0;
    }
}

export class Star {
    constructor(canvasW, canvasH) { 
        this.canvasW = canvasW;
        this.canvasH = canvasH;
        this.reset(true); 
    }
    
    reset(randomY = false) {
        this.x = Math.random() * this.canvasW; 
        this.y = randomY ? Math.random() * this.canvasH : -10;
        this.z = Math.random() * 2 + 0.5; 
        this.size = Math.random() * 1.5 + 0.5; 
        this.opacity = Math.random() * 0.5 + 0.3;
    }
    
    update(speed) { 
        this.y += speed * this.z; 
        if (this.y > this.canvasH) this.reset(); 
    }
    
    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); 
        ctx.fill();
    }
}

// Global Effect Managers
export let stars = [];

export function initStars(width, height) {
    stars = []; 
    for(let i=0; i<80; i++) stars.push(new Star(width, height));
}

export function createExplosion(x, y, color) {
    const count = 15; 
    for (let i = 0; i < count; i++) {
        const speed = Math.random() * 3 + 1; 
        const dir = Math.random() * Math.PI * 2; 
        const life = 300 + Math.random() * 300;
        GameState.particles.push(new Particle(x, y, color, speed, dir, life, 'normal'));
    }
    for(let i=0; i<5; i++) {
         const speed = Math.random() * 5 + 3; 
         const dir = Math.random() * Math.PI * 2;
         GameState.particles.push(new Particle(x, y, '#ffffff', speed, dir, 200, 'spark'));
    }
}