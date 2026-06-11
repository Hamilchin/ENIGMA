import {MoldableCubeGeometry} from "@/engine/moldable-cube-geometry";
import {materials} from "@/textures";
import {Mesh} from "@/engine/renderer/mesh";
import {EnhancedDOMPoint} from "@/engine/enhanced-dom-point";
import {cylinderSelector2} from "@/modeling/building-blocks";

export function makeWitch(pos: EnhancedDOMPoint, rot: EnhancedDOMPoint) {
  const witchLimb = (flip?: boolean) => {
    return new MoldableCubeGeometry(2.5, 1, 1, 1, 3, 3)
      .cylindrify(0.5, 'x')
      .selectBy(vert => flip ? vert.x < 0 :vert.x > 0)
      .scale_(1, 0.5, 0.5)
      .all_()
      .texturePerSide(materials.witchClothes)
    // .merge(
    //     new MoldableCubeGeometry(1, 1, 1, 1, 3, 3)
    //         .cylindrify(0.4, 'x')
    //         .selectBy(vert => vert.x < 0)
    //         .scale_(0.5, 0.5, 0.5)
    //         .all_()
    //         .translate_(-1.5)
    //         .texturePerSide(materials.witchFace)
    // )
  }

  const makeWitch = (frame: number) => {
    return new MoldableCubeGeometry(2, 2, 2, 8, 8, 8)
      .texturePerSide(materials.witchSkin, materials.witchSkin, materials.witchSkin, materials.witchSkin, materials.witchFace, materials.witchSkin)
      .spherify(2)
      // Flatten eye area
      .selectBy(vert => vert.z > 1 && vert.y > 0)
      .translate_(0, 0.3, -0.2)
      .computeNormals(true)


      // hat
      .merge(
        new MoldableCubeGeometry(3, 3, 3, 3, 3, 3)
          .selectBy(cylinderSelector2(1.5))
          .cylindrify(2.5)
          .all_()
          .translate_(0, 1)
          .modifyEachVertex(vert => {
            const t = vert.y / 3; // normalize against height
            const inv = 1 - t;
            const scale = Math.pow(inv, 2.5);
            vert.x *= scale;
            vert.z *= scale;
            if (vert.y > 0) {
              vert.y -= 0.4;
            }
          })
          .translate_(0, 1.5)
          .texturePerSide(materials.witchHat)
          .computeNormals()

      )

      // hair
      .merge(
        new MoldableCubeGeometry(2, 4, 2, 2, 1, 2)
          .cylindrify(2)
          .selectBy(vert => vert.y < 0)
          .scale_(1.2, 1, 0.5)
          .translate_(0,0, -1.8)
          .all_()
          .translate_(0, -1, 0)
          .texturePerSide(materials.iron)
          .computeNormals(true)

      )

      // body
      .merge(
        new MoldableCubeGeometry(3, 5, 3, 3, 3, 3)
          .cylindrify(2.2)
          .translate_(0, 1)
          .modifyEachVertex(vert => {
            const t = vert.y / 5; // normalize against height
            const inv = 1 - t;
            const scale = Math.pow(inv, 1.5);
            vert.x *= scale;
            vert.z *= scale;
            if (vert.y > 0) {
              vert.y -= 0.5;
            }
          })
          .translate_(0, -4.5)
          .texturePerSide(materials.witchClothes)
          .computeNormals()

      )

      // arms
      .merge(
        witchLimb()
          .rotate_(0, 0, -0.3)
          .translate_(-1.5, -2, 0)
          .merge(witchLimb(true).rotate_(0, 0, 0.3).translate_(1.5, -2))
          .selectBy(vert => Math.abs(vert.x) > 2)
          .translate_(0, (frame - 0.5))
          .computeNormals(true)

      )


      .selectBy(vert => vert.y > -4)
      .rotate_(0,0,(frame - 0.5) * 0.3)
      // .all_()
      .done_();
  }

  const body = makeWitch(0);
  const frame2 = makeWitch(1)
  body.addFrame(1, frame2.vertices);

  const mesh = new Mesh(body, materials.whichSkin);
  mesh.position.set(pos);
  mesh.rotation_.set(rot);
  return mesh;
}
