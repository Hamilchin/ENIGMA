import { BASE_TRANSITION_ANIMATION_TIME } from "../config";
import { drawEngine } from "./DrawController";

// Minified to save space
class ScreenTransitionController {
  a = 0;
  e = 0;
  d = 1;
  f = 0;
  s = 0;
  g = 0;
  c?: () => void;

  start(from: number, to: number, dur: number, onDone?: () => void) {
    this.s = from;
    this.g = to;
    this.a = from;
    this.d = dur;
    this.e = 0;
    this.f = 1;
    this.c = onDone;
  }

  update(dt: number) {
    if (!this.f) return;
    this.e += dt;
    let t = Math.min(this.e / this.d, 1);
    this.a = this.s + (this.g - this.s) * t;
    if (t >= 1) {
      this.f = 0;
      this.c?.();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.f && this.a <= 0) return;
    // Flip meaning: 1 = clear, 0 = black
    ctx.fillStyle = `rgba(0,0,0,${(1 - this.a) * 0.8})`;
    ctx.fillRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
  }

  get active() {
    return this.f === 1;
  }

  fadeOutThenIn(callback: () => void) {
    if (!screenTransitions.active) {
      this.start(1, 0, BASE_TRANSITION_ANIMATION_TIME, () => {
        callback();
        screenTransitions.start(0, 1, BASE_TRANSITION_ANIMATION_TIME);
      });
    }
  }
}

export const screenTransitions = new ScreenTransitionController();
