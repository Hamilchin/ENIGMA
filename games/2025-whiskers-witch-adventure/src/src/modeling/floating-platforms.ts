import {materials} from "@/textures";
import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {cylinderSelector2} from "./building-blocks";
import {geoTexPerSide} from "./world-geography";

export const platformMaker = (rad: number) => new MoldableCubeGeometry(4, rad/2, 4, 6, 1, 6).texturePerSide(materials.brickWall)
  .selectBy(cylinderSelector2()).cylindrify(rad)
  .selectBy(vert => vert.y < 0).scale_(0, 1, 0).all_()

export function floatingPlatforms() {
  return platformMaker(8).texturePerSide(...geoTexPerSide()).spreadTextureCoords()
      .merge(platformMaker(20).texturePerSide(...geoTexPerSide()).translate_(30, 8, 18).spreadTextureCoords())
      .merge(platformMaker(12).texturePerSide(...geoTexPerSide()).translate_(68, 19, 40).spreadTextureCoords())
      .merge(platformMaker(10).texturePerSide(...geoTexPerSide()).translate_(95, 30, 32).spreadTextureCoords())
      .merge(platformMaker(28).texturePerSide(...geoTexPerSide()).translate_(140, 35, 50).spreadTextureCoords())
      .all_()

      // World placement
    .rotate_(0, -1)
      .translate_(-190, 120, -60)
      // End world placement
      .computeNormals()
      .done_();
}