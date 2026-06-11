import { min } from "./math";
import { audioContext } from "./zzfx";

const htmlBody = document.body;
const htmlCanvas = htmlBody.firstElementChild! as HTMLCanvasElement;
export const ctx = htmlCanvas.getContext("2d", { alpha: false })!;

export let pointerX = 0;
export let pointerY = 0;
export let pointerIsDown = 0;
export let pointerDown = 0;
export let pointerIsMouse = 0;
export let frameIndex = 0;
export let time = 0;
export let rawTime = 0;
export let dt = 0;
export let rawDeltaTime = 0;
let prevTime = 0;
export const SIZE = 320;
export let gameWidth = 0;
export let gameHeight = 0;
export let gameScale = 1;

export let timeScale = 1;
let gameSleepTimer = 0;

export let keyboardIsDown: Record<string, number> = {};
export let keyboardDown: Record<string, number> = {};
export let keyboardUp: Record<string, number> = {};

export const setGameTimeScale = (pauseFactor: number) =>
  (timeScale = pauseFactor);

export const initSystem = (
  unlockAudio = () => audioContext.state[0] == "s" && audioContext.resume(),
  resize = (
    _?: UIEvent,
    w: number = htmlBody.clientWidth,
    h: number = htmlBody.clientHeight,
    dpr: number = devicePixelRatio
  ) => {
    htmlCanvas.style.width = w + "px";
    htmlCanvas.style.height = h + "px";
    htmlCanvas.width = w *= dpr;
    htmlCanvas.height = h *= dpr;
    gameScale = min(w, h) / SIZE;
    gameWidth = w / gameScale;
    gameHeight = h / gameScale;
  }
) => {
  ctx.imageSmoothingEnabled = false;
  //ctx.imageSmoothingQuality = "low";
  document.onkeydown = (e, k = e.code) =>
    (keyboardDown[k] = keyboardIsDown[k] = 1);

  document.onkeyup = (e, k = e.code) => {
    unlockAudio();
    keyboardIsDown[k] = keyboardDown[k] = 0;
    keyboardUp[k] = 1;
  };

  htmlCanvas.onpointerdown = (
    p: PointerEvent,
    scale = min(htmlBody.clientWidth, htmlBody.clientHeight) / SIZE
  ) => {
    unlockAudio();
    if (p.isPrimary) {
      pointerX = p.x / scale;
      pointerY = p.y / scale;
      pointerIsDown = pointerDown = 1;
      pointerIsMouse = +(p.pointerType === "mouse");
    }
  };

  htmlCanvas.onpointermove = (
    p: PointerEvent,
    scale = min(htmlBody.clientWidth, htmlBody.clientHeight) / SIZE
  ) => {
    if (p.isPrimary) {
      pointerX = p.x / scale;
      pointerY = p.y / scale;
    }
  };

  htmlCanvas.onpointerup = (p) => {
    unlockAudio();
    if (p.isPrimary) {
      pointerIsDown = 0;
    }
  };
  onresize = resize;
  resize();
};

export const isAnyKeyDown = () =>
  pointerDown || Object.entries(keyboardDown).some(([, v]) => v);

export const beginFrame = (_t: number) => {
  // if (_t - rawTime < 1 / 60) return 1;
  prevTime = rawTime;
  rawTime = _t;
  rawDeltaTime = min(1 / 30, rawTime - prevTime);
  dt = gameSleepTimer > 0 ? 0.0005 : rawDeltaTime * timeScale;
  time += dt;
  ++frameIndex;
  ctx.reset();
  ctx.scale(gameScale, gameScale);
  gameSleepTimer -= rawDeltaTime;
};

export const sleepGame = (time: number) => (gameSleepTimer = time);

export const endFrame = () => {
  pointerDown = 0;
  keyboardDown = {};
  keyboardUp = {};
};
