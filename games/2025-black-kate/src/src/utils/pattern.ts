export const formatColor = (c: number): string => {
    const a = c >> 24 & 0xff;
    const r = c >> 16 & 0xff;
    const g = c >> 8 & 0xff;
    const b = c & 0xff;

    return `rgba(${r}, ${g}, ${b}, ${a / 0xff})`;
}

export const createGradient = (
    context: CanvasRenderingContext2D,
    x0: number, y0: number, x1: number, y1: number,
    startColor: number, endColor: number
) => {
    const gradient = context.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, formatColor(startColor));
    gradient.addColorStop(1, formatColor(endColor));
    return gradient;
}