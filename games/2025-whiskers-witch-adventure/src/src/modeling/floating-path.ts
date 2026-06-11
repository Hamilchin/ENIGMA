import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {materials} from "@/textures";
import {Mesh} from "@/engine/renderer/mesh";
import {cylinderSelector2} from "./building-blocks";

export function floatingPath() {
  return new MoldableCubeGeometry(4, 2, 20).texturePerSide(materials.brickWall)
      .merge(new MoldableCubeGeometry(20, 2, 4).texturePerSide(materials.brickWall).translate_(-8, 0, 12))
      .merge(new MoldableCubeGeometry(4, 2, 38).texturePerSide(materials.brickWall).translate_(-20, 0, 29))
      .merge(new MoldableCubeGeometry(18, 2, 4).texturePerSide(materials.brickWall).translate_(-13, 0, 50))
      .merge(new MoldableCubeGeometry(4, 2, 20).texturePerSide(materials.brickWall).translate_(-6, 0, 62))
      .merge(new MoldableCubeGeometry(4, 2, 4, 3, 1, 3).texturePerSide(materials.brickWall).selectBy(cylinderSelector2()).cylindrify(8).all_().translate_(-6, 0, 79.5))
      .rotate_(0, Math.PI / 2)

      // world position
      .translate_(133, 39, -220)

      .computeNormals()
      .done_();
}