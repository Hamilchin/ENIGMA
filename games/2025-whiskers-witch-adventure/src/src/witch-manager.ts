import {Mesh} from "@/engine/renderer/mesh";
import {Scene} from "@/engine/renderer/scene";
import {makeWitch} from "@/modeling/witch";
import {EnhancedDOMPoint} from "@/engine/enhanced-dom-point";
import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {materials} from "@/textures";
import {areSpheresOverlapping, Sphere} from "@/engine/physics/aabb";
import {OctreeNode, querySphere} from "@/engine/physics/octree";
import {ThirdPersonPlayer} from "@/core/third-person-player";
import {theBestDamnCatHolyShit2} from "@/sounds/cat-sounds";
import {playPop} from "@/sounds/bubble-pop";
import {
  particleRandomizeHorizontal,
  particles,
  particleSpreadRadius,
  randomNegativeOneOne,
} from "@/engine/particles";
import {playWitchEscapeSound} from "@/sounds/witch-magic";
import {controls} from "@/core/controls";

export class Witch {
  mesh: Mesh;
  collisionSphere: Sphere;
  orb: Mesh;
  octreeNodes: OctreeNode[] = [];

  constructor(mesh: Mesh) {
    this.mesh = mesh;
    this.collisionSphere = new Sphere(mesh.position.clone_(), 10);
    this.orb = new Mesh(new MoldableCubeGeometry(4, 4, 4, 4, 4, 4)
      // .spreadTextureCoords(15, 15)
      .spherify(8)
      // .translate_(mesh.position.x, mesh.position.y, mesh.position.z)
      // .spreadTextureCoords()
      .done_(), materials.witchBubble);

    this.orb.position.set(this.mesh.position)
  }
}

export class WitchManager {
  witches: Witch[] = [];
  sceneRef: Scene;

