import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * Crab - Moving crab that needs to be photographed
 */
export default class Crab extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.photographed = false;
    this.moving = false;

    this.createCrab();
    this.setupInteraction();
  }

  createCrab() {
    const graphics = this.scene.add.graphics();

    // Body
    graphics.fillStyle(COLORS.SUNSET_ORANGE);
    graphics.fillEllipse(0, 0, 80, 50);
    graphics.lineStyle(4, 0x000000);
    graphics.strokeEllipse(0, 0, 80, 50);

    // Eyes on stalks
    graphics.fillStyle(COLORS.BLACK);
    graphics.fillCircle(-20, -25, 8);
    graphics.fillCircle(20, -25, 8);

    graphics.fillStyle(COLORS.WHITE);
    graphics.fillCircle(-20, -27, 4);
    graphics.fillCircle(20, -27, 4);

    // Claws
    graphics.fillStyle(COLORS.SUNSET_ORANGE);
    graphics.fillEllipse(-50, -5, 30, 25);
    graphics.fillEllipse(50, -5, 30, 25);
    graphics.strokeEllipse(-50, -5, 30, 25);
    graphics.strokeEllipse(50, -5, 30, 25);

    // Legs (simple lines)
    graphics.lineStyle(3, 0x000000);
    for (let i = -2; i <= 2; i++) {
      if (i !== 0) {
        const x = i * 15;
        graphics.lineBetween(x, 15, x, 35);
      }
    }

    this.add(graphics);

    // Camera flash overlay (hidden initially)
    this.flashOverlay = this.scene.add.rectangle(0, 0, 100, 70, COLORS.WHITE, 0);
    this.add(this.flashOverlay);

    this.setSize(100, 70);
  }

  setupInteraction() {
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      this.takePicture();
    });
  }

  startScuttling() {
    this.moving = true;

    // Random movement pattern
    const targetX = Phaser.Math.Between(200, 1720);
    const targetY = Phaser.Math.Between(600, 900);

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: Phaser.Math.Between(1500, 2500),
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!this.photographed && this.moving) {
          this.startScuttling();
        }
      }
    });

    // Wiggle animation
    this.scene.tweens.add({
      targets: this,
      angle: Phaser.Math.Between(-10, 10),
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Play scuttling sound occasionally
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.moving) {
          this.scene.audioManager?.playSound('crab-scuttle');
        }
      },
      loop: true
    });
  }

  stopScuttling() {
    this.moving = false;
    this.scene.tweens.killTweensOf(this);
  }

  takePicture() {
    if (this.photographed) return;

    this.photographed = true;
    this.stopScuttling();

    // Camera flash effect
    this.scene.audioManager?.playSound('camera');

    this.flashOverlay.setAlpha(1);
    this.scene.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration: 200
    });

    // Success feedback
    this.scene.particleManager?.sparkleAt(this.x, this.y, 15);

    // Notify scene
    this.scene.time.delayedCall(500, () => {
      this.scene.onCrabPhotographed();
    });

    // Crab waves goodbye
    this.scene.tweens.add({
      targets: this,
      angle: 20,
      duration: 200,
      yoyo: true,
      repeat: 3
    });
  }
}
