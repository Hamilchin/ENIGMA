import { Note } from './audio-utils';

export let onClick = (element, callback, note) => {
    return element.addEventListener("click", (event) => {
        if(note !== false && window.playSounds) {
            setTimeout(()=>(note || Note.new("f#", 5, 0.05)).play(1), 100);
        }
        if(callback(event) !== false){
            window.shop.draw();
        }
    });
};

// export let onHover = (element, callback, note) => {
//     return element.addEventListener("mouseover", (event) => {
//         if(callback(event) !== false){
//             window.shop.draw();
//         }
//     });
// };

export let onMouseIn = (element, callback, note) => {
    return element.addEventListener("mouseenter", (event) => {
        if(note !== false && window.playSounds) {
            (note || Note.new("f#", 5, 0.05)).play(1, "sine");
        }
        if(callback(event) !== false){
            window.shop.draw();
        }
    });
};

// export let onMouseOut = (element, callback, note) => {
//     return element.addEventListener("mouseout", (event) => {
//         if(callback(event) !== false){
//             window.shop.draw();
//         }
//     });
// };

export let onMouseDown = (element, callback, note) => {
    return element.addEventListener("mousedown", (event) => {
        if(note !== false && window.playSounds) {
            (note || Note.new("c", 5, 0.05)).play(1);
        }
        if(callback(event) !== false){
            window.shop.draw();
        }
    });
};

export let onMouseUp = (element, callback, note) => {
    return element.addEventListener("mouseup", (event) => {
        if(note !== false && window.playSounds) {
            (note || Note.new("c", 4, 0.05)).play(1);
        }
        if(callback(event) !== false){
            window.shop.draw();
        }
    });
};