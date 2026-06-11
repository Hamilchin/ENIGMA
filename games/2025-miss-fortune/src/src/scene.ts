import {
    Color,
    time,
    tile,
    drawTile,
    vec2,
    setCameraScale, Timer, setCameraPos, drawText, fontDefault, drawLine,
    drawRect, mainContext, worldToScreen, engineObjects, RandomGenerator, mousePos, mouseWasPressed, overlayContext,
    mouseWasReleased
} from "littlejsengine";
import {drawGradientCircle} from "./draw.ts";
import {Cat, Ground, PentHouse} from "./sprites.ts";
import {EndlessBuilding, IntroBuilding} from "./buildings.ts";
import {Colors} from "./utils.ts";
import {Button} from "./button.ts";

// Base class for all scenes
export abstract class Scene {
    protected nextScene: Scene | undefined;

    public abstract update(): void

    public abstract draw(): void

    public abstract drawOverlay(): void;

    public abstract getNextScene(): Scene

    public abstract isFinished(): boolean

    public abstract clean(): void;
}

let seed = 1;

export class IntroScene extends Scene {

    private catImg: HTMLImageElement = new Image(8, 8);
    private offsetY: number;
    protected finished: boolean;
    protected nextScene: Scene | undefined;

    private playerIntroButton: Button
    private playerEndlessButton: Button
    private seedUpButton: Button
    private seedDownButton: Button

    public constructor() {
        super();
        this.catImg.src = "./black_cat.png";
        // this.fontImg.src = "./Quirk.png";
        this.offsetY = 0
        this.finished = false

        this.playerIntroButton = new Button("Play Intro Level", vec2(0, 0), vec2(14, 2))
        this.playerEndlessButton = new Button("Play Endless Mode", vec2(0, -3), vec2(14, 2))
        this.seedUpButton = new Button(">", vec2(5, -6), vec2(2, 2))
        this.seedDownButton = new Button("<", vec2(-5, -6), vec2(2, 2))

        this.nextScene = undefined;

        // this.font = new FontImage(this.fontImg, vec2(16, 16), vec2(0, 0));

        /*        this.rain = new ParticleEmitter(vec2(6, 14), (5/4) * Math.PI, vec2(24,1), 0, 150, 0, tile(3, 16),
                    new Color(0.57, 0.72, 0.82, 0.75),
                    new Color(0.57, 0.72, 0.82, 0.75),
                    new Color(0.77, 0.88, 0.96, 0.5),
                    new Color(0.77, 0.88, 0.96, 0.5),
                    2, 0.15, 0.1, 0.25, 0.05, 1, 1, 1, 3.14, 0.1, 0.25, false, false);

                this.rain.renderOrder = 3*/

        // setCameraScale(50)
    }

    public update(): void {
        this.offsetY = Math.sin(time)

        if (this.playerIntroButton.isClicked(mousePos, mouseWasPressed(0))) {
            this.finished = true;
            this.nextScene = new TutorialGameScene()
        } else if (this.playerEndlessButton.isClicked(mousePos, mouseWasPressed(0))) {
            this.finished = true;
            this.nextScene = new EndlessGameScene()
        } else if (this.seedDownButton.isClicked(mousePos, mouseWasPressed(0))) {
            seed--;
            if (seed < 1) {
                seed = 1;
            }
        } else if (this.seedUpButton.isClicked(mousePos, mouseWasPressed(0))) {
            seed++
        }
    }

    public draw(): void {
        drawGradientCircle(vec2(0, -this.offsetY + 6), 4, new Color(0, 0, 0, 0.5), Colors.white, 30);
        drawTile(vec2(0, -this.offsetY + 6), vec2(5, 5), tile(0, 16));
    }

    public drawOverlay() {

        // const font = new FontImage(this.fontImg, vec2(16, 16), vec2(0, 0));
        drawText("Miss\nFortune", vec2(0, 13), 3, Colors.yellow);

        this.playerIntroButton.draw()
        this.playerEndlessButton.draw()

        drawText(`Seed: ${seed}`, vec2(0, -6), 1.5, Colors.white)

        this.seedUpButton.draw()
        this.seedDownButton.draw()

        drawText(`Change "seed" or randomize game`, vec2(0, -9), 1.2, Colors.white)
    }

    public getNextScene(): Scene {
        return this.nextScene || new TutorialGameScene();
    }

    public isFinished(): boolean {
        return this.finished;
    }

    public clean(): void {
    }
}


export abstract class GameScene extends Scene {

    protected cat: Cat;
    protected countDown: Timer;
    protected cameraOffset: number;
    protected catReached: boolean;
    protected finished: boolean;
    protected dying: boolean;

    protected constructor() {
        super()

        this.cat = new Cat(vec2(0, -7.5));
        this.countDown = new Timer(5);
        this.cameraOffset = 0
        this.catReached = false;
        this.nextScene = undefined;
        this.finished = false;
        this.dying = false;

        new Ground(vec2(0, -8.5), vec2(16, 0.5));

        setCameraScale(50)
    }

