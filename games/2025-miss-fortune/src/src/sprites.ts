import {
    cameraPos, type Color,
    drawCircle, drawEllipse, drawLine, drawPoly, drawRect, drawText,
    EngineObject,
    engineObjects, fontDefault, gamepadStick, gamepadWasPressed, gamepadWasReleased, isUsingGamepad, keyDirection,
    keyWasPressed, keyWasReleased, mainContext, ParticleEmitter, rand, RandomGenerator, Sound,
    tile, time, Timer, vec2, type Vector2, worldToScreen
} from "littlejsengine";
import {drawCircleSegment} from "./draw.ts";
import {Colors} from "./utils.ts";

// Layer render order
const BACKGROUND_LAYER = 0;
const CAT_LAYER = 1;
const DESTRUCTIBLE_LAYER = 2;
const WATER_LAYER = 3;

const EFFECT_VOL = 0.5


// The player-controlled cat
export class Cat extends EngineObject {
    private readonly speed: number;
    private readonly jumpSpeed: number
    private canDoubleJump: boolean;
    private jumpCount: number;
    private score: number;
    private lives: number;
    private climbed: number;
    private lastFrames: Vector2[];
    private lastGround: EngineObject | undefined
    private flashInterval: NodeJS.Timeout | undefined

    constructor(pos: Vector2 = vec2(0, 0)) {
        super(pos);

        this.tileInfo = tile(0, 16)
        this.setCollision()
        // this.speed = 0.08
        // this.jumpSpeed = 0.
        // this.friction = 0.1;

        this.friction = 0.2;
        this.speed = 0.14;
        this.jumpSpeed = 0.5;
        this.gravityScale = 3;

        this.canDoubleJump = false
        this.jumpCount = 0;
        this.renderOrder = CAT_LAYER;
        this.score = 0;
        this.lives = 9;
        this.lastFrames = []
        this.lastGround = undefined
        this.climbed = 0;

        this.flashInterval = undefined
    }

    public setFlashing(): void {
        clearInterval(this.flashInterval);

        this.flashInterval = setInterval(() => {
            if (this.color.a < 1) {
                this.color.set(this.color.r, this.color.g, this.color.b, 1);
            } else {
                this.color.set(this.color.r, this.color.g, this.color.b, 0.2);
            }
        }, 100);
        // Set timeout to stop flashing after 1 second
        setTimeout(() => {
            if (this.flashInterval) {
                clearInterval(this.flashInterval);
                this.flashInterval = undefined;
                this.color.set(this.color.r, this.color.g, this.color.b, 1);
            }
        }, 1000)
    }

    public respawn(): void {
        this.pos = vec2(this.lastGround!.pos.x, this.lastGround!.pos.y + 1);
    }

    public getLives(): number {
        return this.lives;
    }

    public damage(kill: boolean = false): void {
        this.lives -= 1
        this.setFlashing()
        if (this.lives <= 0 || kill) {
            new Sound([1.1,,-397,.01,.03,.09,3,1.2,1,,,,,,,.1,,.8,.04]).play(this.pos, EFFECT_VOL); // Meow Sad;
        } else if (this.lives > 0) {
            new Sound([1.1, , 397, .01, .03, .09, 3, 1.2, 1, , , , , , , .1, , .8, .04]).play(this.pos, EFFECT_VOL); // Meow
        }
    }

    public addToScore(points: number): void {
        this.score += points;
    }

    public getScore(): number {
        return this.score;
    }

