import { createRoom } from './room.js'
import { player } from './player.js'
import { draw } from './draw.js'
import { collides, bounce, C, fm, fw, fwx, fd, ft, fet, fmw, fwd, fn, fbw, collSimp } from './util.js'
import * as ls from './ls.js'
import Sounds from "./music/sounds";
const cv = document.getElementById("c"), ct = cv.getContext("2d")
const ov = document.getElementById("ov"), ot = ov.getContext("2d")
const DPR_OVERRIDE = +new URLSearchParams(location.search).get('dpr') || 0;
const DPR = DPR_OVERRIDE || (window.devicePixelRatio || 1), W = 640, H = 400;

let K, mp, bullets, d, p, mx, my, last, room, rooms, moki, rt, vd
mp = {}
K = {}

const map = {
    x: 0,
    y: 1
}

const strings = `
    Use left mouse button to shoot hairballs. (... have I already told myself this?)
    ||Magic pen records for future and past. Use space bar to activate pen mode and draw with mouse. Right mouse to erase. Find and draw the trap to the right.
    ||Who closed this wall?
    ||Already looked, nothing to the south
    ||*Sigh* Told you so...
    ||Sacrifice to void to get a glimpse into future. For those that comes after.
    ||You should play blue prince
    ||Secret south door in room with an H
    ||Shoot hairball on yourself in potato room
    ||Trap shapes can form numbers
    ||Sometimes it's better to die and try again
    ||Trap shapes can form numbers
    ||Trap shapes can form numbers
    ||Thank you for playing. I had more ideas but the jam fell under the song of silk. If you want the game to be over, it's over.
    ||Send cheese signal by pressing 'g'
    ||Reach my family grave without spilling any of our blood
    ||Traps will hide when you leave a room, mark them with pen
    `.replaceAll("\n", "").split("||").map(x => x.trim())


const newGame = () => {

    window.sounds && window.sounds.playSong(0, 0.4);

    K = {}, mp = {}, bullets = [], d = draw({ ov, ot, cv }), p = player(), mx = 0, my = 0, last = 0, map.x = 0, map.y = 1, moki = 0

    rt = {
        t: 0,
        a: false,
        d: 0
    }

    vd = { t: 0, proph: strings[Math.floor(Math.random() * (10 - 6 + 1) + 6)] }

    rooms = roomsBase.map(x => createRoom(JSON.parse(JSON.stringify(x))))

    room = rooms.find(r => r.x === map.x && r.y === map.y)
    d.load(map.x, map.y)
    p.newRoom("e")
    p.setRooms(rooms)

    ls.saveJ('cc', (ls.loadJ('cc') ?? 0) + 1)


    requestAnimationFrame(tick)

}




function rs() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    const x = (ac, at) => {
        ac.style.width = W * s + 'px';
        ac.style.height = H * s + 'px';
        ac.width = W * DPR; ac.height = H * DPR;
        at.setTransform(DPR, 0, 0, DPR, 0, 0);
        at.font = '18px monospace';
        at.textAlign = 'center';
        at.textBaseline = 'middle';
    }
    x(cv, ct)
    x(ov, ot)

    d && d.load()

}



