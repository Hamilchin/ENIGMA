import {Mesh} from "@/engine/renderer/mesh";
import {Sphere} from "@/engine/physics/aabb";
import {OctreeNode, querySphere} from "@/engine/physics/octree";
import {makeJackOLantern} from "@/modeling/jack-o-lantern";
import {ThirdPersonPlayer} from "@/core/third-person-player";
import {Scene} from "@/engine/renderer/scene";
import {EnhancedDOMPoint} from "@/engine/enhanced-dom-point";
import {particles, randomNegativeOneOne} from "@/engine/particles";
import { materials } from "@/textures";
import {playPumpkinSquashSound} from "@/sounds/pumpkin-squash.sound";
import {theBestDamnCatHolyShit2} from "@/sounds/cat-sounds";
import {controls} from "@/core/controls";

export class Enemy {
  mesh = makeJackOLantern();
  collisionSphere = new Sphere(this.mesh.position.clone_(), 4);
  collisionDistance = new EnhancedDOMPoint();
  path: EnhancedDOMPoint[] = [];
  pathIndex = 0;
  direction = 1;
  currentTarget = new EnhancedDOMPoint();
  rotationTarget = 0;

  constructor(path: EnhancedDOMPoint[]) {
    this.path = path;
    this.mesh.alpha = Math.random();
    this.mesh.position.set(path[0])
    this.collisionSphere.center.set(this.mesh.position);
    this.collisionSphere.center.y += 1.5;
  }

  lerpAngle(a: number, b: number, t: number): number {
    let diff = (b - a + Math.PI) % (2 * Math.PI) - Math.PI;
    return a + diff * t;
  }

  update() {
    // Animation
    this.mesh.alpha += 0.03;
    if (this.mesh.alpha >= 1) {
      this.mesh.alpha = 0;
      this.mesh.frameA = this.mesh.frameA === 0 ? 1 : 0;
      this.mesh.frameB = this.mesh.frameB === 0 ? 1 : 0;
    }

    // Path following
    const target = this.path[this.pathIndex];
    this.currentTarget.subtractVectors(target, this.mesh.position);
    const distSq = this.currentTarget.dot(this.currentTarget);
    // const dx = target.x - this.mesh.position.x;
    // const dy = target.y - this.mesh.position.y;
    // const dz = target.z - this.mesh.position.z;
    // const distSq = dx*dx + dy*dy + dz*dz;

    if (distSq < 0.03) { // reached point
      this.pathIndex += this.direction;
      if (this.pathIndex >= this.path.length) {
        this.pathIndex = this.path.length - 2;
        this.direction = -1;
      } else if (this.pathIndex < 0) {
        this.pathIndex = 1;
        this.direction = 1;
      }
      return; // wait until next update to move toward new target
    }

    const dist = Math.sqrt(distSq);
    const step = 0.15;
    this.mesh.position.x += this.currentTarget.x / dist * step;
    this.mesh.position.y += this.currentTarget.y / dist * step;
    this.mesh.position.z += this.currentTarget.z / dist * step;
    this.collisionSphere.center.set(this.mesh.position);
    this.collisionSphere.center.y += 1.5;
    this.rotationTarget = this.lerpAngle(this.rotationTarget, Math.atan2(this.currentTarget.x, this.currentTarget.z), 0.1);
    this.mesh.setRotation_(0, this.rotationTarget, 0);
  }
}

export class EnemyManager {
  sceneRef: Scene;
  enemies: Enemy[];

  constructor(sceneRef: Scene) {
    this.enemies = [
      // first enemy
      new Enemy([new EnhancedDOMPoint(-20, 0, 197), new EnhancedDOMPoint(60, 0, 197)]),

      // hedge maze enemy
      new Enemy([new EnhancedDOMPoint(-211, 0, 220), new EnhancedDOMPoint(-230, 0, 194) , new EnhancedDOMPoint(-217, 0, 166)]),

      // bridge enemy
      new Enemy([
        new EnhancedDOMPoint(-190, 43, -7),
        new EnhancedDOMPoint(-190, 46, 11),
        new EnhancedDOMPoint(-190, 40, 33)]),

      // lower mountain path enemy
      new Enemy([
        new EnhancedDOMPoint(-29, 67, -105),
        new EnhancedDOMPoint(-45, 61, -65),
        new EnhancedDOMPoint(-70, 52, -43)]),

      // mountain lower top enemy
      new Enemy([
        new EnhancedDOMPoint(-193, 116, -106),
        new EnhancedDOMPoint(-174, 119, -80),
        new EnhancedDOMPoint(-143, 122, -61)]),

      // pipe enemy
      new Enemy([
        new EnhancedDOMPoint(223, 29.5, -93),
        new EnhancedDOMPoint(122, 29.5, -83)]),

      // pipe enemy 2
      new Enemy([
        new EnhancedDOMPoint(122, 29.5, -71),
        new EnhancedDOMPoint(223, 29.5, -81),
        ]),

      // behind mountain enemy
      new Enemy([
        new EnhancedDOMPoint(-98, 41, -243),
        new EnhancedDOMPoint(-198, 42, -230)
      ]),

      // under floating path enemy
      new Enemy([
        new EnhancedDOMPoint(139, 0, -215),
        new EnhancedDOMPoint(222, 0, -215)
      ]),
    ];
    this.sceneRef = sceneRef;
    this.sceneRef.add_(...this.enemies.flatMap(enemy => enemy.mesh));
    plhe.textContent = new Array(9).fill('🖤').join('')
  }

  update(player: ThirdPersonPlayer) {
    this.enemies.forEach(enemy => {
      enemy.update();
      enemy.collisionDistance.subtractVectors(player.collisionSphere.center, enemy.collisionSphere.center);
      if (enemy.collisionDistance.dot(enemy.collisionDistance) < 36) { // enemy radius + player radius squared
        playPumpkinSquashSound();
        this.sceneRef.remove_(enemy.mesh);
        this.enemies = this.enemies.filter(toRemove => toRemove !== enemy);
        for (let i = 0; i < 30; i++) {
          particles.push({
            position: enemy.collisionSphere.center.clone_(),
            size: Math.random() * 80,
            life: 5.0,
            velocity: new EnhancedDOMPoint(randomNegativeOneOne() * 0.25, 0.5 + Math.random() * 0.5, randomNegativeOneOne() * 0.25),
            sizeModifier: 0.1,
            lifeModifier: 0.03,
            isAffectedByGravity: true,
            textureId: materials.splat.texture.id,
          });
        }
        if (enemy.collisionSphere.center.y + 2 >= player.collisionSphere.center.y) {
          controls.gamepad?.vibrationActuator?.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 300,
            weakMagnitude: 1.0,
            strongMagnitude: 1.0,
          });
          player.health--;
          player.isTakingHit = true;
          player.isFrozen = true;
          theBestDamnCatHolyShit2(true);
          plhe.classList.add('chn');
          setTimeout(() => {
            player.isTakingHit = false;
            player.isFrozen = false;
            player.velocity.x *= -0.1;
            player.velocity.z *= -0.1;
            plhe.classList.remove('chn');
          }, 500);
          player.velocity.x *= -0.1;
          player.velocity.z *= -0.1;
          plhe.textContent = new Array(player.health).fill('🖤').join('');
        } else {
          player.velocity.y = 0.5;
          controls.gamepad?.vibrationActuator?.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 120,
            weakMagnitude: 0.2,
            strongMagnitude: 0.9,
          });
        }
      }
    })
  }
}