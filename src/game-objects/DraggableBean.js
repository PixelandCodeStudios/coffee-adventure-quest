import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * DraggableBean - Coffee bean that can be dragged into the grinder
 */
export default class DraggableBean extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.startX = x;
    this.startY = y;
    this.collected = false;

    this.createBean();
    this.setupDragging();
  }

  createBean() {
    // Create bean graphic
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(COLORS.COFFEE_BROWN);
    graphics.fillEllipse(0, 0, 40, 28);
    graphics.lineStyle(3, 0x000000);
    graphics.strokeEllipse(0, 0, 40, 28);

    // Bean split line
    graphics.lineStyle(2, 0x000000);
    graphics.lineBetween(-15, -10, -10, 10);

    this.add(graphics);

    // Make interactive
    this.setSize(60, 40);
    this.setInteractive({ draggable: true, useHandCursor: true });
  }

  setupDragging() {
    let dragStartX, dragStartY;

    this.on('dragstart', (pointer) => {
      dragStartX = this.x;
      dragStartY = this.y;
      this.setScale(1.1);
      this.setAlpha(0.8);
      this.scene.audioManager?.playSound('click');
    });

    this.on('drag', (pointer, dragX, dragY) => {
      this.x = dragX;
      this.y = dragY;
    });

    this.on('dragend', (pointer) => {
      this.setScale(1);
      this.setAlpha(1);
      this.checkDrop();
    });
  }

  checkDrop() {
    // Check if dropped near grinder
    const grinder = this.scene.grinder;
    if (!grinder) return;

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      grinder.x, grinder.y
    );

    if (distance < 120) {
      this.onSuccessfulDrop();
    } else {
      this.returnToStart();
    }
  }

  onSuccessfulDrop() {
    this.collected = true;
    this.removeInteractive();
    this.scene.audioManager?.playSound('grind');

    // Shrink and fade out
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.scene.onBeanCollected();
        this.destroy();
      }
    });
  }

  returnToStart() {
    this.scene.tweens.add({
      targets: this,
      x: this.startX,
      y: this.startY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
}