const roomsBase = [

    { rects: [fn(200, 200, 20, 20, 10, -100, strings[0])], doors: "n", x: 0, y: 1 },
    {
        rects: [fw(210, 130, 20, 140), fw(220, 250, 130, 20), fw(350, 130, 20, 140, { m: C.P | C.E }), fw(210, 130, 140, 20), fet(280, 160, 20, 20, '⚫', { m: C.B | C.P, ac: 12, as: 0 }), fn(280, 220, 20, 20, 140, -25, strings[16])], doors: "we", x: 1, y: 0
    },
    { rects: [fm(200, 200), fd(100, 100), fd(300, 200)], doors: "wE", x: 2, y: 0 },
    { rects: [fwx(140, 130, 20, 185), fwx(290, 220, 100, 50),], doors: "wns", x: 3, y: 0 },
    { rects: [], doors: "nsew", x: 3, y: 1 },
    { rects: [fw(15, 300, 500, 15), fet(18, 20, 20, 20, '🐟', { alpha: 0.2, hi: 1 }), fwx(100, 100, 15, 60), fwx(100, 160, 60, 15), fwx(160, 100, 15, 120)], doors: "ne", x: 3, y: 2 },
    { rects: [fet(200, 100, 20, 20, '⚫', { m: C.B | C.P, ac: 3, as: 0 }), fet(300, 100, 20, 20, '⚫', { m: C.B | C.P, ac: 4, as: 0 }), fet(400, 100, 20, 20, '⚫', { m: C.B | C.P, ac: 5, as: 0 })], doors: "w", x: 4, y: 2 },
    { rects: [fet(305, 30, 32, 32, '\"exit\"'), fet(530, 200 - 16, 32, 32, '💻', { hi: 1 }), fw(500, 140, 600, 15, { m: C.P | C.E }), fw(500, 245, 600, 15, { m: C.P | C.E }), fw(485, 140, 15, 120, { m: C.P | C.E }), fet(230, 300, 20, 20, '🐟0', { m: C.B | C.P, ac: 8, av: 0 }), fet(280, 300, 20, 20, '🐶0', { m: C.B | C.P, ac: 9, av: 0 }), fet(330, 300, 20, 20, '🥬0', { m: C.B | C.P, ac: 10, av: 0 }), fet(380, 300, 20, 20, '🥝0', { m: C.B | C.P, ac: 11, av: 0 })], doors: "wen", x: 4, y: 1 },
    { rects: [], doors: "sWe", x: 3, y: -1 },
    { rects: [fwx(105, 85, 80, 245), fwx(265, 125, 110, 25), fwx(315, 195, 125, 20), fwx(215, 265, 145, 25), fwx(435, 310, 30, 75), fwx(490, 20, 40, 220)], doors: "ew", x: 4, y: -1 },
    { rects: [fw(240, 0, 10, 80), fw(250, 80, 110, 10, { m: C.P | C.E }), fw(360, 0, 10, 80), fet(290, 20, 20, 20, '⚫', { m: C.B | C.P, ac: 6, as: 0 }), fw(140, 130, 380, 10), fw(550, 0, 20, 400), fwx(450, 50, 70, 70), fwx(70, 70, 70, 50), fd(300, 200), fd(100, 300), fn(600, 100, 20, 20, -160, 10, strings[2], { hi: 1 })], doors: "ew", x: 5, y: -1 },
    { rects: [fw(140, 120, 10, 170), fw(220, 200, 230, 20), fw(510, 120, 10, 170), fmw(160, 20, 150, 90, { t: 5000, x: 100, y: 70, o: 0, dx: 250, dy: 0 }), fm(50, 50), fd(300, 300), fd(200, 200), fd(100, 100), fwd(280, 400 - 16, 80, 16, 's', { dt: 0, alpha: 0 }), fmw(160, 20, 60, 40, { t: 2000, x: 140, y: 30, o: 0, dx: 0, dy: 100 })], doors: "wN", x: 6, y: -1 },
    { rects: [fwx(510, 250, 10, 110), fwx(520, 250, 50, 10), fwx(520, 350, 50, 10), fwx(560, 310, 10, 40), fwx(520, 300, 50, 10), fet(600, 50, 20, 20, '🥬', { alpha: 0.2, hi: 1 })], doors: "w", x: 6, y: 0 },
    { rects: [], doors: "ne", x: 5, y: 0 },
    { rects: [fwx(480, 150, 15, 100), fn(400, 200, 20, 20, 10, -120, strings[1], { tdw: 300 })], doors: "se", x: 0, y: 0 },
    { rects: [fw(0, 120, 130, 10, { m: C.P | C.E }), fbw(120, 15, 40, 3), fbw(220, 117, 40, 3), fbw(300, 15, 40, 3), fbw(290, 15, 30, 3), fbw(390, 110, 80, 3, { mv: { t: 2000, x: 390, y: 117, o: 0, dx: 100, dy: 0 } }), fw(130, 80, 10, 50), fw(140, 120, 420, 10), fw(560, 0, 10, 400), fw(380, 0, 10, 40), fet(460, 40, 20, 20, '⚫', { m: C.B | C.P, ac: 7, as: 0 })], doors: "es", x: 6, y: -2 },
    { rects: [fd(50, 50), fd(390, 50), fd(120, 350), fd(520, 250), fw(190, 160, 10, 90), fw(200, 160, 40, 10), fw(240, 170, 10, 70), fwx(200, 240, 40, 10), fwx(280, 170, 10, 70), fw(290, 240, 60, 10), fw(350, 170, 10, 70), fwx(290, 160, 60, 10), fw(380, 160, 10, 90), fw(390, 240, 50, 10), fwx(440, 200, 10, 50), fw(410, 190, 40, 10), fwx(390, 160, 60, 10), fd(200, 200)], doors: "ne", x: 2, y: -1 },
    { rects: [fwx(120, 70, 410, 240), fm(200, 200)], doors: "SWe", x: 2, y: 1 },
    { rects: [fn(200, 200, 20, 20, 10, -30, strings[3])], doors: "es", x: 1, y: 1 },
    { rects: [], doors: "ns", x: 1, y: 2 },
    { rects: [], doors: "ns", x: 1, y: 3 },
    { rects: [fn(400, 300, 20, 20, 10, -30, strings[4])], doors: "n", x: 1, y: 4 },
    { rects: [fet(305, 80, 32, 32, '🪦'), fet(240, 60, 128, 32, '🐭', { alpha: 0.6 }), fw(0, 120, 640, 10)], doors: "ns", x: 2, y: -2 },
    { rects: [fet(300, 300, 20, 20, '🥝', { alpha: 0.2, hi: 1 }), fwx(80, 60, 20, 230)], doors: "s", x: 2, y: -3 },
    { rects: [fn(200, 300, 20, 20, 10, -70, strings[5])], doors: "s", x: 4, y: 0 },
    { rects: [fn(500, 200, 20, 20, -50, -100, strings[13])], doors: "w", x: 5, y: 1 },
    { rects: [fwx(0, 310, 640, 30), fet(200, 80, 32, 32, '🥔'), fn(200, 350, 20, 20, 10, -100, strings[14])], doors: "n", x: 2, y: 2 },
    { rects: [fn(200, 350, 20, 20, 10, -50, strings[15]), fet(160, 350, 20, 20, '🐭', { alpha: 0.6 })], doors: "w", x: 7, y: -2 }


]

