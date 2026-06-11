import { createElement } from './createElement'

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  isStar?: boolean
  rotation?: number
  rotationSpeed?: number
}

export interface OrbitalParticle {
  x: number
  y: number
  rotation: number
  orbitalIndex: number
  currentSpeedMultiplier: number
}

export class ParticleSystem {
  private particles: Particle[] = []
  private orbitalParticles: OrbitalParticle[] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationId: number | null = null
  private initialized = false
  private globalOrbitalAngle = 0
  private baseAngularVelocity = 0.02
  private orbitalParticleCount = 0
  public pointCount = 0
  private fadeAlpha = 0
  public centerX = innerWidth / 2
  public centerY = innerHeight / 2
  public centerYOffset = 0
  public scale = 1
  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init())
    } else {
      this.init()
    }
  }

  private init() {
    if (this.initialized) return

    this.canvas = createElement('canvas', {
      className: 'particle-canvas',
    }) as HTMLCanvasElement
    document.body.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!
    this.initialized = true

    this.animate()

    this.resize()
    addEventListener('resize', () => this.resize())
  }

  private resize() {
    if (!this.canvas) return
    this.canvas.width = innerWidth
    this.canvas.height = innerHeight
    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2
    this.scale = Math.min(500, this.canvas!.width) / 500
  }

  createConfetti(
    x: number,
    y: number,
    color: string,
    count = 20,
    isStar?: boolean,
  ) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = (0.5 + Math.random() * 3) * this.scale
      const maxLife = (40 + Math.random() * 90) * this.scale
      this.particles.push({
        x,
        y,
        rotation: 0,
        color,
        isStar,
        life: maxLife,
        maxLife,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        rotationSpeed: Math.random() * 0.2,
      })
    }

    if (!this.animationId) this.animate()
  }

  createOrbitalParticle() {
    // Reassign indices to existing orbital particles
    this.orbitalParticles.forEach((particle, index) => {
      particle.orbitalIndex = index
      particle.currentSpeedMultiplier = 1 // Reset speed multiplier
    })

    this.orbitalParticles.push({
      x: this.centerX,
      y: this.centerY + this.centerYOffset,
      rotation: 0,
      orbitalIndex: this.orbitalParticles.length,
      currentSpeedMultiplier: 1,
    })

    this.orbitalParticleCount = this.orbitalParticles.length

    if (!this.animationId) this.animate()
  }

  fireOffOrbitalParticles() {
    this.convertOrbitalParticlesToRegular(0.1 * this.scale, 1) // outward direction
  }

  removeOrbitalParticle() {
    const p = this.orbitalParticles.shift()!

    const maxLife = 30
    this.particles.push({
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      life: maxLife,
      maxLife,
      size: 18,
      color: '#FFD700',
      isStar: true,
      rotation: p.rotation,
      rotationSpeed: 0.1,
    })
    setTimeout(() => this.createConfetti(p.x, p.y, '#FFD700', 10, true), 200)
  }

  private convertOrbitalParticlesToRegular(
    speedMultiplier: number,
    radialDirection: number,
  ) {
    this.orbitalParticles.forEach((orbitalParticle) => {
      // Calculate the current velocity based on orbital motion
      const currentAngle =
        this.globalOrbitalAngle +
        (Math.PI * 2 * orbitalParticle.orbitalIndex) / this.orbitalParticleCount

      // Calculate tangent vector (perpendicular to radius for circular motion)
      const tangentVx =
        -Math.sin(currentAngle) * this.baseAngularVelocity * speedMultiplier
      const tangentVy =
        Math.cos(currentAngle) * this.baseAngularVelocity * speedMultiplier

      // Add radial velocity (outward or inward from center based on direction)
      const radialVx =
        Math.cos(currentAngle) * speedMultiplier * 0.5 * radialDirection
      const radialVy =
        Math.sin(currentAngle) * speedMultiplier * 0.5 * radialDirection
      const vx = (tangentVx + radialVx) * 100
      const vy = (tangentVy + radialVy) * 100
      const maxLife = 60 * this.scale

      // Create a new regular particle from the orbital particle
      this.particles.push({
        x: orbitalParticle.x,
        y: orbitalParticle.y,
        vx,
        vy,
        life: maxLife,
        maxLife,
        size: 18,
        color: '#FFD700',
        isStar: true,
        rotation: orbitalParticle.rotation,
        rotationSpeed: 0.1,
      })
    })

    this.orbitalParticles = []
    if (!this.animationId) this.animate()
  }

  private animate() {
    if (!this.canvas || !this.ctx) return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.pointCount === 0) {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - 0.02)
    } else if (this.pointCount > 0) {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + 0.1)
    }
    this.renderNumber()

    // Update global orbital angle
    this.globalOrbitalAngle += this.baseAngularVelocity
    this.globalOrbitalAngle = this.globalOrbitalAngle % (Math.PI * 2)

    // Animate orbital particles
    for (let i = 0; i < this.orbitalParticles.length; i++) {
      const p = this.orbitalParticles[i]

      // Calculate where this particle should be based on the global angle
      const idealAngle =
        this.globalOrbitalAngle +
        (Math.PI * 2 * p.orbitalIndex) / this.orbitalParticleCount

      const maxRadius = 150
      const radius =
        (100 +
          (maxRadius - 100) *
            (1 - Math.exp(-0.05 * this.orbitalParticleCount))) *
        this.scale

      // Calculate ideal position
      const idealX = this.centerX + Math.cos(idealAngle) * radius
      const idealY =
        this.centerY + this.centerYOffset + Math.sin(idealAngle) * radius

      // Calculate current angle of the particle relative to center
      const currentAngle = Math.atan2(
        p.y - (this.centerY + this.centerYOffset),
        p.x - this.centerX,
      )

      // Calculate angle difference (shortest path)
      let angleDiff = idealAngle - currentAngle
      angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI

      // Adjust speed multiplier based on how far off we are
      const maxAngleDiff = Math.PI / 4 // Max difference where we apply speed changes
      const speedAdjustment = Math.abs(angleDiff) / maxAngleDiff

      if (Math.abs(angleDiff) > 0.05) {
        // Speed up or slow down to catch up/slow down
        p.currentSpeedMultiplier =
          1 + (angleDiff > 0 ? speedAdjustment * 2 : -speedAdjustment * 0.5)
        p.currentSpeedMultiplier = Math.max(
          0.2,
          Math.min(3, p.currentSpeedMultiplier),
        )
      } else {
        // Close enough, return to normal speed
        p.currentSpeedMultiplier = 1
      }

      // Smoothly interpolate towards the ideal position
      const lerpFactor = 0.15 // How fast to move towards ideal position
      p.x = p.x + (idealX - p.x) * lerpFactor
      p.y = p.y + (idealY - p.y) * lerpFactor

      // Update rotation
      p.rotation = idealAngle + 0.2
    }

    // Animate regular particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.98
      p.vy *= 0.98
      p.life--

      if (p.rotationSpeed !== undefined && p.rotation !== undefined) {
        p.rotation += p.rotationSpeed
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }
    }

    // Render orbital particles
    this.orbitalParticles.forEach((p) => {
      this.renderOrbitalParticle(p)
    })

    // Render regular particles
    this.particles.forEach((p) => {
      this.renderParticle(p)
    })

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  private renderNumber() {
    if (!this.ctx) return

    this.ctx.save()

    const time = Date.now() * 0.001
    const sizeFactor = Math.min(this.pointCount, 200) / 400
    const scaleAnimation =
      (1 + sizeFactor + Math.sin(time * 4) * 0.05) * this.scale
    this.ctx.translate(this.centerX, this.centerY + this.centerYOffset)
    this.ctx.scale(scaleAnimation, scaleAnimation)
    this.ctx.rotate(Math.sin(time * 1.5) * 0.1)

    this.ctx.font = 'bold 42px system-ui'
    this.ctx.fillStyle = `rgba(72, 157, 255, ${this.fadeAlpha})`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(`${this.pointCount}`, 0, 0)
    this.ctx.restore()
  }

  private renderOrbitalParticle(p: OrbitalParticle) {
    if (!this.ctx) return

    this.ctx.save()

    const img = document.querySelector('.charm-1 path') as SVGPathElement
    const size = 18
    const color = '#FFD700'

    this.ctx.fillStyle = color
    this.ctx.beginPath()

    const scale = (size / 40) * this.scale

    this.ctx.translate(p.x, p.y)
    this.ctx.scale(scale, scale)
    this.ctx.rotate(p.rotation)

    this.ctx.translate(-100, -100)
    let path2 = new Path2D(img.getAttribute('d')!)
    this.ctx.lineWidth = 10
    this.ctx.stroke(path2)
    this.ctx.fill(path2)

    this.ctx.restore()
  }

  private renderParticle(p: Particle) {
    if (!this.ctx) return

    const alpha = p.life / p.maxLife
    const size = p.size * alpha

    this.ctx.save()

    const img = document.querySelector('.charm-1 path') as SVGPathElement

    this.ctx.fillStyle = p.color
    this.ctx.beginPath()

    const scale = (size / 40) * this.scale
    const rotateFromOrigin = p.color !== 'black'
    let offset = rotateFromOrigin ? 0 : 15

    this.ctx.translate(p.x - offset, p.y - offset)
    this.ctx.scale(scale, scale)
    if (p.rotation !== undefined) this.ctx.rotate(p.rotation)

    this.ctx.lineWidth = 10
    if (p.isStar) {
      if (rotateFromOrigin) this.ctx.translate(-100, -100)
      let path2 = new Path2D(img.getAttribute('d')!)
      this.ctx.stroke(path2)
      this.ctx.fill(path2)
    } else {
      this.ctx.arc(0, 0, size * 10, 0, 360)
      this.ctx.stroke()
      this.ctx.fill()
    }

    this.ctx.restore()
  }
}

export const particleSystem = new ParticleSystem()
