import { Vector2 } from "../utils/geom";
import { Sprite } from "./sprite";

export interface Entity {
    sprite_: Sprite,
    position_: Vector2
}

export const entities: Array<Entity> = [];

export const removeEntity = (entity: Entity) => {
    const index = entities.indexOf(entity);
    if (index != -1) {
        entities.splice(index, 1);
    }
}

export const clearEntities = () => {
    entities.splice(0, entities.length);
}