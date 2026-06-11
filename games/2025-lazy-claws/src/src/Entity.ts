import { Vec } from "./Vector";

export class Entity {
    p: Vec;
    vs: Vec[];
    color: string;

    constructor(p: Vec, vs: Vec[], params: {
        color: string
    } = {
            color: '#000'
        }) {
        this.p = p;
        this.vs = vs;
        this.color = params.color;
    }

    static line(position: Vec, p1: Vec, p2: Vec) {
        return new Entity(position, [p1, p2]);
    }

    static square(position: Vec, size: number) {
        const h = (size / 2) | 0;

        return new Entity(position, [
            new Vec(-h, -h),
            new Vec(h, -h),
            new Vec(h, h),
            new Vec(-h, h)
        ]);
    }

    static polygon(position: Vec, points: [number, number][], color: string = '#fff') {
        return new Entity(position, points.map(([x, y]) => new Vec(x, y)), { color });
    }

    private *gen(): Generator<[Vec, Vec], void, unknown> {
        for (let i = 1; i < this.vs.length; i++) {
            yield [
                this.vs[i - 1].add(this.p),
                this.vs[i].add(this.p)
            ];
        }

        yield [
            this.vs[this.vs.length - 1].add(this.p),
            this.vs[0].add(this.p)
        ];
    }

    get lines() {
        return [...this.gen()];
    }

    rotate(V: Vec) {
        const angle = Math.atan2(V.y, V.x);

        for (let i = 0; i < this.vs.length; i++) {
            this.vs[i] = this.vs[i].rotate(angle);
        }
    }

    move(V: Vec) {
        this.p = this.p.add(V);
    }

    static lineIntersect(V: Vec, line: [Vec, Vec], tolerance: number): boolean {
        const [a, b] = line;
        const ab = b.sub(a);
        const ap = V.sub(a);
        const abLengthSquared = ab.dot(ab);

        if (abLengthSquared === 0) {
            return V.sub(a).len() <= tolerance;
        }

        const t = ap.dot(ab) / abLengthSquared;
        const clamped = Math.max(0, Math.min(1, t));
        const closest = a.add(ab.scale(clamped));
        const dist = V.sub(closest).len();

        return dist <= tolerance;
    }

    intersect(V: Vec, tolerance = 0): [Vec, Vec] | null {
        for (const line of this.lines) {
            if (Entity.lineIntersect(V, line, tolerance)) {
                return line;
            }
        }

        return null;
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.setLineDash([]);
        context.strokeStyle = this.color;
        context.lineWidth = 1;

        const first = this.vs[0].add(this.p);

        context.moveTo(first.x, first.y);

        for (let i = 0; i < this.vs.length; i++) {
            const V = this.vs[i].add(this.p);
            context.lineTo(V.x, V.y);
        }

        context.lineTo(first.x, first.y);
        context.stroke();
    }

    update(_delta: number) { }
}