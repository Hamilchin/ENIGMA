import { CollisionBlock } from "@/classes/CollisionBlock";
import { drawEngine } from "./draw-engine";
import { BASE_TILE_SIZE } from "@/constans/game-contstans";
import { Box } from "@/model/common.model";
import { Vector2 } from "./vector";

export class Engine {

    public static parseTo2DArray(array: Array<number>, mapWidth: number = 20) {
        const rows = [];
        for (let i = 0; i < array.length; i += mapWidth) {
            rows.push(array.slice(i, i + mapWidth));
        }

        return rows;
    }

    public static createArrayFrom2D(array: Array<Array<number>>, symbolKey: any, tileSize: number = BASE_TILE_SIZE) {
        const objects: Array<any> = [];
        array.forEach((row: any, yIndex: any) => {
            row.forEach((symbol: any, xIndex: any) => {
                if (symbol == symbolKey) {
                    let position: Vector2 = new Vector2(0, 0);
                    // Push new collision into new collision block array.
                    position.x = xIndex * tileSize;
                    position.y = yIndex * tileSize;
                    objects.push(
                        new CollisionBlock(position)
                    )
                }
            });
        });

        return objects;
    }

    public static debugBox(gameObject: any, color: string) {
        drawEngine.context.strokeStyle = color;
        drawEngine.context.lineWidth = 1;
        drawEngine.context.beginPath();
        drawEngine.context.rect(gameObject.position.x, gameObject.position.y, gameObject.width, gameObject.height);
        drawEngine.context.stroke();
    }

    public static lerp(start: number, end: number, speed: number) {
        return start + (end - start) * speed;
    }

    public static clamp(value: number, min: number, max: number) {
        return Math.max(min, Math.min(value, max));
    }

    public static collisions(objectA: Box, objectB: Box) {
        return (objectA.position.x <= objectB.position.x + objectB.width &&
            objectA.position.x + objectA.width >= objectB.position.x &&
            objectA.position.y + objectA.height >= objectB.position.y &&
            objectA.position.y <= objectB.position.y + objectB.height);
    }

    public static fadeIn(element: any, duration: number, onComplete?: () => void) {
        let startTime: number | null = null;
    
        function animate(timestamp: number) {
            if (!startTime) startTime = timestamp;
    
            const elapsed = timestamp - startTime;
            const opacity = Math.min(1, elapsed / duration);
    
            element.style.opacity = opacity.toString();
    
            if (opacity < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) {
                    onComplete();
                }
            }
        }
    
        requestAnimationFrame(animate);
    }

    public static fadeOut(element: any, duration: number, onComplete?: () => void) {
        let startTime: number | null = null;

        function animate(timestamp: number) {
            if (!startTime) startTime = timestamp;

            const elapsed = timestamp - startTime;
            const opacity = 1 - Math.min(1, elapsed / duration);

            element.style.opacity = opacity.toString();

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) {
                    onComplete();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    public static ticker(interval: number, repeat = true) {
        let tickerInterval = interval
        const obj = {
            ticks: 0,
            tick: (dt: number) => {
                if ((obj.ticks += dt) > tickerInterval) {
                    if (repeat) obj.ticks = 0
                    return true
                } else {
                    return false
                }
            },
            reset: () => {
                obj.ticks = 0
            },
            clear: () => {
                tickerInterval = interval
                obj.reset()
            },
            interval: (val: number) => {
                tickerInterval = val
                obj.reset()
            },
        }
        return obj
    }


}


