import { drawEngine } from "@/core/draw-engine";
import { Vector2 } from "@/core/vector";

class Images {
    // public position: Vector2;
    constructor() {

    }


    public getFireBallSprite(position: Vector2, angle: number) {
        const palette = "282328c56981a3a29ac56981" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "@@@@@@@@@@@@@@@@@@@@@@@@@@@@II@@@@@IRRI@@@IRZ[[A@IRZ[[[KIRZ[[[[KIRZ[[[[K@IRZ[[[K@@IRZ[[A@@@IRRI@@@@@II@@@@@@@@@@@@@@@@@@@@@@@@@@" // pixel decoding
        this.renderImage2(palette, imageString, 16,16,  position, angle);
    }

    public getCatBulletSprite(position: Vector2) {
        const palette = "282328c56981a3a29ac56981" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "HIHRJQRIRJHI@" // pixel decoding
        this.renderImage2(palette, imageString, 5,5, position);
    }

    public getBlackCatBulletSprite(position: Vector2) {
        const palette = "282328c56981" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "HIHRJQRIRJHI@" // pixel decoding
        this.renderImage2(palette, imageString, 5,5, position);
    }

    public getWoodBlockSprite(position: Vector2) {
        const palette = "282328545c7ec56981a3a29a" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "IIIIIIIIQcdddd\\JQRRRRRRJaTTdTTbLQTbbdbbJQRRRRRRJaddddddLaddddddLQRRRRRRJIRdTdTRIaTbdbTbLaTTdTdbLQTbbdbbJIRRRRRRIYK[[[[YKIIIIIIII" // pixel decoding
        this.renderImage2(palette, imageString, 16,16, position);
    }

    public getStoneBlockSprite(position: Vector2) {
        const palette = "282328a3a29a545c7ec56981" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "@@IIII@@@IRZRZI@HRZSRZSAQR[YS[YJQ[IJYKJKIIRRJQRIQRSRRSRKQRZRRSZKYZ[SRZ[IY[K[[QIJI[QIIRRKQIRRRSRKaSSRZSZLa\\YSZYcLHdLdLddA@IIIIII@" // pixel decoding
        this.renderImage2(palette, imageString, 16,16, position);
    }

    public getOldMouseSprite(position: Vector2) {
        const palette = "282328a3a29ac56981545c7e" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@IA@HIA@@@@@@@@@HRK@QRJ@@@@@@@@@QRZIR[SA@@@@@@@@QRdRZ[[A@@@@@@@@QbRRZd[A@@@@@@@@HTRRRd[A@@@@@@@@HRRRb\\K@@@@@@@@@HQJQIJA@@@@@@@@@HJQJQJ@@@@@@@@@@HQaLRL@@@@@@@@@@aTJQbL@@@@@@@@@@IRRbTJ@@@@@@@@@@HQRTRJI@@@@@@@@@QbdRTIJ@@@@@@@@@QTRRTTI@@@@@@@@@aRRbRLA@@@@@@@@@HbJaRL@@@@@@@@@@HIIIIA@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"; // pixel decoding
        this.renderImage2(palette, imageString, 32,32, position);
    }

    public getAbilityCheeseSprite(position: Vector2) {
        const palette = "282328a3a29ac56981545c7e" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "@@@@@@@@@@@@@@@@@@@@@@@@@@@@HI@@@@@HQZA@@@@Q[RK@@@IZZRK@@HRZSRZAHQSRR[ZAQRRRR[ZAY[R[[RZAY[[SZ[[AYZ[SZS[AIIY[[[[A@@HII[[A@@@@@IIA"; // pixel decoding
        this.renderImage2(palette, imageString, 16,16, position);
    }

    public getBlockTileSprite(position: Vector2) {
        const palette = "282328545c7ea3a29ac56981" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "IJIJcY[YdYcYJJLIY[Y[YcYS\\dZRYLYI"; // pixel decoding
        this.renderImage2(palette, imageString, 8,8, position);
    }

    public getHeartSprite(position: Vector2) {
        const palette = "a3a29a282328c56981c56981" // color palette (you can remove the colors you didn't use to save bytes)
        const imageString = "@@@@@@@@@@@@@@@@@@I@HA@@@HRAQJ@@@Q[JZSA@HZIS[[J@HZY[[[J@HZ[[[[J@@Q[[[SA@@HZ[[J@@@@Q[SA@@@@HZJ@@@@@@QA@@@@@@H@@@@@@@@@@@@@@@@@@@@"; // pixel decoding
        this.renderImage2(palette, imageString, 16,16, position);
    }

    private renderImage2(
        palette: string,
        imageString: string,
        width: number,
        height: number,
        position: Vector2,
        angle: number = 0,
        flipX: boolean = false,
        flipY: boolean = false
    ) {
        const c = drawEngine.context;
        const C = palette; // color palette
        const P: number[] = [];

        // Decode pixel data
        imageString.replace(/./g, (a: string) => {
            const z = a.charCodeAt(0);
            P.push(z & 7);
            P.push((z >> 3) & 7);
            return a;
        });

        // const S = imgageSize;

        // ---- handle transform ----
        c.save();

        // Move origin to center of the image
        c.translate(position.x + width / 2, position.y + height / 2);

        // Apply rotation
        c.rotate(angle);

        // Apply flipping
        c.scale(flipX ? -1 : 1, flipY ? -1 : 1);

        // Draw pixels relative to new origin
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                if (P[j * width + i]) {
                    c.fillStyle = `#${C.substring(6 * (P[j * width + i] - 1), 6 * (P[j * width + i] - 1) + 6)}`;
                    c.fillRect(i - width / 2, j - height / 2, 1, 1);
                }
            }
        }

        c.restore();
    }

}

export const images = new Images();