const computerCheck = () => {
    const s = `${rooms[7].collisions[5].av},${rooms[7].collisions[6].av},${rooms[7].collisions[7].av},${rooms[7].collisions[8].av}`

    if (s === '4,5,6,1') {
        rooms[7].collisions[4].hi = 1
    }
}

const actions = [
    0,
    1,
    (c) => { rooms[5].collisions[1].hi = 1; rooms[12].collisions[5].hi = 1; for (let i = 0; i < 3; i++) room.collisions[i].te = '⚫', room.collisions[i].as = 0 },
    (c) => { actions[2](), c.as = 1, c.te = c.as ? '🐟' : '⚫', rooms[5].collisions[1].hi = 0, window.sounds && window.sounds.sfx(3) },
    (c) => { actions[2](), c.as = 1, c.te = c.as ? '🥬' : '⚫', rooms[12].collisions[5].hi = 0, window.sounds && window.sounds.sfx(3) },
    (c) => { actions[2](), c.as = 1, c.te = c.as ? '🥝' : '⚫', rooms[23].collisions[0].hi = 0, window.sounds && window.sounds.sfx(3) },
    (c) => { c.as = c.as === 0 ? 1 : 0, room.collisions[5].hi = c.as === 0 ? 0 : 1, c.te = c.as === 0 ? '⚫' : '🟢', window.sounds && window.sounds.sfx(3) },
    (c) => { c.as = c.as === 0 ? 1 : 0, room.collisions[8].hi = c.as === 0 ? 0 : 1, c.te = c.as === 0 ? '⚫' : '🟢', window.sounds && window.sounds.sfx(3) },
    (c) => { c.av = (c.av + 1) % 10, c.te = '🐟' + c.av, computerCheck() },
    (c) => { c.av = (c.av + 1) % 10, c.te = '🐶' + c.av, computerCheck() },
    (c) => { c.av = (c.av + 1) % 10, c.te = '🥬' + c.av, computerCheck() },
    (c) => { c.av = (c.av + 1) % 10, c.te = '🥝' + c.av, computerCheck() },
    (c) => { c.as = c.as === 0 ? 1 : 0, room.collisions[2].hi = c.as === 0 ? 0 : 1, c.te = c.as === 0 ? '⚫' : '🟢', window.sounds && window.sounds.sfx(3) },
]