    public update(): void {
        super.update()

        this.lastFrames.push(this.pos.copy())
        if (this.lastFrames.length > 6) {
            this.lastFrames.shift()
        }

        if (this.getLives() <= 0) {
            return;
        }

        const moveInput = isUsingGamepad ? gamepadStick(0) : keyDirection()
        if (moveInput.x !== 0) {
            this.velocity = vec2(moveInput.x * this.speed, this.velocity.y);
        }

        let jumpButtonPressed = gamepadWasPressed(0) || gamepadWasPressed(1) || gamepadWasPressed(2) || gamepadWasPressed(3) || keyWasPressed('ArrowUp') || keyWasPressed('w')
        let jumpReleased = gamepadWasReleased(0) || gamepadWasReleased(1) || gamepadWasReleased(2) || gamepadWasReleased(3) || keyWasReleased('ArrowUp') || keyWasReleased('w');

        // Reset jump count when touching the ground
        if (this.groundObject) {
            if (this.groundObject instanceof WindowSillBase) {
                this.climbed = Math.max(this.groundObject.getFloor(), this.climbed);
            }
            this.jumpCount = 0
            this.lastGround = this.groundObject
        } else if (this.jumpCount === 0 && this.velocity.y < 0) {
            // If the cat is falling and hasn't jumped yet, it means it has just left the ground,
            // so we set the jump count to 1 to allow for a double jump.
            jumpReleased = true
            this.jumpCount = 1
        }

        // Handle jumping and double jumping
        if (this.canDoubleJump && jumpButtonPressed && this.jumpCount === 2) {
            this.velocity = vec2(this.velocity.x, this.jumpSpeed);
            this.canDoubleJump = false;
            this.jumpCount += 1
            new Sound([.6,,449,.02,.1,.3,1,2.9,30,,,,,.9,,,,.1,.03,,-1054]).play(this.pos, EFFECT_VOL); // Jump 1
        } else if (jumpReleased && this.jumpCount === 1) {
            this.canDoubleJump = true
            this.jumpCount += 1
        } else if (jumpButtonPressed && this.jumpCount === 0) {
            this.velocity = vec2(this.velocity.x, this.jumpSpeed);
            this.jumpCount += 1;
            // new Sound([1.1,,397,.01,.03,.09,3,1.2,1,,,,,,,.1,,.8,.04]).play(this.pos, EFFECT_VOL); // Jump 0
        }
    }

    public render() {
        // Wag tail
        const tailBase = this.lastFrames[0] || this.pos;
        const tailLength = 10;
        const tailSegmentLength = 0.15;
        const wagSpeed = 6; // Adjust for faster/slower wag
        const wagAmplitude = 0.5; // Radians, adjust for more/less wag

        for (let i = 0; i < tailLength; i++) {
            // The further from the base, the less the wag
            const t = i / tailLength;
            const angle = Math.sin(time * wagSpeed - t * 1.5) * wagAmplitude * (1 - t);

            // Calculate segment position
            const x = tailBase.x - Math.sin(angle) * tailSegmentLength * i;
            const y = tailBase.y + 0.1 * i;

            drawCircle(vec2(x, y), 0.1 * (1 - t * 0.5), Colors.black, 0.01, Colors.darker_grey);
        }

        for (const f of this.lastFrames) {
            drawCircle(vec2(f.x, f.y - 0.05),
                (0.5),
                Colors.black, 0.05,
                Colors.darker_grey)
        }

        if (engineObjects
            .filter(obj => obj instanceof Water)
            .some((obj) => ((this.pos.x > obj.pos.x - 1) &&
                ( this.pos.x < obj.pos.x + 1) && (this.pos.y < obj.pos.y)
            ))) {
            drawText("!!!", vec2(this.pos.x, this.pos.y + 1), 1.0, Colors.warningRed);
        }

        super.render();

    }

    public getFloorsClimbed() {
        return this.climbed;
    }

    public getLastGround(): EngineObject | undefined {
        return this.lastGround
    }
}

// Destructible objects that fall when hit by the cat
class Destructible extends EngineObject {
    constructor(pos: Vector2, tileIndex: number) {
        super(pos, vec2(1, 1));
        this.setCollision()
        this.mass = 0
        this.renderOrder = DESTRUCTIBLE_LAYER;
        this.tileInfo = tile(tileIndex, 16)
    }

    public update() {
        super.update();

        if (this.pos.y < -10) {
            new Sound([.6,,500,.02,.09,.01,3,1.5,,,,,,.6,35,.4,,.42,.09,,1303]).play(this.pos, EFFECT_VOL); // Hit 3
            this.destroy()
        }
    }

    public collideWithObject(object: EngineObject): boolean {
        // Dont double count if already falling
        if (this.mass) {
            return false
        }
        if (object instanceof Cat) {
            this.setCollision(false, false)
            this.mass = 1
            this.angleVelocity = (Math.random() - 0.5) * 0.2
            object.addToScore(1)
            new Sound([,,129,.01,,.15,,,,,,,,5]).play(object.pos, EFFECT_VOL) // Hit
            return true;
        }
        return false;
    }
}