    public update() {

        const catPos = worldToScreen(this.cat.pos)
        const boundary = 1180;

        // If ground the cat is on disappears off the bottom of the screen, it should die
        const ground = this.cat.getLastGround()
        const groundPos = ground ? worldToScreen(ground.pos) : vec2(0, 0)

        // End the scene if the cat goes off the bottom of the screen
        if (catPos.y > boundary && groundPos.y > boundary) {
            this.cat.damage(true)
            this.finished = true;
        } else if (catPos.y > boundary && this.cat.getLives() > 0) {
            this.cat.damage()
            if (this.cat.getLives() > 0) {
                this.cat.respawn()
            }
        }
    }

    public draw() {
        drawRect(vec2(0, 2 + this.cameraOffset), vec2(14, 23), Colors.building, 0, false);

        // Draw building outline
        drawLine(vec2(-7, -8.5), vec2(-7, 13 + this.cameraOffset), 0.1, Colors.white, false)
        drawLine(vec2(7, -8.5), vec2(7, 13 + this.cameraOffset), 0.1, Colors.white, false)

        this.drawDoor()

        // const font = new FontImage(this.fontImg, vec2(16, 16), vec2(0, 0));
        drawText("Locked out again!",
            vec2(0, -1.5), 0.8, Colors.yellow,
            0.1, new Color(0, 0, 0, 1),
            'center',
            fontDefault,
            undefined,
            mainContext);

        drawText("I'll need to double jump\njust to reach these windows...",
            vec2(0, 4.5), 0.8, Colors.yellow,
            0.1, new Color(0, 0, 0, 1),
            'center',
            fontDefault,
            undefined,
            mainContext);
    }

    protected drawDoor(): void {
        drawRect(vec2(0, -5.75), vec2(4, -5.5), Colors.brown, 0, false)
        drawLine(vec2(-2, -3), vec2(2, -3), 0.1, Colors.white, false)
        drawLine(vec2(0, -8.5), vec2(0, -3), 0.1, Colors.white, false)
        drawLine(vec2(2, -8.5), vec2(2, -3), 0.1, Colors.white, false)
        drawLine(vec2(-2, -8.5), vec2(-2, -3), 0.1, Colors.white, false)

        drawLine(vec2(0.5, -5), vec2(0.5, -6), 0.1, Colors.yellow, false)
        drawLine(vec2(-0.5, -5), vec2(-0.5, -6), 0.1, Colors.yellow, false)
    }

    public isFinished(): boolean {
        return this.finished
    }

    public clean(): void {
        engineObjects.forEach(e => e.destroy())
        setCameraScale(35)
    }
}

export class TutorialGameScene extends GameScene {

    private building: IntroBuilding

    public constructor() {
        super();

        this.building = new IntroBuilding(new RandomGenerator(seed));

        /*
                this.rain = new ParticleEmitter(vec2(6, 14), (5/4) * Math.PI, vec2(24,1), 0, 150, 0, tile(3, 16),
                    new Color(0.57, 0.72, 0.82, 0.75),
                    new Color(0.57, 0.72, 0.82, 0.75),
                    new Color(0.77, 0.88, 0.96, 0.5),
                    new Color(0.77, 0.88, 0.96, 0.5),
                    2, 0.15, 0.1, 0.25, 0.05, 1, 1, 1, 3.14, 0.1, 0.25, false, false, true);

                this.rain.renderOrder = 3*/
    }

    public update(): void {
        super.update()

        const catPosY = this.cat.pos.y
        if (catPosY > 7 && !this.catReached) {
            this.catReached = true
        }

        if (this.countDown.elapsed() && this.catReached) {
            if (this.cameraOffset >= 70) {
                // Dont progresses camera if at "top"
            } else if (catPosY - this.cameraOffset >= 7) {
                this.cameraOffset = catPosY - 7
            } else {
                this.cameraOffset += 0.01
            }
            setCameraPos(vec2(0, this.cameraOffset))
        } else if (this.catReached) {
            this.countDown.set(0)
        }

        if (this.cat.getLives() <= 0 && !this.dying) {
            this.dying = true
            this.cat.setFlashing()
            setTimeout(() => {
                this.finished = true;
            }, 1000)
        }

        if (this.cat.groundObject instanceof PentHouse) {
            setTimeout(() => this.finished = true, 1000)
        }
    }

    public drawOverlay(): void {
        drawRect(vec2(0, -11 + this.cameraOffset), vec2(15, 3.5), Colors.white, 0, true);

        drawRect(vec2(0, -11 + this.cameraOffset), vec2(13.5, 3), Colors.black, 0, true);

        drawText("Smashables: " + this.cat.getScore() + "/" + this.building.getPlantCount(),
            vec2(0, -10.5 + this.cameraOffset),
            0.8, Colors.yellow,
            0.2, new Color(0, 0, 0, 1),
            'center',
            fontDefault,
            undefined,
            overlayContext);

        drawText("Lives: " + this.cat.getLives(),
            vec2(0, -11.5 + this.cameraOffset),
            0.8, Colors.yellow,
            0.2, new Color(0, 0, 0, 1),
            'center',
            fontDefault,
            undefined,
            overlayContext);
    }

