import {State} from '@/core/state';
import {Scene} from '@/engine/renderer/scene';
import {Camera} from '@/engine/renderer/camera';
import {meshToFaces} from '@/engine/physics/parse-faces';
import {render} from '@/engine/renderer/renderer';
import {OctreeNode} from "@/engine/physics/octree";
import {ThirdPersonPlayer} from "@/core/third-person-player";

import {WitchManager} from "@/witch-manager";
import {playSong} from "@/sounds/song";
import {makeWorld} from "@/modeling/full-world";
import {makeFloor} from "@/modeling/world-geography";
import {EnemyManager} from "@/enemy-manager";

export class GameState implements State {
  player: ThirdPersonPlayer;
  scene: Scene;


  witchManager: WitchManager;
  enemyManager: EnemyManager;

  constructor() {
    this.scene = new Scene();
    //this.player = new FreeCam(new Camera(Math.PI / 3, 16 / 9, 1, 500));

    this.player = new ThirdPersonPlayer(new Camera(Math.PI / 2.5, 16 / 9, 1, 700));


    this.scene.add_(this.player.mesh, makeFloor(), makeWorld());
    const faces = meshToFaces([makeFloor(), makeWorld()]);

    faces.forEach(face => this.octree.insert(face));

    this.witchManager = new WitchManager(this.scene, this.octree);
    this.enemyManager = new EnemyManager(this.scene);

    playSong();
    setInterval(playSong, 14_200);
  }


  // TODO: remember to update this from the computed octree when level design finished
  octree = new OctreeNode({
    max: {x: 276, y: 190.31, z: 257, w: 1},
    min: { x: -260, y: -7, z: -267 }
  }, 0);

  onUpdate() {
    this.player.update(this.octree);
    this.enemyManager.update(this.player);
    this.witchManager.update(this.player);
    this.scene.updateWorldMatrix();
    render(this.player.camera, this.scene);
  }
}
