import { Mesh } from '@/engine/renderer/mesh';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import {materials} from "@/textures";

export function makeJackOLantern() {
  const makeBody = (frame: number) => new MoldableCubeGeometry(4, 4, 4, 4, 4, 4)
    .texturePerSide(materials.pumpkin,materials.jackolanternFace)
      .spherify(4)
      .merge(
        new MoldableCubeGeometry(1, 2, 1, 2, 2, 2)
          .texturePerSide(materials.cartoonGrass)
          .cylindrify(0.5)
          .selectBy(vert => vert.y < 0)
          .scale_(2, 1, 2)
          .all_()
          .translate_(0, 4.5)
      )
    .rotate_(0, Math.PI / 2)
      .scale_(1, 1 - frame, 1)
    .computeNormals(true)
    .translate_(0, frame > 0 ? 3 : 4)
    .done_();

  const body = makeBody(0.2);
  body.addFrame(1, makeBody(0).vertices);

  return new Mesh(body, materials.white);
}