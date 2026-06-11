import { screenCanvas, screenOffset, screenScale } from "./graphics";
import { unlockAudio } from "../resources/sound/audio";
import { domDocument, dpr } from "../utils/browser";
import { vector2, Vector2 } from "../utils/geom";
import { HeroInputType, heroInputType, setHeroInputType } from "../game/hero";

export interface TouchData {
    x: number,
    y: number,
    started_: boolean
}

export const touches: { [key: string]: TouchData } = {};

const keys: { [key: string]: boolean } = {};
export let anyKey = false;

export const setAnyKey = (value: boolean) => anyKey = value;

export const initInput = () => {
    domDocument.onkeydown = (e) => {
        // console.log(e.keyCode);
        unlockAudio();
        anyKey = true;
        keys[e.keyCode] = true;
        e.preventDefault();
    }

    domDocument.onkeyup = (e) => {
        anyKey = false;
        unpressKey(e.keyCode);
        e.preventDefault();
    }

    screenCanvas.onmousedown = (e) => {
        anyKey = true;
        unlockAudio();
        e.preventDefault();
    }

    screenCanvas.onmousemove = (e) => {
        e.preventDefault();
    }

    screenCanvas.onmouseup = (e) => {
        anyKey = false;
        e.preventDefault();
    }

    const forTouch = (e: TouchEvent, handler: (id: number, t: TouchData) => void) => {
        const changedTouches = e.changedTouches;
        for (let i = 0; i < changedTouches.length; i++) {
            const { clientX, clientY, identifier } = changedTouches[i];
            handler(
                identifier,
                {
                    x: clientX / screenScale,
                    y: clientY / screenScale,
                    started_: false,
                }
            );
        }
        e.preventDefault();
    };

    screenCanvas.ontouchstart = (e) => {
        anyKey = true;
        setHeroInputType(HeroInputType.TouchJoystick);
        forTouch(e, (id, t) => { touches[id] = t; t.started_ = true; });
    };

    screenCanvas.ontouchmove = (e) => {
        forTouch(e, (id, t) => { touches[id] = t; });
    };

    screenCanvas.ontouchend = (e) => {
        anyKey = false;
        forTouch(e, (id, t) => { delete touches[id]; });
    };

    screenCanvas.ontouchcancel = (e) => {
        forTouch(e, (id, t) => { delete touches[id]; });
    };
}

export const enum Key {
    Up = 38,
    Down = 40,
    Left = 37,
    Right = 39,
    A = 65,
    D = 68,
    W = 87,
    S = 83,
    Z = 90,
    X = 88,
    U = 85,
    I = 73,
    J = 74,
    K = 75,
    Enter = 13,
    Space = 32,
}

export const isKeyPressed = (code: Key): boolean | undefined => keys[code];
export const unpressKey = (code: Key) => delete keys[code];