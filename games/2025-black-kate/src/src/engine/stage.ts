import { images } from "../resources/images";
import { Box2, Vector2 } from "../utils/geom";
import { entities, Entity } from "./entity";
import { gameHeight, gameWidth } from "./graphics";
import { Item } from "./item";
import { Sprite } from "./sprite";

export interface Stage {
    bounds_: Box2,
    back_: Sprite,
    camera_: Vector2,
    items_: Array<Item>,
}

let stage: Stage | undefined;

export const getStage = () => stage!;

export const setStage = (value: Stage) => {
    stage = value;

    for (const item of stage.items_) {
        item.sprite_.x = item.position_.x - item.offset_.x;
        item.sprite_.y = item.position_.y - item.offset_.y;

        if (item.shadow_) {
            item.shadow_.x = item.position_.x - item.offset_.x;
            item.shadow_.y = item.position_.y - item.offset_.y * item.shadow_.scaleY_!;
        }

        entities.push(item);
    }
}

export const limitCamera = () => {
    const stage = getStage();
    const back = images[stage.back_.image_];

    if (- stage.camera_.x > 0) {
        stage.camera_.x = 0;
    }

    if (-stage.camera_.x + back.width < gameWidth) {
        stage.camera_.x = back.width - gameWidth;
    }

    if (- stage.camera_.y > 0) {
        stage.camera_.y = 0;
    }

    if (-stage.camera_.y + back.height < gameHeight) {
        stage.camera_.y = back.height - gameHeight;
    }
}