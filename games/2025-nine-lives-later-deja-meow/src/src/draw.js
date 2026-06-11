import * as ls from './ls.js'

export const draw = ({
    ov, ot, cv
} = {}) => {
    let on = false
    let dpr = window.devicePixelRatio || 1
    let x = -1
    let y = -1
    let doneLoading = true
    addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            on = !on

            if (!on) {
                saveToLS()
            }

            ov.style.opacity = on ? 1 : 0.3
            cv.style.opacity = on ? 0.5 : 1

            document.body.style.cursor = 'crosshair'

            // const dpr = window.devicePixelRatio || 1;
            // const size = 32 * dpr;
            // document.body.style.cursor =
            //     `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><text y="${size * 0.75}" font-size="${size * 0.75}">✏️</text></svg>') 0 ${size * 0.75}, auto`;
        }
    });

    function load(nx, ny) {
        x = nx
        y = ny
        doneLoading = false
        const s = ls.load(`${x},${y}`)
        ot.clearRect(0, 0, 640, 400)
        if (s) {
            console.log("found room for", x, y);
            (async () => {
                const img = new Image();
                img.src = s
                await img.decode();
                ot.drawImage(img, 0, 0, 640, 400, 0, 0, 640, 400);
                doneLoading = true
            })();
        } else {
            console.log("did not find room for", x, y)

            doneLoading = true;
        }
    }

    const update = (mx, my) => {
        // if (mx !== x || my !== y) {
        //     x = mx
        //     y = my
        //     load()
        // }

        if (!on) return false

        return true
    }

    addEventListener('mousedown', down);
    addEventListener('mousemove', move);
    addEventListener('mouseup', up);
    addEventListener('mouseleave', up);

    let drawing = false, lastX = 0, lastY = 0, erase = false;

    function pos(e) {
        const r = ov.getBoundingClientRect();
        const s = r.width / 640; // compute scale on the fly
        const x = (e.clientX - r.left) / s;
        const y = (e.clientY - r.top) / s;
        return [x, y];
    }

    function down(e) {
        if (!on || !doneLoading) return;
        drawing = true;
        erase = (e.button === 2);
        ot.lineWidth = erase ? 10 * dpr : 3 * dpr;
        [lastX, lastY] = pos(e);
        e.preventDefault();
    }
    function move(e) {
        if (!drawing) return;
        const [x, y] = pos(e);
        if (!erase) {
            ot.beginPath();
            ot.moveTo(lastX, lastY);
            ot.lineTo(x, y);
            ot.stroke();
        } else {
            ot.clearRect(x, y, ot.lineWidth, ot.lineWidth)
        }

        [lastX, lastY] = [x, y];
    }
    function up() {
        drawing = false;
    }

    function saveToLS() {
        // const c = document.createElement('canvas'), ct = c.getContext('2d');
        // c.width = 640; c.height = 400;
        // ct.drawImage(ov, 0, 0, ov.width, ov.height, 0, 0, 640, 400);
        // ls.save(`${x},${y}`, c.toDataURL('image/png'))
        const c = document.createElement('canvas'), ct = c.getContext('2d');
        c.width = 640; c.height = 400;              // 640×400 logical
        ct.setTransform(1, 0, 0, 1, 0, 0);           // neutralize any prior scaling
        ct.imageSmoothingEnabled = false;       // keep pixels crisp
        ct.drawImage(ov, 0, 0, ov.width, ov.height, 0, 0, 640, 400); // from backing → logical
        ls.save(`${x},${y}`, c.toDataURL('image/png'));
    }



    return { update, load }
}
