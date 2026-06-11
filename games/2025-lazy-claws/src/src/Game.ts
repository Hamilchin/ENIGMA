import { Control } from "./Control";
import { Events } from "./Events";
import { Panel } from "./Panel";
import { Player } from "./Player";
import { Renderer } from "./Renderer";
import type { Resource } from "./Resource";
import { Scene } from "./Scene";
import { getScene0 } from "./scenes/intro";
import { getGameOverScene } from "./scenes/gameover";
import { getLevel0} from "./scenes/level0";
import { getLevel1 } from "./scenes/level1";
import { getLevel2 } from "./scenes/level2";
import { getNextLevel } from "./scenes/nextLevel";
import { Sound } from "./Sound";
import type { Sprite } from "./Sprite";
import { Vec } from "./Vector";
import { getGameWinScene } from "./scenes/win";

export class Game {
    scenes: Record<string, () => Scene> = {};
    resources: Record<string, Resource> = {};
    sprites: Record<string, Sprite> = {};
    emitter = new Events();
    control: Control;
    renderer: Renderer;
    player?: Player;
    sound = new Sound();
    panel?: Panel;
    startTime = 0;
    spentTime = 0;
    scene: Scene;
    s = 'intro';

    sceneOrder: string[] = [
        'intro',
        'nextlevel0',
        'level0',
        'nextlevel1',
        'level1',
        'nextlevel2',
        'level2',
        'win',
    ];

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.control = new Control(canvas, this.emitter);

        this.scene = new Scene(() => {}, false);
    }

    load() {
        return Promise.all(Object.values(this.resources).map(r => r.load()));
    }

    get order() {
        return this.sceneOrder.indexOf(this.s);
    }

    nextScene() {
        if (this.order === -1) {
            return;
        }

        const nextIndex = this.order + 1;

        if (nextIndex >= this.sceneOrder.length) {
            return;
        }

        this.setScene(this.sceneOrder[nextIndex]);
    }

    init() {
        this.player = new Player(new Vec(384, 288), this);
        this.player.init();
        this.control.init();
        this.panel = new Panel(this);

        this.scenes = {
            'intro': () => getScene0(this),

            'level0': () => getLevel0(this),
            'level1': () => getLevel1(this),
            'level2': () => getLevel2(this),

            'nextlevel0': () => getNextLevel(this, 1, 1),
            'nextlevel1': () => getNextLevel(this, 3, 2),
            'nextlevel2': () => getNextLevel(this, 5, 3),

            'gameover': () => getGameOverScene(this),
            'win': () => getGameWinScene(this),
        };

        this.setScene(this.s);

        this.emitter.on('space', () => {
            const scene = this.scene;

            if (!scene) {
                return;
            }

            if (!scene.interactive) {
                this.nextScene();
            }
        });

        return Promise.resolve();
    }

    setScene(scene: string) {
        this.s = scene;
        this.scene = this.scenes[this.s]() ;
        this.scene.game = this;
        this.renderer.scene = this.scene;

        if (this.scene.interactive) {
            this.startTime = Date.now();
        }
    }
}