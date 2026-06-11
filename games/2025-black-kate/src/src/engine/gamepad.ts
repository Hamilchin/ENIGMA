import { Vector2 } from "../utils/geom";
import { mathAbs } from "../utils/math";
import { setAnyKey } from "./input";

export const gamepadData = {
    axe_: { x: 0, y: 0 },
    button_: false,
}

const enum GamepadKey {
    Up = 12,
    Down = 13,
    Left = 14,
    Right = 15,
    Action0 = 0,
    Action1 = 1,
    Action2 = 2,
    Action3 = 3,
}

let pressed = false;

export const updateGamepad = () => {
    if ('getGamepads' in navigator) {
        gamepadData.axe_.x = 0;
        gamepadData.axe_.y = 0;
        gamepadData.button_ = false;

        const gamepads = navigator.getGamepads();

        let pressedNow = false;

        for (const gamepad of gamepads) {
            if (gamepad && gamepad.connected) {
                if (gamepad.axes.length >= 2) {
                    gamepadData.axe_.x += gamepad.axes[0];
                    gamepadData.axe_.y += gamepad.axes[1];
                }

                if (gamepad.axes.length >= 4) {
                    gamepadData.axe_.x += gamepad.axes[2];
                    gamepadData.axe_.y += gamepad.axes[3];
                }

                for (let i = 0; i < gamepad.buttons.length; i++) {
                    const button = gamepad.buttons[i];

                    if (button.pressed) {
                        pressedNow = true;
                        switch (i) {
                            case GamepadKey.Up:
                                gamepadData.axe_.y -= 1;
                                break;

                            case GamepadKey.Down:
                                gamepadData.axe_.y += 1;
                                break;

                            case GamepadKey.Left:
                                gamepadData.axe_.x -= 1;
                                break;

                            case GamepadKey.Right:
                                gamepadData.axe_.x += 1;
                                break;

                            case GamepadKey.Action0:
                            case GamepadKey.Action1:
                            case GamepadKey.Action2:
                            case GamepadKey.Action3:
                                gamepadData.button_ = true;
                                break;
                        }
                    }
                }
            }
        }

        if (mathAbs(gamepadData.axe_.x) < 0.2) {
            gamepadData.axe_.x = 0;
        }

        if (mathAbs(gamepadData.axe_.y) < 0.2) {
            gamepadData.axe_.y = 0;
        }

        Vector2.normalize_(gamepadData.axe_);

        if (pressed != pressedNow) {
            pressed = pressedNow;
            setAnyKey(pressed);
        }
    }
}