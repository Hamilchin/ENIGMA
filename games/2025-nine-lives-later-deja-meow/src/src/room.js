import * as drawing from './drawings.js'
import { collides, bounce, C, fw, fwd, dst } from './util.js';



export const createRoom = ({
    rects = [],
    doors = "",
    x = 0,
    y = 0,
    w = 640,
    h = 400,
    bw = 16

} = {}) => {
    const D = 80;


    const R = rects.slice()

    const d = doors.toLowerCase()
    R.push(fw(0, 0, w, bw));
    R.push(fw(0, 0, bw, h));
    R.push(fw(0, h - bw, w, bw));
    R.push(fw(w - bw, 0, w, h));

    if (d.includes("n")) R.push(fwd((w - D) >> 1, 0, D, bw, 'n', { dt: doors.includes("N") }))
    if (d.includes("s")) R.push(fwd((w - D) >> 1, h - bw, D, bw, 's', { dt: doors.includes("S") }))
    if (d.includes("w")) R.push(fwd(0, (h - D) >> 1, bw, D, 'w', { dt: doors.includes("W") }))
    if (d.includes("e")) R.push(fwd(w - bw, (h - D) >> 1, bw, D, 'e', { dt: doors.includes("E") }))



    const collisions = R;

    const update = (dt) => {

        for (let i = collisions.length; i--;) {
            let b = collisions[i];

            if (b.dx || b.dy) {

                if (b.tim) {
                    b.tim -= dt
                    if (b.tim < 0) b.tim = 0
                    continue;
                }

                let nx = b.x + b.dx * (dt / 16)
                let ny = b.y + b.dy * (dt / 16)

                for (let j = collisions.length; j--;) {
                    if (i === j) continue;

                    if (b.justB) b.justBDT += dt;
                    if (b.justB && b.justBDT > 3000) {
                        b.justB = false
                    }

                    if (collides({ x: nx, y: ny, w: b.w, h: b.h, c: b.c, m: b.m }, collisions[j])) {

                        b.x = nx;
                        b.y = ny;

                        if (!b.justB) {
                            bounce(b, collisions[j])
                        }

                        // fallback for last collision handling ^^
                        if (b.x < 10 || b.y < 10 || b.x > 630 || b.y > 390) {
                            b.x = 30
                            b.y = 30
                            b.dx = 1
                            b.dy = 1
                        }

                    } else {
                        b.x = nx
                        b.y = ny
                    }
                }
            } else if (b.mv && dt) {

                b.mv.o = (b.mv.o + dt) % (b.mv.t * 2);
                let f = b.mv.o / b.mv.t;
                if (f > 1) f = 2 - f;
                b.x = b.mv.x + b.mv.dx * f;
                b.y = b.mv.y + b.mv.dy * f;
            }

            if (b.mfd) {
                if (b.e === 'm') collisions.push({ x: b.x, y: b.y, w: b.w, h: b.h, t: "c", c: C.I, m: C.P })
                collisions.splice(i, 1);
            }
        }
    };

    function drawWrap(c, x, y, s, w) {
        const l = parseInt(c.font) || 16;

        s.split('\n').forEach(p => {
            let a = p.split(' '), ln = '';
            for (let i = 0; i < a.length; i++) {
                let t = ln + (ln ? ' ' : '') + a[i];
                if (c.measureText(t).width > w && ln) {
                    c.fillText(ln, x, y); y += l; ln = a[i];
                } else ln = t;
            }
            c.fillText(ln, x, y); y += l;
        });

    }



    const r = {
        e: (c, o) => (dst(c, o.e === "d" ? "🐶" : "🐭", o)),
        x: (c, o) => o.a && (c.fillStyle = "#3337", c.strokeRect(o.x, o.y, o.w, o.h), c.fillRect(o.x, o.y, o.w, o.h), c.fillStyle = "#333", c.fillText("☠️", o.x + o.w / 2, o.y + o.h / 2)),
        c: (c, o) => c.fillText("🧀", o.x + o.w / 2, o.y + o.h / 2),
        w: (c, o) => (c.fillStyle = o.m & C.B ? "#333" : "rgba(195, 235, 255, 0.9)", c.fillRect(o.x, o.y, o.w, o.h)),
        d: (c, o) => (c.globalAlpha = o.alpha ?? 1, c.fillStyle = o.dt ? "#b29a39" : '#556CC9', c.fillRect(o.x, o.y, o.w, o.h), c.globalAlpha = 1, o.dt && (c.save(), c.font = "14px monospace", c.fillText("🧀", o.x + o.w / 2, o.y + o.h / 2), c.restore())),
        o: (c, o) => (c.fillStyle = "#6cf", c.fillRect(o.x, o.y, o.w, o.h)),
        t: (c, o) => (c.fillStyle = "#000000cc", c.fillText(o.m, o.x + o.w / 2, o.y + o.h / 2)),
        et: (c, o) => (c.globalAlpha = o.alpha ?? 1, c.fillStyle = "#000", c.fillText(o.te, o.x + o.w / 2, o.y + o.h / 2), c.globalAlpha = 1),
        n: (c, o) => {
            c.fillStyle = "#333"
            c.fillText("📓", o.x + o.w / 2, o.y + o.h / 2)
            if (o.a) {
                drawWrap(c, o.x + o.tdx, o.y + o.tdy, o.tx, o.tdw ?? 250)
            }
        },
        bw: (c, o) => (c.fillStyle = "#ffbe7cff", c.fillRect(o.x, o.y, o.w, o.h)),
    }

    let t = 0

    const draw = (c) => {

        c.drawImage(drawing.imgBG, 0, 0)

        for (let i = 0; i < collisions.length; i++) {
            if (!collisions[i].hi) {
                r[collisions[i].t](c, collisions[i])
            }
        }

        if (x === 4 && y === 0) {
            voidSpiral(c, 15, 15, 610, 200, performance.now())
        }
    };

    function voidSpiral(c, x, y, w, h, t) {
        c.save()
        c.fillStyle = "#000"; c.fillRect(x, y, w, h);
        let cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2, A = t * 0.001;
        c.lineWidth = 2;
        for (let i = 120; i--;) {
            let k = i / 120, r = R * k, a = A + 8 * k;
            // chaos factors
            let j = Math.sin(i * 97 + t * 0.01) * 0.5;
            r *= 1 + 0.05 * j;
            a += j * 0.6;
            if ((i + t / 50 | 0) % 17 == 0) continue;
            c.strokeStyle = i % 4 ? "#E68E35" : "#ffffff";
            c.beginPath();
            c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            c.lineTo(cx + Math.cos(a + 0.25) * r * .98, cy + Math.sin(a + 0.25) * r * .98);
            c.stroke();
        }
        c.restore()
    }



    return { collisions, update, draw, x, y };
};