import { gameHeight, gameWidth } from "../engine/graphics";
import { getStage } from "../engine/stage";
import { getHero } from "./hero";

export const updateCameraPosition = () => {
    const stage = getStage();
    const hero = getHero();

    stage.camera_.x = hero.position_.x - gameWidth / 2;
    stage.camera_.y = hero.position_.y - gameHeight / 2;
}