    public draw(): void {
        super.draw()

        drawText("And if I time it right,\nI can reach the penthouse!",
            vec2(0, 10.5), 0.8, Colors.yellow,
            0.1, new Color(0, 0, 0, 1),
            'center',
            fontDefault,
            undefined,
            mainContext);
    }

    public getNextScene(): Scene {
        return new EndScene(false, seed, this.cat.getScore(), this.cat.getFloorsClimbed())
    }

}

export class EndlessGameScene extends GameScene {

    private building: EndlessBuilding;
    private randomGenerator: RandomGenerator;

    constructor() {
        super();

        this.randomGenerator = new RandomGenerator(seed);

        this.building = new EndlessBuilding(this.randomGenerator);

        for (let i = 0; i < 5; i++) {
            this.building.addLevel();
        }

        setCameraScale(50)
    }

    public update(): void {

        if (this.cat.pos.y + 25 > this.building.currentHeight()) {
            this.building.addLevel();
        }

        super.update()

        const catPosY = this.cat.pos.y
        if (catPosY > 7 && !this.catReached) {
            this.catReached = true
        }

        if (this.countDown.elapsed() && this.catReached) {
            if (catPosY - this.cameraOffset >= 7) {
                this.cameraOffset = catPosY - 7
            } else {
                this.cameraOffset += 0.01
            }
            setCameraPos(vec2(0, this.cameraOffset))
        } else if (this.catReached) {
            this.countDown.set(0)
        }

        if (this.cat.getLives() <= 0) {
            this.finished = true;
        }
    }

    public draw(): void {
        super.draw()

        drawText("This building is huge!\nHow high can I climb?",
            vec2(0, 10.5), 0.8, Colors.yellow,
            0.1, new Color(0, 0, 0, 1),
            'center',
            fontDefault,
            undefined,
            mainContext);
    }

    public drawOverlay(): void {
        drawRect(vec2(0, -11 + this.cameraOffset), vec2(15, 3.5), Colors.white, 0, true);

        drawRect(vec2(0, -11 + this.cameraOffset), vec2(13.5, 3), Colors.black, 0, true);

        drawText("Smashables: " + this.cat.getScore(),
            vec2(0, -10.5 + this.cameraOffset),
            0.8, Colors.yellow,
            0.2, Colors.black,
            'center',
            fontDefault,
            undefined,
            overlayContext);

        drawText("Lives: " + this.cat.getLives(),
            vec2(0, -11.5 + this.cameraOffset),
            0.8, Colors.yellow,
            0.2, Colors.black,
            'center',
            fontDefault,
            undefined,
            overlayContext);
    }

    public getNextScene(): Scene {
        return new EndScene(true, seed, this.cat.getScore(), this.cat.getFloorsClimbed())
    }

    public isFinished(): boolean {
        return this.finished
    }

    public clean(): void {
        engineObjects.forEach(e => e.destroy())
        setCameraScale(35)
    }
}

export class EndScene extends Scene {

    protected finished: boolean;
    private restartButton: Button;
    private mainMenuButton: Button;
    private readonly endless: boolean;
    private readonly smashed: number;
    private readonly floor: number;
    private readonly seed: number;

    constructor(endless: boolean = false, seed:number, smashed: number = 0, floor: number = 0) {
        super();

        this.finished = false
        this.endless = endless;
        this.smashed = smashed;
        this.floor = floor;
        this.seed = seed;

        this.restartButton = new Button("Restart", vec2(0, -2), vec2(14, 2));
        this.mainMenuButton = new Button("Main Menu", vec2(0, -5), vec2(14, 2));

        this.nextScene = undefined
    }

    public draw(): void {
        drawText("Game Over!",
            vec2(0, 8), 2.4, Colors.yellow,
            0.1, Colors.black,
            'center');

        drawText(`Seed: ${this.seed}\n\nSmashed: ${this.smashed} things\n\nFloors Climbed: ${this.floor}`,
            vec2(0, 3), 1.2, Colors.yellow,
            0.1, Colors.black,
            'center');

        this.restartButton.draw()
        this.mainMenuButton.draw()
    }

    public drawOverlay(): void {
    }

    public getNextScene(): Scene {
        return this.nextScene || new IntroScene();
    }

    public isFinished(): boolean {
        return this.finished;
    }

    public update(): void {
        if (this.restartButton.isClicked(mousePos, mouseWasReleased(0))) {
            this.nextScene = this.endless ? new EndlessGameScene() : new TutorialGameScene()
            this.finished = true;
        } else if (this.mainMenuButton.isClicked(mousePos, mouseWasReleased(0))) {
            this.nextScene = new IntroScene()
            this.finished = true;
        }
    }

    public clean(): void {
    }

}
