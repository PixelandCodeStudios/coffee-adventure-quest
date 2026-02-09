import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * CoffeeCup - Interactive glowing coffee cup
 */
export default class CoffeeCup extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.createCup();
    this.enableGlow();
    this.setupInteraction();
  }

  createCup() {
    // Cup body
    const cup = this.scene.add.rectangle(0, 0, 100, 120, COLORS.COFFEE_BROWN);
    cup.setStrokeStyle(4, COLORS.BLACK);
    this.add(cup);

    // Foam on top
    const foam = this.scene.add.ellipse(0, -60, 105, 30, COLORS.CREAM);
    foam.setStrokeStyle(4, COLORS.BLACK);
    this.add(foam);

    // Steam particles
    this.createSteam();

    this.setSize(100, 120);
  }

  createSteam() {
    // Create simple steam effect
    for (let i = 0; i < 3; i++) {
      const steam = this.scene.add.circle(
        -20 + i * 20,
        -80,
        8,
        COLORS.WHITE,
        0.5
      );
      this.add(steam);

      this.scene.tweens.add({
        targets: steam,
        y: -120,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 2000,
        delay: i * 300,
        repeat: -1,
        ease: 'Sine.easeOut'
      });
    }
  }

  enableGlow() {
    // Create glow effect
    this.glowCircle = this.scene.add.circle(0, 0, 80, COLORS.GOLD, 0.3);
    this.glowCircle.setBlendMode(Phaser.BlendModes.ADD);
    this.addAt(this.glowCircle, 0);

    // Pulse animation
    this.scene.tweens.add({
      targets: this.glowCircle,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setupInteraction() {
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', () => {
      this.setScale(1.1);
    });

    this.on('pointerout', () => {
      this.setScale(1);
    });

    this.on('pointerdown', () => {
      this.onSip();
    });
  }

  onSip() {
    this.scene.audioManager?.playSound('sip');

    // Tilt animation (drinking)
    this.scene.tweens.add({
      targets: this,
      angle: 20,
      duration: 300,
      yoyo: true,
      ease: 'Power2'
    });

    // Emit event
    this.emit('sip');
  }
}