const enterRoomActions = {
    '6,-1': () => {
        const r = rooms.find(r => r.x === 5 && r.y === -1)
        r.collisions[5].hi = 0
        r.collisions[3].as = 0
        r.collisions[3].te = '⚫'

        const r2 = rooms.find(r => r.x === 5 && r.y === -1)
        r2.collisions[10].hi = 0
    },
    '2,-2': () => {
        const r = rooms.find(r => r.x === 2 && r.y === -2)
        r.collisions[1].te = "🐭 " + moki

        if (moki === 0) {
            r.collisions[2].hi = 1
        } else {
            r.collisions[2].hi = 0
        }


    }
}


ct.textAlign = 'center';
ct.textBaseline = 'middle';

addEventListener('resize', rs); rs();


onkeydown = e => (K[e.key.toLowerCase()] = 1)
onkeyup = e => { K[e.key.toLowerCase()] = 0 }

oncontextmenu = e => e.preventDefault();
onmousemove = e => {
    const r = cv.getBoundingClientRect();
    mx = (e.clientX - r.left) * W / r.width;
    my = (e.clientY - r.top) * H / r.height;
};

onmousedown = e => (mp[e.button.toString()] = 1)
onmouseup = e => (mp[e.button.toString()] = 0)


function updateBullets(dt) {

    for (const b of bullets) {
        b.x += b.dx * (dt / 16) * 2; b.y += b.dy * (dt / 16) * 2;

        if (room.x === 2 && room.y === 2 && collides(b, p.getPosRect())) {
            room.collisions[0].hi = 1
        }

        for (let r of room.collisions) {
            if (collides(b, r)) {

                if (r.e === 'm') {
                    r.mfd = true
                    moki++
                    ls.saveJ('mc', (ls.loadJ('mc') ?? 0) + 1)

                }

                if (r.e === 'd' && !r.tim) {
                    r.tim = 1500
                }

                if (r.ac > 0) {
                    actions[r.ac](r)
                }

                if (r.t === 'bw') {
                    bounce(b, r)
                    continue;
                }

                b.mdf = true
            }
        }


    }

    bullets = bullets.filter(x => !x.mdf)
}

function drawBullets() {

    let last = '';
    for (let b of bullets) {

        const s = b.t ? 'hotpink' : 'blue';
        if (s !== last) { ct.fillStyle = s; last = s; }
        ct.fillText("🧶", b.x, b.y)
        // ct.fillRect(b.x - 1, b.y - 1, 5, 5);
    }
}

function drawHud() {
    ct.fillStyle = "#461E52"
    ct.fillText(p.invText(), 640 - 65, 35);
}





