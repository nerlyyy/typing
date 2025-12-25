import { Constants } from '../core/constants.js';

export class Bullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.markedForDeletion = false;
    }

    update(deltaTime, speedMultiplier) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        const scaledSpeed = Constants.BULLET_SPEED * speedMultiplier;

        if (distance > scaledSpeed) {
            const ratio = scaledSpeed / distance;
            this.x += dx * ratio;
            this.y += dy * ratio;
        } else {
            // Sampai di target
            this.x = this.targetX;
            this.y = this.targetY;
            this.markedForDeletion = true;
        }
    }
}