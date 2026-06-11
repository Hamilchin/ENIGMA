import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {cylinderSelector2} from "./building-blocks";
import {Mesh} from "@/engine/renderer/mesh";
import {materials} from "@/textures";

export function rampToJump() {
  return new MoldableCubeGeometry(4,6,4,6,1,6).texturePerSide(materials.brickWall).selectBy(cylinderSelector2).cylindrify(14).all_().translate_(5, 3, 40)
      .merge(new MoldableCubeGeometry(4,18,4,6,1,6).texturePerSide(materials.brickWall).cylindrify(8).all_().translate_(7, 9))
      .merge(new MoldableCubeGeometry(12, 20, 12, 4, 1, 6).texturePerSide(materials.brickWall)
        .selectBy(vert => vert.x <= -4)
        .cylindrify(6, 'y', { x: 1, y: 0, z: 0})
        .selectBy(vert => vert.x >= 4)
        .cylindrify(8, 'y', { x: -3, y: 0, z: 0})
        .selectBy(vert => vert.x > -2)
        .translate_(30, 5)
        .selectBy(vert => vert.x > 30)
        .translate_(30, 10)
        .rotate_(0, -0.4)
        .scale_(1.2, 1, 1.2)
        .selectBy(vert => vert.y < 10)
        .modifyEachVertex(vert => vert.y = -14)
        .all_()
        .translate_(18, 14, 0)
        .spreadTextureCoords()
        .done_())

      .merge(new MoldableCubeGeometry(4, 44, 4, 6, 1, 6).texturePerSide(materials.brickWall).selectBy(cylinderSelector2()).cylindrify(8).all_().translate_(80, 18, 50).done_())
      .merge(new MoldableCubeGeometry(4, 52, 4, 6, 1, 6).texturePerSide(materials.brickWall).selectBy(cylinderSelector2()).cylindrify(8).all_().translate_(60, 26, 45).done_())

      // world positioning
      .rotate_(0, Math.PI)
      .translate_(240, 0, 52)
      .computeNormals()

      .done_();
}