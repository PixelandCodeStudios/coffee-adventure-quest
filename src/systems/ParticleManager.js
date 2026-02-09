import { COLORS, TIMING } from '../utils/Constants.js';

/**
 * ParticleManager - Manages sparkle effects and particle systems
 */
export default class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.emitters = {};
  }

  /**
   * Create sparkle particle emitter
   */
  createSparkleEmitter() {
    // Create a simple star-shaped graphic for particles
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(COLORS.GOLD, 1);
    graphics.fillStar(8, 8, 5, 8, 4, 0);
    graphics.generateTexture('particle-star', 16, 16);
    graphics.destroy();

    // Create the particle emitter
    this.emitters.sparkle = this.scene.add.particles(0, 0, 'particle-star', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      emitting: false,
      gravityY: 50
    });

    this.emitters.sparkle.setDepth(1000);
  }

  /**
   * Emit sparkles at a specific position
   */
  sparkleAt(x, y, count = 20) {
    if (this.emitters.sparkle) {
      this.emitters.sparkle.emitParticleAt(x, y, count);
      this.scene.audioManager?.playSound('sparkle');
    }
  }

  /**
   * Create confetti explosion
   */
  createConfettiExplosion(x, y) {
    const colors = [
      COLORS.PINK,
      COLORS.GOLD,
      COLORS.SKY_BLUE,
      COLORS.LAVENDER,
      COLORS.MINT
    ];

    colors.forEach((color, index) => {
      setTimeout(() => {
        const confetti = this.scene.add.particles(x, y, 'particle-star', {
          speed: { min: 200, max: 400 },
          angle: { min: 0, max: 360 },
          scale: { start: 1.2, end: 0 },
          tint: color,
          lifespan: 2000,
          gravityY: 300,
          quantity: 15,
          blendMode: 'NORMAL',
          emitting: false
        });

        confetti.explode();

        // Clean up after animation
        this.scene.time.delayedCall(2500, () => {
          confetti.destroy();
        });
      }, index * 100);
    });
  }

  /**
   * Create a trail effect for moving objects
   */
  createTrail(target) {
    const trail = this.scene.add.particles(0, 0, 'particle-star', {
      follow: target,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 500,
      frequency: 50,
      blendMode: 'ADD'
    });

    return trail;
  }

  /**
   * Create floating hearts effect
   */
  createHearts(x, y) {
    // Create heart shape
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(COLORS.PINK, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.fillCircle(12, 4, 4);
    graphics.fillTriangle(0, 6, 16, 6, 8, 16);
    graphics.generateTexture('particle-heart', 16, 16);
    graphics.destroy();

    const hearts = this.scene.add.particles(x, y, 'particle-heart', {
      speed: { min: 20, max: 50 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      gravityY: -100,
      quantity: 8,
      emitting: false
    });

    hearts.explode();

    this.scene.time.delayedCall(2500, () => {
      hearts.destroy();
    });
  }

  /**
   * Clean up all emitters
   */
  destroy() {
    Object.values(this.emitters).forEach(emitter => {
      if (emitter && emitter.destroy) {
        emitter.destroy();
      }
    });
    this.emitters = {};
  }
}
