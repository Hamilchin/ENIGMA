import {Color, drawCircle, mainContext, Vector2} from "littlejsengine";

export function drawGradientCircle(center: Vector2, radius: number, colorStart: Color, colorEnd: Color, steps: number = 20) {
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const r = radius * (1 - t);
        // Linear interpolation for color
        const color = new Color(
            colorStart.r * (1 - t) + colorEnd.r * t,
            colorStart.g * (1 - t) + colorEnd.g * t,
            colorStart.b * (1 - t) + colorEnd.b * t,
            colorStart.a * (1 - t) + colorEnd.a * t
        );
        drawCircle(center, r, color);
    }
}

export function drawCircleSegment(
    center: Vector2,
    radius: number,
    startAngle: number,
    endAngle: number,
    color: Color,
    fill: boolean = true,
    ctx: CanvasRenderingContext2D = mainContext,
) {
    ctx.save();
    ctx.beginPath();
    // ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    ctx.ellipse(center.x, center.y, radius, radius + 10, 0, startAngle, endAngle);
    ctx.lineTo(center.x, center.y);
    ctx.closePath();
    ctx[fill ? 'fillStyle' : 'strokeStyle'] = color.toString();
    fill ? ctx.fill() : ctx.stroke();
    ctx.restore();
}