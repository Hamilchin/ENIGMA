function makeRoomBg() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 400;
    const W = 640, H = 400, G = 40, x = c.getContext('2d');

    let g = x.createLinearGradient(0, 0, G, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, G, H);

    g = x.createLinearGradient(W, 0, W - G, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(W - G, 0, G, H);

    g = x.createLinearGradient(0, 0, 0, G);
    g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, G);

    g = x.createLinearGradient(0, H, 0, H - G);
    g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, H - G, W, G);

    x.beginPath();
    x.strokeStyle = "#00000012"
    for (let i = 0; i <= W; i += 40) { x.moveTo(i, 0); x.lineTo(i, H); }
    for (let j = 0; j <= H; j += 40) { x.moveTo(0, j); x.lineTo(W, j); }
    x.stroke();

    return c
}


export const imgBG = makeRoomBg()