  constructor(sceneRef: Scene, octree: OctreeNode) {
    this.sceneRef = sceneRef;

    // 1 - Map start witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(112, 11.5, 152), new EnhancedDOMPoint(0, 54, 0))));

    // 2 - hedge maze witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-190, 6.5, 190), new EnhancedDOMPoint(0, 37))));

    // 3 - behind bridge witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-219, 6.5, 8), new EnhancedDOMPoint(0, 90))));

    // 4 - elevated path witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(212,46, -214), new EnhancedDOMPoint(0, -90))));

    // 5 - cave top witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(101, 63, 14.5), new EnhancedDOMPoint(0, 90))));

    // 6 - top of pipe witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(250, 91, -88.5), new EnhancedDOMPoint(0, -90))));

    // 7 - mountaintop witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-105, 194.5, -106.5), new EnhancedDOMPoint(0, -180))));

    // 8 - backside of mountain witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-237, 48, -172), new EnhancedDOMPoint(0, 180))))

    // 9 - floating platform
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-156, 168, 90), new EnhancedDOMPoint(0, -160))))

    // 10 - mountain platform
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-71, 103, -44), new EnhancedDOMPoint(0, 30))))

    // 11 - caged witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(20, 11, 235), new EnhancedDOMPoint(0, 180))))

    // 12 - jump to plinth from hedge maze witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(-107, 26, 222), new EnhancedDOMPoint(0, -125))))

    // 13 - inside cave witch
    this.witches.push(new Witch(makeWitch(new EnhancedDOMPoint(235, 12, 13), new EnhancedDOMPoint(0, 180))))

    this.sceneRef.add_(...this.witches.flatMap(witch => [witch.mesh]));
    this.sceneRef.transparentMeshes.push(...this.witches.map(witch => {
      witch.orb.geometry.bindGeometry();
      return witch.orb;
    }));

    this.witches.forEach(witch => {
      querySphere(octree, witch.collisionSphere, node => {
        if (!node.witches) {
          node.witches = [];
        }
        node.witches.push(witch);
        witch.octreeNodes.push(node);
      });
    });

    wico.textContent = `🧙‍♀️ 0 / 13`;
  }

  witchSavingTimer = 0;
  activeSavingWitch?: Witch;
  originalPlayerCameraPosition = new EnhancedDOMPoint();
  cameraPositionTarget = new EnhancedDOMPoint();
  starParticlePosition = new EnhancedDOMPoint();

  gameOverDarknessValue = 0.0;

  update(player: ThirdPersonPlayer) {
    this.witches.forEach(witch => {
      witch.orb.rotate_(0.005, 0.005, 0);
      // Animation
      witch.mesh.alpha += 0.03;
      if (witch.mesh.alpha >= 1) {
        witch.mesh.alpha = 0;
        witch.mesh.frameA = witch.mesh.frameA === 0 ? 1 : 0;
        witch.mesh.frameB = witch.mesh.frameB === 0 ? 1 : 0;
      }
    });

    if (this.activeSavingWitch) {
      player.isFrozen = true;
      player.velocity.x = 0; player.velocity.z = 0;
      this.witchSavingTimer++;
      player.camera.position.set(this.cameraPositionTarget)
      player.camera.lookAt(this.activeSavingWitch.mesh.position);

      if (this.witchSavingTimer === 10) {
        theBestDamnCatHolyShit2();
      }

      // BUBBLE POP
      if (this.witchSavingTimer === 80) {
        playPop();
        controls.gamepad?.vibrationActuator?.playEffect("dual-rumble", {
          startDelay: 0,
          duration: 80,
          weakMagnitude: 1,
          strongMagnitude: 1,
        });
        for (let i = 0; i < 30; i++) {
          particles.push({
            position: particleSpreadRadius(this.activeSavingWitch.mesh.position, 4),
            size: 50 + Math.random() * 30,
            life: 1.0,
            velocity: particleRandomizeHorizontal(0.4, 0.4),
            sizeModifier: -1,
            lifeModifier: 0.01,
            isAffectedByGravity: true,
            textureId: materials.bubbles.texture.id,
          });
        }
        this.sceneRef.transparentMeshes = this.sceneRef.transparentMeshes.filter(orb => orb !== this.activeSavingWitch!.orb);
      }

      // HEARTS
      if (this.witchSavingTimer === 90) {
        const pos = this.activeSavingWitch.mesh.position.clone_();
        pos.y += 3;
        for (let i = 0; i < 5; i++) {
          particles.push({
            position: particleSpreadRadius(pos, 1.5),
            size: 1 + Math.random(),
            life: 4,
            velocity: new EnhancedDOMPoint(randomNegativeOneOne() * 0.04, 0.04, randomNegativeOneOne() * 0.04),
            sizeModifier: 1,
            lifeModifier: 0.03,
            isAffectedByGravity: false,
            textureId: materials.heart.texture.id,
          });
        }
      }

      if (this.witchSavingTimer === 160) {
        playWitchEscapeSound();
      }

      if (this.witchSavingTimer > 160) {
        controls.gamepad?.vibrationActuator?.playEffect("dual-rumble", {
          startDelay: 0,
          duration: 20,
          weakMagnitude: (this.witchSavingTimer - 160) / 130,
          strongMagnitude: 0,
        });
      }

      // SPARKLES
      if (this.witchSavingTimer > 160 && this.witchSavingTimer < 200) {
          particles.push({
            position: this.starParticlePosition.clone_(),
            size: 40 + Math.random() * 10,
            life: 3.0,
            velocity: this.starParticlePosition.clone_(),
            sizeModifier: Math.random(),
            lifeModifier: Math.max(Math.abs(Math.random() * 2), 0.2),
            isAffectedByGravity: false,
            textureId: materials.sparkle.texture.id,
            modifierCallback(particle) {
              particle.position.x = this.velocity.x + Math.sin(particle.position.y * particle.sizeModifier) * 7;
              particle.position.z = this.velocity.z + Math.cos(particle.position.y * particle.sizeModifier) * 7;
              particle.position.y += 0.1 * particle.lifeModifier;
              particle.life -= 0.02;
              particle.size += this.lifeModifier;
            }
          });
      }

      if (this.witchSavingTimer > 220) {
        this.activeSavingWitch.mesh.scale_.x *= 0.75;
        this.activeSavingWitch.mesh.scale_.y *= 1.1;
        this.activeSavingWitch.mesh.scale_.z *= 0.75;
      }

      if (this.witchSavingTimer === 250) {
        this.witches = this.witches.filter(w => w !== this.activeSavingWitch);
        this.sceneRef.remove_(this.activeSavingWitch.mesh);
        this.activeSavingWitch.octreeNodes.forEach(node => node.witches = node.witches?.filter(w => w !== this.activeSavingWitch));
      }

      if (this.witchSavingTimer === 275) {
        this.activeSavingWitch = undefined;
        player.isFrozen = false;
        player.camera.position.set(this.originalPlayerCameraPosition);
        player.camera.lookAt(player.lookatTarget);
        this.witchSavingTimer = 0;
      }
      player.camera.updateWorldMatrix();
    } else {
      player.witchesToCheck.forEach(witch => {
        if (areSpheresOverlapping(witch.collisionSphere, player.collisionSphere)) {
          wico.classList.add('chn');
          setTimeout(() => wico.classList.remove('chn'), 250);
          wico.textContent = `🧙‍♀️ ${14 - this.witches.length} / 13`;
          this.originalPlayerCameraPosition = player.camera.position.clone_();
          this.cameraPositionTarget = new EnhancedDOMPoint().set(witch.mesh.worldMatrix.transformPoint(new EnhancedDOMPoint(0,0,15)));
          this.starParticlePosition = new EnhancedDOMPoint().set(witch.mesh.position);
          this.starParticlePosition.y -= 5;
          this.activeSavingWitch = witch;
        }
      });

      if (this.witches.length === 0) {
        msg.innerHTML = 'You Win!'
        tmpl.style.backgroundColor = `rgba(0, 0, 0, ${this.gameOverDarknessValue})`;
        this.gameOverDarknessValue += 0.003;

        if (this.gameOverDarknessValue > 0.9) {
          player.isFrozen = true;
        }
      }
    }
  }
}