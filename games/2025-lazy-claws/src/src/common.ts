export const B = 32;
export const R = 32 / 4;
export const W = B * 24;
export const H = B * 18;
export const HW = W / 2;
export const HH = H / 2;

export const drawSkip = (ctx: CanvasRenderingContext2D) => {
    ctx.font = '16px monospace';
    ctx.fillStyle = '#4d4343';
    ctx.fillText('[Press space to skip]', HW, H - B * 2);
}

export const animate = (texts: string[], max: number, cycles = 100) => {
    const wrapped = texts.map(text => wrap(text));

    let completeion = 0;
    let textIndex = 0;
    let charIndex = 0;
    let done = false;
    let next = false;
    let ticks = 0;

    return function (): { lines: string[], done: boolean } {
        if (done) {
            return {
                done: true,
                lines: wrapped[wrapped.length - 1],
            };
        }

        completeion += 0.18;

        const currentText = texts[textIndex];
        charIndex = Math.min(Math.floor(completeion), texts[textIndex].length);
        const lines = cut(wrapped[textIndex], charIndex);

        if (next) {
            ticks += 1;
        }

        if (charIndex >= currentText.length && !next) {
            next = true;
            ticks = 0;
        }

        if (next && ticks === cycles) {
            textIndex++;
            completeion = 0;
            charIndex = 0;
            next = false;
            ticks = 0;
        }

        if (textIndex >= texts.length) {
            done = true;
        }

        return { done, lines };
    };

    function cut(wrapped: string[], index: number) {
        let total = 0;
        const lines = [];

        for (const line of wrapped) {
            if (total + line.length < index - 1) {
                lines.push(line);
                total += line.length;
            } else {
                lines.push(line.substr(0, index - total));
                break;
            }
        }

        return lines;
    }

    function wrap(text: string) {
        const words = text.split(' ');
        const wrap = [];
        let line = '';

        for (const word of words) {
            if (line.length + word.length + 1 > max) {
                wrap.push(line);
                line = word;
            } else {
                line += (line.length === 0 ? '' : ' ') + word;
            }
        }

        if (line) {
            wrap.push(line);
        }

        return wrap;
    }
}
