import { GameObject } from "@/core/model/gameObject";

export class CollisionController {
  static isColliding(a: GameObject, b: GameObject): boolean {
    if (!a || !b) return false;
    return (
      a.x < b.x + (b.width || 0) &&
      a.x + (a.width || 0) > b.x &&
      a.y < b.y + (b.height || 0) &&
      a.y + (a.height || 0) > b.y
    );
  }

  static checkAll(
    objects: GameObject[],
    targets: GameObject[],
    callback: (a: GameObject, b: GameObject) => void
  ) {
    for (let i = objects.length - 1; i >= 0; i--) {
      const a = objects[i];
      if (!a.active) continue;

      for (let j = targets.length - 1; j >= 0; j--) {
        const b = targets[j];
        if (!b.active) continue;

        if (CollisionController.isColliding(a, b)) {
          callback(a, b);
          break; // stop checking this bullet against other enemies
        }
      }
    }
  }
}
