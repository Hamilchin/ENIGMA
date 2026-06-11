import { hasTouch } from "../utils/browser"
import { Vector2 } from "../utils/geom";
import { gameWidth, screenCanvas } from "./graphics";
import { touches } from "./input"

export const joystick = {
    moveId_: -1,

    move_: { x: 0, y: 0 },
    moveRadius_: 30,

    moveStickRadius_: 10,
    moveStick_: { x: 0, y: 0 },

    attackId_: -1,
    attack_: { x: 0, y: 0 },
    attackRadius_: 30,
}

const border = 20;
const delta = { x: 60, y: 60 };

export const updateJoystick = () => {
    if (!hasTouch) {
        return;
    }

    joystick.move_.x = delta.x;
    joystick.move_.y = screenCanvas.height - delta.y;

    joystick.attack_.x = screenCanvas.width - delta.x;
    joystick.attack_.y = screenCanvas.height - delta.y;

    if (joystick.moveId_ == -1) {
        joystick.moveStick_.x = joystick.move_.x;
        joystick.moveStick_.y = joystick.move_.y;

        for (const touchId in touches) {
            const touch = touches[touchId];
            if (touch.started_) {
                const distance = Vector2.distance_(joystick.move_, touch);
                if (distance < joystick.moveRadius_ + border) {
                    joystick.moveId_ = Number(touchId);

                    joystick.moveStick_.x = touch.x;
                    joystick.moveStick_.y = touch.y;
                    break;
                }
            }
            // console.log("touch", touchId, touches[touchId]);
        }
    } else {
        const touch = touches[joystick.moveId_];
        if (touch) {
            joystick.moveStick_.x = touch.x;
            joystick.moveStick_.y = touch.y;
        } else {
            joystick.moveId_ = -1;
        }
    }

    const direction = Vector2.subtract_(joystick.moveStick_, joystick.move_);
    const distance = Vector2.length_(direction);
    if (distance > joystick.moveRadius_) {
        Vector2.normalize_(direction);
        joystick.moveStick_.x = joystick.move_.x + direction.x * joystick.moveRadius_;
        joystick.moveStick_.y = joystick.move_.y + direction.y * joystick.moveRadius_;
    }

    if (joystick.attackId_ == -1) {
        for (const touchId in touches) {
            const touch = touches[touchId];
            if (touch.started_) {
                const distance = Vector2.distance_(joystick.attack_, touch);
                if (distance < joystick.attackRadius_ + border) {
                    joystick.attackId_ = Number(touchId);
                }
            }
        }
    } else {
        const touch = touches[joystick.attackId_];
        if (!touch) {
            joystick.attackId_ = -1;
        }
    }
}