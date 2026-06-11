import { int } from './random'

export let adjust = (colour, amount) => {
    if(!colour){
        return '#00000000';
    }
    return '#' + colour.replace(/^#/, '').replace(/../g, colour => ('0' + Math.min(255, Math.max(0, parseInt(colour, 16) + amount)).toString(16)).substr(-2));
};

// export let hexToHsv = (hex) => {
//     let [r, g, b, a] = hexToRgbA(hex);
//     let max = Math.max(r, g, b);
//     let min = Math.min(r, g, b);
//     let delta = max - min;

//     let h, s, v = max / 255;

//     if (delta === 0) {
//         h = 0;
//     } else if (max === r) {
//         h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
//     } else if (max === g) {
//         h = ((b - r) / delta + 2) * 60;
//     } else {
//         h = ((r - g) / delta + 4) * 60;
//     }

//     s = max === 0 ? 0 : delta / max;

//     return [h, s, v];
// };

export let hsvToRgb = (h, s, v) => {
    let r, g, b;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
};

export let hsvToHex = (h, s, v) => {
    let a = '#' + hsvToRgb(h, s, v).map(c => Math.floor(c).toString(16).padStart(2, '0')).join('');
    return `${a}ff`
};

export let newColour = (h, s, v) => {
    return hsvToHex(h !== null ? h : int(0, 360) / 360, s || 0.7, v || 1);
};

export let base10ToHex = (decimal) => {
    return decimal.toString(16).padStart(2, '0');
};

export let hexToRgbA = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    let a = parseInt(hex.slice(7, 9), 16);
    return [r, g, b, a];
}
