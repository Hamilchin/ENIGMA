export class DialogSystem {
  private act = false
  private txt = ''
  private cw = 0
  private ch = 0
  private x = 1
  private y = 0
  private w = 0
  private h = 75

  get isActive() { return this.act }

  triggerDialog(t: string) { this.txt = t; this.act = true }

  update(ctx: CanvasRenderingContext2D) {
    if (!this.act) return
    const c = ctx.canvas
    this.cw = c.width
    this.ch = c.height
    this.w = this.cw - 2
    this.y = this.ch - this.h - 1

    ctx.fillStyle = '#282328d7'
    ctx.strokeStyle = '#a3a29a'
    ctx.lineWidth = 2
    ctx.fillRect(this.x, this.y, this.w, this.h)
    ctx.strokeRect(this.x, this.y, this.w, this.h)

    ctx.fillStyle = '#a3a29a'
    ctx.font = '12px monospace'
    ctx.textBaseline = 'top'
    const pad = 10
    this.wrap(ctx, this.txt, this.x + pad, this.y + pad, this.w - pad * 2, 20)

    ctx.font = '10px monospace'
    ctx.fillStyle = 'lightgray'
    ctx.fillText('Press [Space] or (A) to continue...', this.x + pad, this.y + this.h - 20)
  }

  private wrap(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, mw: number, lh: number) {
    const w = t.split(' ')
    let line = ''
    for (let i = 0; i < w.length; i++) {
      const test = line + w[i] + ' '
      if (ctx.measureText(test).width > mw && i > 0) {
        ctx.fillText(line, x, y)
        line = w[i] + ' '
        y += lh
      } else line = test
    }
    ctx.fillText(line, x, y)
  }

  onKeyPress() { if (this.act) { this.act = false; this.txt = '' } }
}
