import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS, FONTS } from '../utils/Constants.js';
import PourMeter from '../game-objects/PourMeter.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * MilkPourScene - Mini-game 2: Timing-based milk pouring
 */
export default class MilkPourScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MILK_POUR });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.pouring = false;
  }

  create() {
    // Fade in
    TransitionManager.fadeIn(this);

    // Initialize managers
    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.stickerManager = new StickerManager(this, this.stateManager);

    // Create background
    this.createBackground();

    // Create milk bottle and cup
    this.createMilkAndCup();

    // Create pour meter
    this.createPourMeter();

    // Show instructions
    this.showInstructions();
  }

  createBackground() {
    const bg = this.add.rectangle(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 1920, 1080, COLORS.CREAM);

    const counter = this.add.rectangle(POSITIONS.CENTER_X, 900, 1920, 400, 0xA0826D);

    const title = this.add.text(POSITIONS.CENTER_X, 100, 'Perfect Milk Pour', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#6F4E37',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
  }

  createMilkAndCup() {
    // Milk bottle
    const milkBottle = this.add.container(300, 400);

    const bottle = this.add.rectangle(0, 0, 80, 200, COLORS.WHITE);
    bottle.setStrokeStyle(4, COLORS.BLACK);
    milkBottle.add(bottle);

    const cap = this.add.rectangle(0, -110, 60, 20, COLORS.SUNSET_ORANGE);
    cap.setStrokeStyle(3, COLORS.BLACK);
    milkBottle.add(cap);

    const label = this.add.text(0, 0, 'MILK', {
      fontSize: '20px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    milkBottle.add(label);

    // Coffee cup
    const cupX = 1600;
    const cupY = 500;

    const cupBody = this.add.rectangle(cupX, cupY, 120, 150, 0x8B4513);
    cupBody.setStrokeStyle(4, COLORS.BLACK);

    const cupTop = this.add.ellipse(cupX, cupY - 75, 130, 40, 0xA0522D);
    cupTop.setStrokeStyle(4, COLORS.BLACK);

    // Cup fill level (will fill during animation)
    this.cupFill = this.add.rectangle(cupX, cupY + 75, 110, 0, COLORS.CREAM);
    this.cupFill.setOrigin(0.5, 1);
  }

  createPourMeter() {
    this.pourMeter = new PourMeter(this, POSITIONS.CENTER_X, 550);

    // Make the whole scene clickable
    this.input.on('pointerdown', () => {
      this.handleClick();
    });
  }

  showInstructions() {
    const instructions = this.add.text(POSITIONS.CENTER_X, 250,
      'Click to start pouring, then click again when the meter is in the yellow zone!', {
      fontSize: '26px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      align: 'center',
      wordWrap: { width: 800 }
    });
    instructions.setOrigin(0.5);

    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 1000,
      delay: 4000,
      onComplete: () => instructions.destroy()
    });
  }

  handleClick() {
    if (!this.pouring && this.pourMeter.currentFill === 0) {
      // Start pouring
      this.pouring = true;
      this.pourMeter.startPouring();
    } else if (this.pouring) {
      // Stop pouring
      this.pouring = false;
      const success = this.pourMeter.stopPouring();

      if (success) {
        this.onPourSuccess();
      } else {
        this.onPourFail();
      }
    }
  }

  update(time, delta) {
    if (this.pourMeter) {
      this.pourMeter.update(delta);

      // Animate cup filling
      const fillHeight = 140 * this.pourMeter.currentFill;
      this.cupFill.height = fillHeight;
    }
  }

  onPourSuccess() {
    this.particleManager.sparkleAt(1600, 500, 20);
    TransitionManager.flash(this, COLORS.SUCCESS_GREEN);

    this.time.delayedCall(1500, () => {
      this.completeMiniGame();
    });
  }

  onPourFail() {
    TransitionManager.shake(this, 0.005);

    this.time.delayedCall(1500, () => {
      // Reset for retry
      this.pourMeter.reset();
      this.cupFill.height = 0;
    });
  }

  completeMiniGame() {
    this.stateManager.markMiniGameComplete('milkPour', STICKER_KEYS.MILK);

    const successMsg = this.add.text(POSITIONS.CENTER_X, POSITIONS.CENTER_Y,
      '✨ Perfect pour! ✨\nMilk added to coffee!', {
      fontSize: '42px',
      fontFamily: FONTS.TITLE,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    successMsg.setOrigin(0.5);
    successMsg.setAlpha(0);

    this.tweens.add({
      targets: successMsg,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.time.delayedCall(2500, () => {
      TransitionManager.transitionTo(this, SCENES.BEACH_DISCOVERY, {
        stateManager: this.stateManager,
        audioManager: this.audioManager
      });
    });
  }
}
