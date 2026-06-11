// import { Vector } from "@/core/engine";

import { Vector2 } from "@/core/vector";
import { images } from "./Images";
import { ProjectileType } from "@/constans/game-contstans";
import { Box } from "@/model/common.model";
import { time } from "@/core/time";
import { Sprite } from "./Sprite";

export class Projectile {
    public position!: Vector2;
    public radius!: number;
    private velocity!: Vector2;

    public type!: string;
    public hitBox: Box = new Box();
    public speed!: number;
    public direction: Vector2 = new Vector2(0, 0);
    public spawnTime!: number;
    public lifeSpan: number = 5000;
    public isActive: boolean = true;
    private angle!: number;
    // private enemyBullet: Sprite;

    constructor(position: Vector2, speed: number, direction: Vector2, lifeSpan: number, type: string) {
        this.position = position;
        this.radius = 6;
        this.type = type;

        this.speed = speed;
        this.direction = direction.clone(); // Use the Vector2 class for direction
        this.spawnTime = time.elapsed//performance.now();
        this.lifeSpan = lifeSpan; //1000; // 1 second in milliseconds.
        this.isActive = true; // Added 'active' property

        this.velocity = this.direction.multiply(this.speed).clone();

        this.angle = this.vectorToAngle(this.direction.normalize());

        // this.enemyBullet = new Sprite(this.position, 'black_cat_bullet.png');
        // console.log('Angle---', this.angle)

    }

    public draw() {
        if (!this.isActive) return;

        this.projectileDraw(this.angle)
        // this.playerProjectileHitBox();
        this.updateHitBox(this.type);
    }

    public update(delta: number) {
        const currentTime = time.elapsed; //performance.now()
        if ((currentTime - this.spawnTime) > this.lifeSpan) {
            this.isActive = false;
            return;
        }
        this.draw();

        // this.position = this.position.add(this.velocity);
        this.position.x += this.velocity.x * time.deltaSeconds;
        this.position.y += this.velocity.y * time.deltaSeconds;
    }

    private projectileDraw(bulletRotation: number) {
        if (this.type === ProjectileType.PLAYER) {
            images.getFireBallSprite(this.position, bulletRotation);
        } else if (this.type === ProjectileType.ENEMY) {
            images.getCatBulletSprite(this.position);
            // this.enemyBullet.draw();
        }
    }

    private vectorToAngle(v: { x: number, y: number }): number {
        if (v.x === 1) return 0;              // right
        if (v.x === -1) return - Math.PI;       // left
        if (v.y === -1) return -Math.PI / 2;  // up
        if (v.y === 1) return Math.PI / 2;   // down
        return 0; // default
    }

    private updateHitBox(type: string) {
        switch (type) {
            case ProjectileType.PLAYER:
                this.playerProjectileHitBox();
                break;
            case ProjectileType.ENEMY:
                this.blackCatProjectileHitBox();
                break;

            default:
                break;
        }
    }

    private playerProjectileHitBox() {
        this.hitBox.position.x = this.position.x + 2;
        this.hitBox.position.y = this.position.y + 2;
        this.hitBox.width = 10;
        this.hitBox.height = 10;
    }

    private blackCatProjectileHitBox() {
        this.hitBox.position.x = this.position.x;
        this.hitBox.position.y = this.position.y;
        this.hitBox.width = 5;
        this.hitBox.height = 5;
    }
}