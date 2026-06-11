import { Vector2 } from "@/core/vector";
import { Box } from "@/model/common.model";

export class DialogTrigger {
    public hitbox: Box;
    public text: string;
    public triggered = false;

    constructor(position: Vector2, width: number, height: number, text: string) {
        this.hitbox = new Box(position, width, height);
        this.text = text;
    }
}
