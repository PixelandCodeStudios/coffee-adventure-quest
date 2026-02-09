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
    // Animated crab sprite!
    this.crabSprite = this.scene.add.sprite(0, 0, 'crab-sprite');
    this.crabSprite.setScale(0.2); // Scale to appropriate size
    this.crabSprite.play('crab-walk'); // Start walking animation
    this.add(this.crabSprite);

    // Camera flash overlay (hidden initially)
    this.flashOverlay = this.scene.add.rectangle(0, 0, 100, 100, COLORS.WHITE, 0);
    this.add(this.flashOverlay);

    this.setSize(100, 100);
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
