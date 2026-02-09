import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * PourMeter - Timing-based meter for milk pouring mini-game
 */
export default class PourMeter extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.currentFill = 0;
    this.isPouring = false;
    this.pourRate = 0.25; // Fill rate per second
    this.targetZone = { min: 0.45, max: 0.65 }; // Sweet spot

    this.createMeter();
  }

  createMeter() {
    const width = 400;
    const height = 60;

    // Background
    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x333333);
    this.bg.setStrokeStyle(4, COLORS.BLACK);
    this.add(this.bg);

    // Fill bar (grows during pouring)
    this.fill = this.scene.add.rectangle(-width / 2, 0, 0, height, COLORS.SUCCESS_GREEN);
    this.fill.setOrigin(0, 0.5);
    this.add(this.fill);

    // Target zone indicator
    const targetStart = width * this.targetZone.min - width / 2;
    const targetWidth = width * (this.targetZone.max - this.targetZone.min);

    this.targetIndicator = this.scene.add.rectangle(
      targetStart + targetWidth / 2,
      0,
      targetWidth,
      height,
      COLORS.WARNING_YELLOW,
      0.3
    );
    this.targetIndicator.setStrokeStyle(3, COLORS.WARNING_YELLOW, 0.8);
    this.add(this.targetIndicator);

    // Text labels
    this.label = this.scene.add.text(0, -50, 'Click to pour... click again to stop!', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#333333',
      align: 'center'
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    this.width = width;
    this.height = height;
  }

  startPouring() {
    this.isPouring = true;
    this.scene.audioManager?.playSound('pour');
    this.label.setText('Click to STOP!');
    this.label.setColor('#FF0000');
  }

  stopPouring() {
    this.isPouring = false;
    this.scene.audioManager?.playSound('click');
    return this.checkSuccess();
  }

  update(delta) {
    if (this.isPouring && this.currentFill < 1) {
      // Increment fill level
      this.currentFill += this.pourRate * (delta / 1000);
      this.currentFill = Math.min(this.currentFill, 1);

      // Update fill bar width
      this.fill.width = this.width * this.currentFill;

      // Change color based on whether we're in the target zone
      if (this.currentFill >= this.targetZone.min && this.currentFill <= this.targetZone.max) {
        this.fill.setFillStyle(COLORS.SUCCESS_GREEN);
      } else {
        this.fill.setFillStyle(COLORS.ERROR_RED);
      }

      // Auto-stop if filled completely
      if (this.currentFill >= 1) {
        this.stopPouring();
      }
    }
  }

  checkSuccess() {
    const inTarget = this.currentFill >= this.targetZone.min &&
                     this.currentFill <= this.targetZone.max;

    if (inTarget) {
      this.label.setText('Perfect pour! ✨');
      this.label.setColor('#00FF00');
    } else {
      this.label.setText('Try again!');
      this.label.setColor('#FF0000');
    }

    return inTarget;
  }

  reset() {
    this.currentFill = 0;
    this.fill.width = 0;
    this.fill.setFillStyle(COLORS.SUCCESS_GREEN);
    this.label.setText('Click to pour... click again to stop!');
    this.label.setColor('#333333');
  }
}
