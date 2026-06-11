export const C = {
    P: 1 << 0, E: 1 << 1, B: 1 << 2, W: 1 << 3, T: 1 << 4, S: 1 << 5, D: 1 << 6, I: 1 << 7, ET: 1 << 8

}

export const collides = (a, b) => {
    if (a.hi || b.hi) return false;

    return collSimp(a, b) && (a.m & b.c) && (b.m & a.c);;
}

export const collSimp = (a, b) => {
    if (a.hi || b.hi) return false;

    return !(
        a.x + a.w < b.x ||
        a.x > b.x + b.w ||
        a.y + a.h < b.y ||
        a.y > b.y + b.h
    )
}


export const bounce = (a, b) => {
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2; const dx = ax - bx, px = (a.w + b.w) / 2 - Math.abs(dx); const dy = ay - by, py = (a.h + b.h) / 2 - Math.abs(dy); if (px < py) { a.x += dx < 0 ? -px : px; a.dx = -a.dx; } else { a.y += dy < 0 ? -py : py; a.dy = -a.dy; }

    a.justB = true
    a.justBDT = 0
};

export const dst = (ct, t, o) => (ct.save(), ct.shadowBlur = 5, ct.shadowColor = "rgba(0,0,0,.7)", ct.fillText(t, o.x + o.w / 2, o.y + o.h / 2), ct.restore())



export const fm = (x, y, z) => ({ x, y, w: 20, h: 20, t: "e", e: "m", dx: Math.random() < 0.5 ? 1.5 : -1.5, dy: Math.random() < 0.5 ? 1.5 : -1.5, c: C.E, m: C.P | C.W | C.B | C.E, ...z })
export const fw = (x, y, w, h, z) => ({ x, y, w, h, t: "w", c: C.W, m: C.P | C.B | C.E, ...z })
export const fwx = (x, y, w, h, z) => ({ x, y, w, h, t: "x", c: C.T, m: C.P, ...z })
export const fd = (x, y) => ({ x, y, w: 20, h: 20, t: "e", e: "d", dx: Math.random() < 0.5 ? 1 : -1, dy: Math.random() < 0.5 ? 1 : -1, c: C.E, m: C.W | C.P | C.B | C.D | C.E })
export const fwd = (x, y, w, h, d, z) => ({ x, y, w, h, t: "d", d, c: C.D, m: C.P | C.E | C.B, ...z })
export const ft = (x, y, w, h, m, z) => ({ x, y, w, h, m, t: "t", ...z })
export const fts = (x, y, m, z) => ({ x, y, m, t: "ts", ...z })
export const fet = (x, y, w, h, te, z) => ({ x, y, h, w, te, t: "et", ...z, c: C.ET })
export const fmw = (x, y, w, h, mv) => ({ x, y, w, h, mv, t: "x", a: 1, c: C.T, m: C.P })
export const fn = (x, y, w, h, tdx, tdy, tx, z) => ({ x, y, w, h, t: "n", a: 0, tdx, tdy, tx, ...z })
export const fbw = (x, y, w, h, z) => ({ x, y, w, h, t: "bw", c: C.W, m: C.P | C.B | C.E, ...z })
