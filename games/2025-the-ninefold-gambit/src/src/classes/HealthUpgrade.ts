import { GameObject } from "./GameObject";
import { Player } from "./player/Player";
import { PlayerHUD } from "./player/PlayerHUD";
import { Engine } from "@/core/engine";
import { Vector2 } from "@/core/vector";

export class HealthUpgrade extends GameObject {
    public isCollidedWithPlayer: boolean = false;
    private readonly addHealth: number = 1;
    private playerHUD: PlayerHUD;

    constructor(position: Vector2, player: Player) {
        super(position, '', player);
        this.position = position;
        this.player = player;
        this.playerHUD = new PlayerHUD(this.position, true);
    }

    public update(delta: number) {
        this.updateHitbox();
        this.draw();
        this.isCollidedWithPlayer = this.checkCollision(this.player.hitBox);
    }

    public draw() {
        this.playerHUD.position = this.position; // update position if changed
        this.playerHUD.healthImgDraw();
    }

    private upgradeHealth() {
        this.player.health += this.addHealth;
    }

    public getHealthUpgrade(healthArray: HealthUpgrade[]): HealthUpgrade | undefined {
        if (this.player.collidedWith === this.name && this.isCollidedWithPlayer) {
            const index = healthArray.findIndex(h => h.name === this.player.collidedWith);
            if (index !== -1) {
                const selected = healthArray.splice(index, 1)[0];
                this.player.collidedWith = '';
                this.upgradeHealth();
                return selected;
            }
        }
        return undefined;
    }

    private updateHitbox() {
        this.hitBox.position.x = this.position.x + 1.5;
        this.hitBox.position.y = this.position.y;
        this.hitBox.width = 12;
        this.hitBox.height = 12;
    }
}
