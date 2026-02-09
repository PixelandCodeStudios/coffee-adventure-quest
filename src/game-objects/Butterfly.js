import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * Butterfly - Fluttering butterfly decoration
 */
export default class Butterfly extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.createButterfly();
  }

  createButterfly() {
    const graphics = this.scene.add.graphics();

    // Left wing
    graphics.fillStyle(COLORS.LAVENDER);
    graphics.fillEllipse(-12, 0, 20, 30);
    graphics.lineStyle(2, COLORS.BLACK);
    graphics.strokeEllipse(-12, 0, 20, 30);

    // Right wing
    graphics.fillEllipse(12, 0, 20, 30);
    graphics.strokeEllipse(12, 0, 20, 30);

    // Body
    graphics.fillStyle(COLORS.BLACK);
    graphics.fillEllipse(0, 0, 6, 16);

    // Antennae
    graphics.lineStyle(1, COLORS.BLACK);
    graphics.lineBetween(-2, -8, -4, -12);
    graphics.lineBetween(2, -8, 4, -12);

    this.add(graphics);

    // Wing flap animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.8,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  startFluttering() {
    // Random wandering movement
    const moveToRandomPosition = () => {
      const targetX = Phaser.Math.Between(100, 1820);
      const targetY = Phaser.Math.Between(100, 500);

      const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      const duration = distance * 3; // Slower movement

      this.scene.tweens.add({
        targets: this,
        x: targetX,
        y: targetY,
        duration: duration,
        ease: 'Sine.easeInOut',
        onComplete: () => moveToRandomPosition()
      });
    };

    moveToRandomPosition();

    // Up and down bobbing
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
