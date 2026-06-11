import {drawRect, drawText, type Vector2} from "littlejsengine";
import {Colors} from "./utils.ts";

export class Button {
    private text: string;
    private pos: Vector2
    private size: Vector2
    private hovered: boolean

    constructor(label: string, pos: Vector2, size: Vector2) {
        this.text = label;
        this.pos = pos
        this.size = size
        this.hovered = false
    }

    public draw() {
        drawRect(this.pos, this.size, this.hovered ? Colors.yellow : Colors.white, 0, false);
        drawText(this.text, this.pos, 1.5, Colors.black)
    }

    public isClicked(mousePos: Vector2, mousePressed: boolean) {
        this.hovered = mousePos.x >= this.pos.x - this.size.x/2 && mousePos.x <= this.pos.x + this.size.x/2 &&
            mousePos.y >= this.pos.y - this.size.y/2 && mousePos.y <= this.pos.y + this.size.y/2;
        return this.hovered && mousePressed;
    }

}