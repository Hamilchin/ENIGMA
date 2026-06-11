export class Vector2 {
    // Properties with type annotations
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    // Methods with type annotations and return type
    public add(other: Vector2): this { // 'this' return type allows for method chaining
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    public multiply(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): this {
        const mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    public distance(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }


    public set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    public clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public static subtract(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    // Static getters for common vectors
    public static get zero(): Vector2 {
        return new Vector2(0, 0);
    }

    public static get right(): Vector2 {
        return new Vector2(1, 0);
    }

    public static get left(): Vector2 {
        return new Vector2(-1, 0);
    }

    public static get up(): Vector2 {
        return new Vector2(0, 1);
    }

    public static get down(): Vector2 {
        return new Vector2(0, -1);
    }
}
