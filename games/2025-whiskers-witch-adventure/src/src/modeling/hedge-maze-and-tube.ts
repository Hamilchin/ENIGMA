import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {Mesh} from "@/engine/renderer/mesh";
import {materials} from "@/textures";
import {Texture} from "@/engine/renderer/texture";
import {Material} from "@/engine/renderer/material";
import {makePlinth} from "@/modeling/world-geography";

export function tubify(innerRadius: number, outerRadius: number, height: number, texture: Material) {
  return new MoldableCubeGeometry(4, height, 40, 1, 1, 6).texturePerSide(texture).translate_(-20).spreadTextureCoords(20, 20)
    .merge(new MoldableCubeGeometry(38, height, 6.4, 6).texturePerSide(texture).translate_(1, 0, 16.8).spreadTextureCoords(20, 20))
    .merge(new MoldableCubeGeometry(38, height, 6.4, 6).texturePerSide(texture).translate_(1, 0, -16.8).spreadTextureCoords(20, 20))
    .selectBy(vertex => Math.abs(vertex.x) <= 19 && Math.abs(vertex.z) <= 19)
    .cylindrify(innerRadius)
    .invertSelection()
    .cylindrify(outerRadius)
    .all_()
    .done_();
}

export function rampSection(startingPoint: number, steepnessModifier: number, innerRadius: number, outerRadius: number) {
  const depth = 40;
  return new MoldableCubeGeometry(1, 1, depth, 1, 1, 6)
    .selectBy(vert => vert.y > 0)
    .modifyEachVertex(vert => vert.y = vert.z * steepnessModifier + (depth / 2) * steepnessModifier + startingPoint)
    .all_()
    .translate_(-10)
    .selectBy(vertex => Math.abs(vertex.x) <= 10)
    .cylindrify(innerRadius)
    .invertSelection()
    .cylindrify(outerRadius)
    .all_()
    .done_();
}

export function hedgeMazeAndTube() {
  return tubify(20, 25, 20, materials.shrubs)
    .merge(tubify(50, 55, 20, materials.shrubs).rotate_(0, Math.PI / 2))
    .merge(new MoldableCubeGeometry(6, 20, 26).texturePerSide(materials.shrubs).spreadTextureCoords().rotate_(0, Math.PI / -4).translate_(27, 0, -26))
    // World placement
    .rotate_(0, Math.PI/-4)
    .merge(makePlinth(20, 20, materials.brickWall).translate_(80, -10, 30))
    .translate_(-190, 10, 190)
    // End world placement



    .computeNormals()
    .done_();
}

export function tunnel() {
  return tubify(25, 35, 140, materials.shrubs).rotate_(Math.PI / 2, 0, Math.PI / -2)


      // World placement
      .rotate_(0, Math.PI / 1.9)
      .translate_(190, 50, -84)
      // End world placement

      .computeNormals().done_();
}