class Water extends EngineObject {
    constructor(pos: Vector2) {
        super(pos);
        this.tileInfo = tile(4, 16);
        this.setCollision()
        this.mass = 0.01
        this.renderOrder = WATER_LAYER
        this.color = Colors.waterBlue
    }

    public render(): void {
        super.render()
        for (let i = 0; i < 5; i++) {
            drawCircle(vec2(this.pos.x, this.pos.y + (0.25 * i)),
                (0.5 - (0.1 * i)),
                Colors.waterBlue, 0,)
        }
    }

    public collideWithObject(object: EngineObject): boolean {
        if (object instanceof Cat) {

            const emitter = new ParticleEmitter(object.pos, 0, 0, 0, 100, 3.14, tile(4, 16),
                Colors.waterBlue, Colors.waterBlue, Colors.whiteNoAlpha, Colors.whiteNoAlpha,
                0.5, 1, 0.1, 0.1, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, false, false, true);

            setTimeout(() => emitter.destroy(), 250)

            new Sound([,.2,40,.5,,1.5,,11,,,,,,199]).play(object.pos, EFFECT_VOL)

            object.damage();
            this.destroy()
            return true;
        } else if (object instanceof Ground) {
            this.destroy()
            return true;
        }
        return false;
    }
}

export class Ground extends EngineObject {
    constructor(pos: Vector2, size: Vector2) {
        super(pos, size);
        this.setCollision(); // Enable collision for the ground
        this.mass = 0;      // Make the ground static (immovable)
    }
}

const WINDOW_TYPE_OPEN = 0;
const WINDOW_TYPE_CLOSE = 1;
const WINDOW_WITH_DRAPES = 2;

const STATE_TIME = 2.5
const BUCKET_STATE = 2.5

export abstract class WindowSillBase extends EngineObject {
    protected floor: number

    protected constructor(pos: Vector2, size: Vector2, floor: number) {
        super(pos, size);
        this.setCollision();
        this.mass = 0;
        this.renderOrder = BACKGROUND_LAYER;
        this.color = Colors.clear
        this.floor = floor
    }

    protected abstract renderWindowContents(): void

    protected renderWindowBase(color: Color, borderX: number, borderWidth: number = 0.1) {
        drawRect(
            vec2(this.pos.x, this.pos.y + 1.5),
            vec2(this.size.x, this.size.y - 3),
            color, 0, false
        );

        this.renderWindowContents()

        drawRect(this.pos, this.size, Colors.white, 0, false);
        drawLine(
            vec2(this.pos.x - borderX, this.pos.y + 3),
            vec2(this.pos.x + borderX, this.pos.y + 3),
            borderWidth, Colors.white, false
        );
    }

    public getFloor(): number {
        return this.floor
    }

    abstract doesHavePlant(): boolean;
}

export class ClosedWindowSill extends WindowSillBase {
    private readonly type: number;
    protected plant: Destructible | undefined;
    protected lights: boolean;
    protected reactTime: number
    private readonly someoneHome: boolean


    constructor(pos: Vector2, size: Vector2, floor: number, random: RandomGenerator) {
        super(pos, size, floor);
        this.setCollision();
        this.mass = 0;
        this.renderOrder = BACKGROUND_LAYER;
        this.type = Math.floor(Math.random() * 4) | WINDOW_TYPE_OPEN;
        this.color = Colors.clear
        this.lights = false
        this.reactTime = random.int(500, 1000)
        this.someoneHome = random.int(0, 2) === 0


        if (random.int(0, 5) < 4) {
            const destructibleTiles = [1, 2, 3];
            const tileIndex = destructibleTiles[random.int(0, destructibleTiles.length)];
            this.plant = new Destructible(vec2(pos.x, pos.y + 0.75), tileIndex);
        }
    }

