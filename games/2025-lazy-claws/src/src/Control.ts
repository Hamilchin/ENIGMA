import type { Events } from "./Events";

export class Control {
    private canvas: HTMLCanvasElement;
    private emitter: Events;

    state: Map<string, boolean> = new Map();
    x: number = 0;
    y: number = 0;

    constructor(canvas: HTMLCanvasElement, emitter: Events) {
        this.canvas = canvas;
        this.emitter = emitter;
    }

    onKeyDown = (event: KeyboardEvent) => {
        this.state.set(event.code, true);

        if (event.key === ' ') {
            this.emitter.emit('space');
        }
    }

    onKeyUp = (event: KeyboardEvent) => {
        this.state.set(event.code, false);
    }

    onMouseMove = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();

        this.x = e.clientX - rect.left;
        this.y = e.clientY - rect.top;
    }

    onMouseDown = (e: MouseEvent) => {
        if (e.button === 0) {
            this.emitter.emit('mouseDownLeft');
        } else if (e.button === 2) {
            this.emitter.emit('mouseDownRight');
        }
    }

    onMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
            this.emitter.emit('mouseUpLeft');
        } else if (e.button === 2) {
            this.emitter.emit('mouseUpRight');
        }
    }

    onContextMenu = (event: Event) => {
        event.preventDefault();
    }

    init() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('contextmenu', this.onContextMenu);

        this.canvas.addEventListener('mousemove', this.onMouseMove);
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('contextmenu', this.onContextMenu);

        this.canvas.removeEventListener('mousemove', this.onMouseMove);
    }
}