function tick(t) {
    const dt = Math.min(50, t - last);
    last = t;

    if (p.isDead() && vd.t === 0) {
        window.sounds && window.sounds.sfx(4)
        window.sounds && window.sounds.pauseSong(0)
        vd.t = dt
        ct.fillStyle = "#fff", ct.fillText('Again', 640 / 2, 400 / 2),
            vd.prev = -1
    }

    if (d.update(map.x, map.y)) {
    } else {



        if (rt.a) {
            room.draw(ct);
            let pp = rt.d ? rt.t / 250 : 1 - rt.t / 250
            ct.fillStyle = `rgba(0,0,0,${Math.min(pp, 1)})`
            ct.fillRect(0, 0, W, H)
            rt.t += dt
            if (rt.d && rt.t >= 75) { rt.h(); rt.t = 1; rt.d = 0 }
            if (!rt.d && rt.t >= 150) { rt.a = false; ov.style.display = 'block' }

        } else {

            if (vd.t > 0 || (map.x === 4 && map.y === 0 && collSimp(p.getPosRect(), { x: 0, y: 0, w: 640, h: 180 }))) {
                if (!vd.t) { ct.fillStyle = "#fff", ct.fillText(vd.proph, 640 / 2, 120), vd.prev = -1 }

                vd.t += dt

                const ctt = Math.floor(vd.t / 500);

                if (ctt > vd.prev) {
                    ct.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    ct.fillRect(0, 0, W, H);

                    vd.prev = ctt;
                }

            } else {

                if (p.dc(dt, ct)) {
                } else {
                    ct.clearRect(0, 0, W, H);

                    if (K["g"]) {
                        room.collisions.filter(x => x.t === "d" && x.dt).forEach(x => x.dt = 0)
                    }

                    if (mp["0"] || mp["2"]) {
                        const b = { ...p.getBullet(), t: mp["2"] }
                        bullets.push(b)
                        mp["0"] = 0
                        mp["2"] = 0
                    }

                    const c = p.updatePlayer(dt, K, mx, my, room)

                    updateBullets(dt);

                    room.update(dt)

                    room.draw(ct);
                    drawBullets();
                    p.drawPlayer(ct)

                    if (c) {
                        if (c.t === 'x') {

                        }
                        if (c.t === 'e') {

                        }
                        else if (c.t === 'd') {

                            if (p.canOpen(c)) {

                                if (c.d === "e") map.x++
                                if (c.d === "w") map.x--
                                if (c.d === "s") map.y++
                                if (c.d === "n") map.y--

                                ov.style.display = 'none'

                                rt.a = true
                                rt.t = 0
                                rt.d = 1
                                rt.h = () => {
                                    room = rooms.find(r => r.x === map.x && r.y === map.y)
                                    d.load(map.x, map.y)
                                    console.log("entering room", map)
                                    bullets = []
                                    p.newRoom(c.d)
                                    window.sounds && window.sounds.sfx(2)

                                    // hide all traps except moving ones
                                    room.collisions.forEach(c => {
                                        if (c.t === 'x' && !c.mv) c.a = 0
                                    })

                                    enterRoomActions[`${map.x},${map.y}`]?.()
                                }



                            }
                        }
                    }


                    drawHud()

                }
            }
        }
    }

    if (vd.t > 3000) {
        newGame();
    } else {
        requestAnimationFrame(tick)
    }
}



window.warp = (x, y) => {
    map.x = x;
    map.y = y
    d.load(x, y)
    room = rooms.find(r => r.x === x && r.y === y)
    bullets = []
    p.newRoom('w')
    window.sounds && window.sounds.sfx(1)

    enterRoomActions[`${map.x},${map.y}`]?.()
}

// newGame()




ct.fillStyle = "#000000cc", ct.fillText('loading...', 320, 200)

window.sounds = new Sounds(this)


window.sounds.load(() => {
    ct.clearRect(0, 0, 640, 400)

    ct.save()
    ct.font = "64px monospace"
    ct.shadowBlur = 15, ct.shadowColor = "rgba(0,0,0,.7)"
    ct.fillText('😼', 320, 130)
    ct.restore()

    ct.fillStyle = "#000000cc", ct.fillText('nine lives later - déjà meow', 320, 200)
    ct.fillText('click to start', 320, 240)

    const onClick = () => {
        window.removeEventListener('click', onClick);

        newGame();
    };
    window.addEventListener('click', onClick);
});
