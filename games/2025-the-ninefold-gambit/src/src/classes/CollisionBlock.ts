
import { BASE_TILE_HEIGHT, BASE_TILE_WIDTH, DEBUGGER } from '@/constans/game-contstans';
import { drawEngine } from '@/core/draw-engine';
import { Vector2 } from '@/core/vector';

export class CollisionBlock {
    width = BASE_TILE_WIDTH;
    height = BASE_TILE_HEIGHT;
    position: Vector2 = new Vector2();
    public active: boolean = true
    constructor(position: Vector2) {
        this.position = position;
        this.active = true;
    }

    public draw() {
        if (DEBUGGER) {
            drawEngine.context.fillStyle = 'rgba(255, 0, 0, 0.4)';
            drawEngine.context.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    public update() {
        this.draw();
    }
}