import { Vector2 } from "@/core/vector";

export class Box {
    constructor(
        public position: Vector2 = new Vector2(),
        public width: number = 0,
        public height: number = 0,
        public active: boolean = true
        ) {}
}

export class Animations {
    constructor(
        public animationName: string,
        public props: AnimationProp
    ){
    }
    public isActive?: boolean = false;
    onComplete?(): void;
}

export class AnimationProp {
    constructor(
        public frameCount: number,
        public frameBuffer: number,
        public loop: boolean,
        public src: string,
        public image?: any
    ) {}
}

export class PatrolPoints {
    constructor(
        public pointA: Vector2,
        public pointB: Vector2
    ){}
}