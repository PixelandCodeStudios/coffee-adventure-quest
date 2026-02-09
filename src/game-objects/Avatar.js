import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * Avatar - Dancing birthday character
 */
export default class Avatar extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.createAvatar();
  }

  createAvatar() {
    const graphics = this.scene.add.graphics();

    // Body
    graphics.fillStyle(COLORS.PINK);
    graphics.fillRoundedRect(-40, 0, 80, 120, 20);
    graphics.lineStyle(4, COLORS.BLACK);
    graphics.strokeRoundedRect(-40, 0, 80, 120, 20);

    // Head
    graphics.fillStyle(0xFFDBB5);  // Skin tone
    graphics.fillCircle(0, -40, 35);
    graphics.strokeCircle(0, -40, 35);

    // Happy eyes
    graphics.fillStyle(COLORS.BLACK);
    graphics.fillCircle(-12, -45, 4);
    graphics.fillCircle(12, -45, 4);

    // Big smile
    graphics.lineStyle(3, COLORS.BLACK);
    graphics.arc(0, -35, 15, 0.3, Math.PI - 0.3, false);
    graphics.strokePath();

    // Arms (will animate)
    this.leftArm = this.scene.add.rectangle(-35, 40, 12, 60, COLORS.PINK);
    this.leftArm.setOrigin(0.5, 0);
    this.add(this.leftArm);

    this.rightArm = this.scene.add.rectangle(35, 40, 12, 60, COLORS.PINK);
    this.rightArm.setOrigin(0.5, 0);
    this.add(this.rightArm);

    this.add(graphics);

    // Party hat
    const hat = this.scene.add.triangle(0, -75, -20, 30, 20, 30, 0, -20, COLORS.SUNSET_ORANGE);
    hat.setStrokeStyle(3, COLORS.BLACK);
    this.add(hat);

    const pomPom = this.scene.add.circle(0, -95, 8, COLORS.GOLD);
    pomPom.setStrokeStyle(2, COLORS.BLACK);
    this.add(pomPom);
  }

  startDancing() {
    // Bounce animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Arm wave animations
    this.scene.tweens.add({
      targets: this.leftArm,
      angle: -30,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.scene.tweens.add({
      targets: this.rightArm,
      angle: 30,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 250
    });
  }

  playHappyAnimation() {
    // Jump for joy
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }
}
