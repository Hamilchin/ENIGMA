// --- Minimal Click Registry ---
type ClickArea = {
  x: number;
  y: number;
  w: number;
  h: number;
  cb: () => void;
};

let clickAreas: ClickArea[] = [];

export function initClickHandler(canvas: HTMLCanvasElement) {
  canvas.addEventListener("click", (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();

    // Scale factor between CSS size and internal canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Adjust click coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const area of clickAreas) {
      if (
        x >= area.x &&
        x <= area.x + area.w &&
        y >= area.y &&
        y <= area.y + area.h
      ) {
        area.cb();
      }
    }
  });
}

export function addClick(
  x: number,
  y: number,
  w: number,
  h: number,
  cb: () => void
) {
  clickAreas.push({ x, y, w, h, cb });
}

export function clearClicks() {
  clickAreas = [];
}
