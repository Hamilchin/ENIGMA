class Button {
    constructor(text, x, y, width, height, options = {}) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fontSize = options.fontSize || 24;
        this.bgColor = options.bgColor || '#ddd';
        this.textColor = options.textColor || '#000';
        this.shadowColor = options.shadowColor || '#888';
        this.isPressed = false;
        this.isHovered = false;
    }

    isPointInside(mouseX, mouseY) {
        return mouseX >= this.x - this.width / 2 && mouseX <= this.x + this.width / 2 &&
            mouseY >= this.y - this.height / 2 && mouseY <= this.y + this.height / 2;
    }

    onMouseDown(mouseX, mouseY) {
        if (this.isPointInside(mouseX, mouseY)) {
            this.isPressed = true;
            return true;
        }
        return false;
    }

    onMouseUp(mouseX, mouseY) {
        const wasPressed = this.isPressed;
        this.isPressed = false;
        return wasPressed && this.isPointInside(mouseX, mouseY);
    }

    onMouseMove(mouseX, mouseY) {
        this.isHovered = this.isPointInside(mouseX, mouseY);
        return this.isHovered;
    }

    draw(ctx) {
        const offsetX = this.isPressed ? 0 : -2;
        const offsetY = this.isPressed ? 0 : -2;

        if (!this.isPressed) {
            ctx.fillStyle = this.shadowColor;
            ctx.beginPath();
            ctx.roundRect(this.x - this.width / 2 + 2, this.y - this.height / 2 + 2, this.width, this.height, 8);
            ctx.fill();
        }

        // background colour flash and 'depth' change
        ctx.fillStyle = this.isPressed ? '#bbb' : this.bgColor;
        ctx.beginPath();
        ctx.roundRect(this.x - this.width / 2 + offsetX, this.y - this.height / 2 + offsetY, this.width, this.height, 8);
        ctx.fill();

        // border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.x - this.width / 2 + offsetX, this.y - this.height / 2 + offsetY, this.width, this.height, 8);
        ctx.stroke();

        ctx.fillStyle = this.textColor;
        ctx.font = this.fontSize + 'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x + offsetX, this.y + offsetY + 8);
    }

}