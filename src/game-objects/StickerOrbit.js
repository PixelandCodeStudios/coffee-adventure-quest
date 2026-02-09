import Phaser from 'phaser';

/**
 * StickerOrbit - Container that rotates stickers around a center point
 */
export default class StickerOrbit extends Phaser.GameObjects.Container {
  constructor(scene, x, y, radius = 150) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.radius = radius;
    this.stickers = [];
    this.orbiting = false;
    this.angle = 0;
  }

  addStickers(stickerKeys) {
    const angleStep = (Math.PI * 2) / stickerKeys.length;

    stickerKeys.forEach((stickerKey, index) => {
      const angle = angleStep * index;
      const x = Math.cos(angle) * this.radius;
      const y = Math.sin(angle) * this.radius;

      // Create sticker graphic (use same graphics as StickerManager)
      const sticker = this.createStickerGraphic(stickerKey, x, y);
      this.add(sticker);
      this.stickers.push({ graphic: sticker, baseAngle: angle });

      // Scale animation
      this.scene.tweens.add({
        targets: sticker,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1000 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  createStickerGraphic(stickerKey, x, y) {
    const container = this.scene.add.container(x, y);

    // Background circle
    const bg = this.scene.add.circle(0, 0, 35, 0xFFFFFF);
    bg.setStrokeStyle(3, 0xFFD700);
    container.add(bg);

    // Simple icon representation
    const icon = this.scene.add.text(0, 0, this.getStickerEmoji(stickerKey), {
      fontSize: '32px'
    });
    icon.setOrigin(0.5);
    container.add(icon);

    return container;
  }

  getStickerEmoji(stickerKey) {
    const emojis = {
      'sticker-bean': '☕',
      'sticker-milk': '🥛',
      'sticker-shell': '🐚',
      'sticker-crab': '🦀',
      'sticker-cup': '🎉'
    };
    return emojis[stickerKey] || '⭐';
  }

  startOrbiting(speed = 0.01) {
    this.orbiting = true;
    this.orbitSpeed = speed;
  }

  update(delta) {
    if (!this.orbiting) return;

    this.angle += this.orbitSpeed * (delta / 16);

    this.stickers.forEach((stickerData, index) => {
      const totalAngle = stickerData.baseAngle + this.angle;
      const x = Math.cos(totalAngle) * this.radius;
      const y = Math.sin(totalAngle) * this.radius;

      stickerData.graphic.x = x;
      stickerData.graphic.y = y;
    });
  }
}