    protected renderWindowContents() {
        switch (this.type) {
            case WINDOW_TYPE_CLOSE:
                drawLine(
                    vec2(this.pos.x - 1.25, this.pos.y + 1.5),
                    vec2(this.pos.x + 1.25, this.pos.y + 1.5),
                    0.1, Colors.white, false);
                drawLine(
                    vec2(this.pos.x, this.pos.y + 2.75),
                    vec2(this.pos.x, this.pos.y),
                    0.1, Colors.white, false);
                break;
            case WINDOW_WITH_DRAPES:
                drawCircleSegment(
                    worldToScreen(vec2(this.pos.x - 1.25, this.pos.y + 2.75)),
                    45,
                    0,
                    Math.PI / 2,
                    Colors.grey)
                drawCircleSegment(
                    worldToScreen(vec2(this.pos.x + 1.25, this.pos.y + 2.75)),
                    45,
                    Math.PI / 2,
                    Math.PI,
                    Colors.grey)
                break;
            default:
        }
    }

    public render() {
        this.renderWindowBase(this.lights ? Colors.lightsOn : Colors.dark_grey, 1.5, 0.1)
    }

    public update() {
        super.update()

        if (this.plant?.destroyed && this.someoneHome) {
            setTimeout(() => this.lights = true, this.reactTime)
        }
    }

    public doesHavePlant(): boolean {
        return this.plant !== undefined
    }
}

export class WindowSillEnemy extends WindowSillBase {
    private bucketTimer: Timer;
    private stateTimer: Timer;
    private state: boolean;

    constructor(pos: Vector2, size: Vector2, floor: number) {
        super(pos, size, floor);
        this.setCollision();
        this.mass = 0;
        this.renderOrder = BACKGROUND_LAYER;
        this.bucketTimer = new Timer(BUCKET_STATE)
        this.stateTimer = new Timer(STATE_TIME)
        this.state = false
        this.color = Colors.clear
    }

    protected renderWindowContents() {
        drawEllipse(vec2(this.pos.x, this.pos.y + 1.25), 1, 1.25, 0,
            Colors.grey)

        drawCircle(vec2(this.pos.x, this.pos.y + 2.25), 0.5,
            Colors.skin)

        drawLine(
            vec2(this.pos.x + 0.05, this.pos.y + 2.25),
            vec2(this.pos.x + 0.25, this.pos.y + 2.45), 0.1,
            Colors.dark_grey, false)

        drawLine(
            vec2(this.pos.x - 0.05, this.pos.y + 2.25),
            vec2(this.pos.x - 0.25, this.pos.y + 2.45), 0.1,
            Colors.dark_grey, false)

        if (!this.state) {
            drawPoly([
                    vec2(this.pos.x - 0.75, this.pos.y + 1.5),
                    vec2(this.pos.x - 0.5, this.pos.y + 0.5),
                    vec2(this.pos.x + 0.5, this.pos.y + 0.5),
                    vec2(this.pos.x + 0.75, this.pos.y + 1.5)
                ],
                Colors.dark_grey)
        } else {
            drawPoly([
                    vec2(this.pos.x - 0.5, this.pos.y + 1.5),
                    vec2(this.pos.x - 0.75, this.pos.y + 0.5),
                    vec2(this.pos.x + 0.75, this.pos.y + 0.5),
                    vec2(this.pos.x + 0.5, this.pos.y + 1.5)
                ],
                Colors.dark_grey)
        }

        drawCircle(vec2(this.pos.x - 0.5, this.pos.y + 1), 0.25,
            Colors.skin)
        drawCircle(vec2(this.pos.x + 0.5, this.pos.y + 1), 0.25,
            Colors.skin)
    }

    public render() {
        this.renderWindowBase(Colors.lightsOn, 1.5, 0.1)
    }

    public update() {
        super.update()

        if (this.pos.y - 20 > cameraPos.y) {
            return
        }

        if (this.stateTimer.isSet() && this.stateTimer.elapsed()) {
            this.state = true
            this.stateTimer.unset()
            this.bucketTimer.set(BUCKET_STATE)

            new Water(this.pos)

        } else if (this.bucketTimer.isSet() && this.bucketTimer.elapsed()) {
            this.state = false
            this.stateTimer.set(STATE_TIME)
            this.bucketTimer.unset()
        }
    }

    public doesHavePlant(): boolean {
        return false
    }
}

export class JumpScareEnemy extends WindowSillBase {

