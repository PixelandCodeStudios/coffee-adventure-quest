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
    // Birthday avatar sprite (cute pixel art with party hat!)
    this.avatarSprite = this.scene.add.image(0, 0, 'birthday-avatar');
    this.avatarSprite.setScale(0.5); // Scale to appropriate size
    this.add(this.avatarSprite);
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

    // Side-to-side sway
    this.scene.tweens.add({
      targets: this.avatarSprite,
      angle: -10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
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
