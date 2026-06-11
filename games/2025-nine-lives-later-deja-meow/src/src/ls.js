const lk = 'stefor.js13k2025.cat';
const key = (k) => `${lk}.${k}`

export const load = (k) => {
    console.log("ls load", key(k))
    return localStorage.getItem(key(k))
}
export const save = (k, d) => {
    localStorage.setItem(key(k), d);
}

export const loadJ = (k) => {
    return JSON.parse(load(k))
}
export const saveJ = (k, d) => {
    save(k, JSON.stringify(d))
}