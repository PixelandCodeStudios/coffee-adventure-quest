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
    this.floatTween = null; // Store reference to float animation

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

    // Make interactive with explicit hit area for Container
    this.setSize(60, 40);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-30, -20, 60, 40),
      Phaser.Geom.Rectangle.Contains
    );

    // Enable dragging
    this.scene.input.setDraggable(this);
  }

  setupDragging() {
    let dragStartX, dragStartY;

    // Set cursor style
    this.on('pointerover', () => {
      this.scene.input.setDefaultCursor('grab');
    });

    this.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
    });

    this.on('dragstart', (pointer) => {
      dragStartX = this.x;
      dragStartY = this.y;
      this.scene.input.setDefaultCursor('grabbing');
      this.setScale(1.1);
      this.setAlpha(0.8);
      this.scene.audioManager?.playSound('click');

      // Stop float animation while dragging
      if (this.floatTween) {
        this.floatTween.pause();
      }
    });

    this.on('drag', (pointer, dragX, dragY) => {
      this.x = dragX;
      this.y = dragY;
    });

    this.on('dragend', (pointer) => {
      this.scene.input.setDefaultCursor('default');
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
      ease: 'Back.easeOut',
      onComplete: () => {
        // Resume float animation after returning
        if (this.floatTween) {
          this.floatTween.resume();
        }
      }
    });
  }

  /**
   * Set the float animation tween (called by scene)
   */
  setFloatTween(tween) {
    this.floatTween = tween;
  }
}
