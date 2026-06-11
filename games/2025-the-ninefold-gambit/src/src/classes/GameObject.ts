import { Engine } from '@/core/engine';
import { Animations, Box } from "@/model/common.model";
import { CollisionBlock } from "./CollisionBlock";
import { Sprite } from "@/classes/Sprite";
import { Player } from "./player/Player";
import { Vector2 } from '@/core/vector';

export class GameObject extends Sprite {
    private _name = '';
    public position: Vector2;
    public velocity: Vector2;
    public gravity?: number;
    public speed?: number;
    public collisionBlocks?: CollisionBlock[];
    public hitBox: Box = new Box();
    public player: Player;

    get name() {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }

    constructor(
        position: Vector2,
        src: string,
        player: Player,
        animations?: Animations[],
        loop?: boolean,
        frameCount?: number,
        frameBuffer?: number,
        velocity: Vector2 = new Vector2(),
        speed?: number,
        collisionBlocks?: CollisionBlock[]
    ) {
        super(position, src, animations, frameCount, frameBuffer, loop);
        this.position = position;
        this.velocity = velocity;
        this.speed = speed;
        this.collisionBlocks = collisionBlocks;
        this.player = player;
    }

    checkCollision(hitBoxToCheck: Box): boolean {
        if (Engine.collisions(hitBoxToCheck, this.hitBox)) {
            this.player.collidedWith = this.name;
            return true;
        }
        return false;
    }

    playAnimation(name: string, isHozFlip?: boolean, isVertFlip?: boolean) {
        if (!this.animations || this.animations.length === 0) return;

        const animation = this.animations.find(a => a.animationName === name);
        if (!animation || this.image === animation.props.image) return;

        this.image = animation.props.image;
        this.frameCount = animation.props.frameCount;
        this.frameBuffer = animation.props.frameBuffer;
        this.loop = animation.props.loop;
        this.isHozFlip = isHozFlip;
        this.isVertFlip = isVertFlip;
        this.currentAnimation = animation;

        // Randomize starting frame for longer animations
        this.currentframe = animation.props.frameCount > 4
            ? Math.floor(Math.random() * 4)
            : 0;
    }
}
