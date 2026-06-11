import { Box2, Vector2 } from "../utils/geom";
import { mathMin } from "../utils/math";
import { Entity } from "./entity";
import { Sprite } from "./sprite";
import { getStage } from "./stage";
import { units } from "./unit";

export interface Item extends Entity {
    offset_: Vector2,
    bounds_: Box2,
    shadow_?: Sprite,
}

export const collisionItems = () => {
    const stage = getStage();

    for (const unit of units) {
        for (const item of stage.items_) {
            if (item.bounds_.w == 0 && item.bounds_.h == 0) {
                continue;
            }

            let minX = item.position_.x + item.bounds_.x;
            let minY = item.position_.y + item.bounds_.y;

            let maxX = minX + item.bounds_.w;
            let maxY = minY + item.bounds_.h;

            const left = unit.position_.x - minX;
            const top = unit.position_.y - minY;
            const right = maxX - unit.position_.x;
            const bottom = maxY - unit.position_.y;

            if (left > 0 && top > 0 && right > 0 && bottom > 0) {
                const min = mathMin(left, top, right, bottom);

                if (left == min) {
                    unit.position_.x -= left;
                }

                if (top == min) {
                    unit.position_.y -= top;
                }

                if (right == min) {
                    unit.position_.x += right;
                }

                if (bottom == min) {
                    unit.position_.y += bottom;
                }
            }
        }
    }
}