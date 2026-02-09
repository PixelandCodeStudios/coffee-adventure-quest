import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * Shell - Clickable beach shell that may contain the caramel pistachio ingredient
 */
export default class Shell extends Phaser.GameObjects.Container {
  constructor(scene, x, y, hasIngredient = false) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.hasIngredient = hasIngredient;
    this.clicked = false;

    this.createShell();
    this.setupInteraction();
  }

  createShell() {
    // Shell body
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(COLORS.PINK);
    graphics.fillCircle(0, 0, 45);
    graphics.lineStyle(4, 0x000000);
    graphics.strokeCircle(0, 0, 45);

    // Shell ridges for detail
    graphics.lineStyle(3, 0xFFAACC);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x1 = Math.cos(angle) * 15;
      const y1 = Math.sin(angle) * 15;
      const x2 = Math.cos(angle) * 45;
      const y2 = Math.sin(angle) * 45;
      graphics.lineBetween(x1, y1, x2, y2);
    }

    this.add(graphics);

    // Sparkle if has ingredient
    if (this.hasIngredient) {
      const sparkle = this.scene.add.text(25, -25, '✨', {
        fontSize: '24px'
      });
      this.add(sparkle);

      // Twinkle animation
      this.scene.tweens.add({
        targets: sparkle,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.setSize(90, 90);
  }

  setupInteraction() {
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', () => {
      if (!this.clicked) {
        this.setScale(1.1);
      }
    });

    this.on('pointerout', () => {
      if (!this.clicked) {
        this.setScale(1);
      }
    });

    this.on('pointerdown', () => {
      this.onClick();
    });
  }

  onClick() {
    if (this.clicked) return;

    this.clicked = true;
    this.scene.audioManager?.playSound('click');

    // Open animation
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      ease: 'Back.easeOut'
    });

    if (this.hasIngredient) {
      this.revealIngredient();
    } else {
      // Empty shell
      const emptyText = this.scene.add.text(this.x, this.y - 60, 'Empty!', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#666666'
      });
      emptyText.setOrigin(0.5);

      this.scene.tweens.add({
        targets: emptyText,
        alpha: 0,
        y: emptyText.y - 30,
        duration: 1000,
        onComplete: () => emptyText.destroy()
      });
    }
  }

  revealIngredient() {
    // Show the caramel pistachio ingredient
    const ingredient = this.scene.add.container(this.x, this.y);

    const bottle = this.scene.add.rectangle(0, 0, 40, 70, 0xD2691E);
    bottle.setStrokeStyle(3, COLORS.BLACK);

    const label = this.scene.add.text(0, 0, 'CP', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    ingredient.add([bottle, label]);
    ingredient.setScale(0);

    this.scene.tweens.add({
      targets: ingredient,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.scene.particleManager?.sparkleAt(this.x, this.y, 20);

    // Notify scene
    this.scene.time.delayedCall(800, () => {
      this.scene.onIngredientFound(ingredient);
    });
  }
}
