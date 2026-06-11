import * as drawing from './drawings.js'
import { collides, collSimp, C, dst } from './util.js'

export const player = ({

} = {}) => {

    let rooms = [], x = 40, y = 200, r = 10, s = 3, aim = 0, adx = 1, ady = 0, w = 20, h = 20, l = 9, le = 0, ll = 0, c = C.P, m = C.W | C.T | C.E | C.D | C.S | C.I | C.ET | C.B, inv = { c: 0 }, name, invu = 0, ic = '😺'

    function updatePlayer(dt, K, mx, my, room) {
        let dx = (K['d'] ? 1 : 0) - (K['a'] ? 1 : 0)
        let dy = (K['s'] ? 1 : 0) - (K['w'] ? 1 : 0)

        if (dx || dy) {
            const m = Math.hypot(dx, dy);
            dx /= m;
            dy /= m
        }

        let nx = x + dx * s * (dt / 16), ny = y + dy * s * (dt / 16)
        const no = { x: nx, y: ny, w, h, c, m }

        if (invu > 0) invu = Math.max(0, invu - dt)


        for (const c of room.collisions) {

            if (c.t === 'n') {
                const col = collSimp(no, c)
                if (c.a === 0 && col) {
                    c.a = 1
                } else if (!col && c.a === 1) {
                    c.a = 0
                }
            } else {

                if (collides(no, c)) {
                    if (c.t === 'x') { death(); c.a = 1; return c };
                    if (c.e === "d" && invu === 0) {
                        invu = 2000
                        death(); return c
                    };

                    if (c.t === 'd' || c.t === 'e') {
                        return c
                    }

                    if (c.t === 'c') {
                        inv.c++
                        c.mfd = true
                    }

                    nx = x;
                    ny = y;
                }
            }


        }

        x = nx;
        y = ny

        aim = Math.atan2(my - y, mx - x);
        adx = Math.cos(aim);
        ady = Math.sin(aim);
    }

    function drawPlayer(ct) {
        const L = 24;
        ct.beginPath();
        ct.strokeStyle = "#232323"
        ct.moveTo(x + 10, y + 10);
        ct.lineTo(x + 10 + adx * L, y + 10 + ady * L);
        ct.stroke();
        dst(ct, ic, { x, y, w, h })
    }

    function death() {
        window.sounds && window.sounds.sfx(1)
        l--
        ll = 500
        newRoom(le)
    }

    function getBullet() {
        return {
            x: x + 10 + adx * 24, y: y + 10 + ady * 24, dx: adx * 5, dy: ady * 5, w: 5, h: 5, c: C.B, m: C.W | C.D | C.E | C.ET | C.P
        }
    }

    function getPosRect() {
        return { x, y, w, h, c, m }
    }

    const nrp = { "s": { x: 300, y: 40 }, "n": { x: 300, y: 340 }, "w": { x: 590, y: 200 }, "e": { x: 50, y: 200 } }
    function newRoom(m) {
        ({ x, y } = nrp[m])
        le = m
    }

    let prev = 0
    function dc(dt, ct) {
        if (!ll) return false;
        ic = '😿'
        ll = Math.max(0, ll - dt);
        const band = ll > 400 ? 4 : ll > 300 ? 3 : ll > 200 ? 2 : ll > 100 ? 1 : 0;
        if (band !== prev) {
            if (band % 2) drawPlayer(ct);
            else if (band) ct.clearRect(x, y, w, h);
            prev = band;
        }
        if (ll === 0) ic = '😺'
        return ll;
    }

    function invText() {
        return `🐈‍⬛${l} 🧀${inv.c}`
    }

    function isDead() {
        return l <= 0
    }

    function setRooms(r) {
        rooms = r
    }

    function canOpen(d) {
        if (d.dt) {
            if (inv.c < 1) return false;
            d.dt = false
            useCheese()
        }

        return true;
    }

    function useCheese() {
        if (inv.c > 0) inv.c--
    }

    return {
        x,
        y,
        r,
        adx,
        ady,
        updatePlayer,
        drawPlayer,
        getBullet,
        newRoom,
        death,
        dc,
        invText,
        isDead,
        setRooms,
        canOpen,
        getPosRect,
        useCheese,
        ic
    }

}