    private lights: boolean
    private timeout: boolean
    private timeoutSet: boolean

    constructor(pos: Vector2, size: Vector2, floor: number, random: RandomGenerator) {
        super(pos, size, floor);
        this.lights = false
        this.timeout = false
        this.timeoutSet = false

        const destructibleTiles = [1, 2, 3];
        const tileIndex = destructibleTiles[random.int(0, destructibleTiles.length)];
        new Destructible(vec2(pos.x, pos.y + 0.75), tileIndex);
    }

    protected renderWindowContents() {
        if (!this.lights) {
            return
        }
        drawCircleSegment(worldToScreen(vec2(this.pos.x, this.pos.y)), 45, Math.PI, 0, Colors.grey)

        drawCircle(vec2(this.pos.x, this.pos.y + 1.25), 0.5,
            Colors.skin)

        drawLine(
            vec2(this.pos.x + 0.05, this.pos.y + 1.25),
            vec2(this.pos.x + 0.25, this.pos.y + 1.45), 0.1,
            Colors.dark_grey, false)

        drawLine(
            vec2(this.pos.x - 0.05, this.pos.y + 1.25),
            vec2(this.pos.x - 0.25, this.pos.y + 1.45), 0.1,
            Colors.dark_grey, false)

        drawCircle(vec2(this.pos.x - 0.75, this.pos.y + 0.5), 0.25,
            Colors.skin)
        drawCircle(vec2(this.pos.x + 0.75, this.pos.y + 0.5), 0.25,
            Colors.skin)

        drawText("Boo!!", vec2(this.pos.x, this.pos.y + 2), 0.8, Colors.white, 0.1, Colors.black)
    }

    public render() {
        this.renderWindowBase(this.lights ? Colors.lightsOn : Colors.dark_grey, 1.5, 0.1)
    }

    // TODO: fix multiple collisions
    public collideWithObject(object: EngineObject): boolean {
        if (object instanceof Cat && object.velocity.y < 0 && !this.timeout && !this.timeoutSet) {
            this.timeoutSet = true

            setTimeout(() => {
                this.lights = true
                new Sound([1.1,,100,.01,.4,.01,2,3.1,43,,-108,.37,,,.4,,,.6,,.03]).play(this.pos, EFFECT_VOL); // Blip 8

                if (object.groundObject === this && !this.timeout) {
                    object.damage()
                    this.timeout = true
                    object.velocity.y = 0.3 // Scared!
                }
                setTimeout(() => {
                    this.lights = false
                    this.timeout = false
                    this.timeoutSet = false
                }, 5000)
            }, rand(1000, 2000))
            return true
        } else if (object instanceof Cat) {
            return true
        }
        return false
    }

    public doesHavePlant(): boolean {
        return true;
    }
}

export class PentHouse extends WindowSillBase {

    constructor(pos: Vector2, size: Vector2, floor: number) {
        super(pos, size, floor);
    }

    protected renderWindowContents(): void {
        drawCircleSegment(
            worldToScreen(vec2(this.pos.x - 3.75, this.pos.y + 2.75)),
            45,
            0,
            Math.PI / 2,
            Colors.grey)
        drawCircleSegment(
            worldToScreen(vec2(this.pos.x + 3.75, this.pos.y + 2.75)),
            45,
            Math.PI / 2,
            Math.PI,
            Colors.grey)

        drawLine(
            vec2(this.pos.x - 3.75, this.pos.y + 1.5),
            vec2(this.pos.x + 3.75, this.pos.y + 1.5),
            0.1, Colors.white, false)

        drawLine(
            vec2(this.pos.x, this.pos.y + 2.75),
            vec2(this.pos.x, this.pos.y + 1.5),
            0.1, Colors.white, false);
    }

    public render(): void {

        this.renderWindowBase(Colors.lightsOn, 4.25, 0.1)

        drawText("Home, Sweet Home!",
            vec2(this.pos.x, this.pos.y + 3.5), 0.8, Colors.yellow,
            0.1, Colors.black,
            'center',
            fontDefault,
            undefined,
            mainContext);
    }

    public update(): void {
        super.update()
    }

    public doesHavePlant(): boolean {
        return false
    }
}
