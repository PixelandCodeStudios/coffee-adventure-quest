import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS, FONTS } from '../utils/Constants.js';
import DraggableBean from '../game-objects/DraggableBean.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * CoffeeBeanScene - Mini-game 1: Drag coffee beans into grinder
 */
export default class CoffeeBeanScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.COFFEE_BEAN });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.beansCollected = 0;
    this.beansRequired = 5;
  }

  create() {
    // Fade in
    TransitionManager.fadeIn(this);

    // Initialize managers
    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.stickerManager = new StickerManager(this, this.stateManager);

    // Create background (kitchen)
    this.createBackground();

    // Create grinder
    this.createGrinder();

    // Create draggable beans
    this.createBeans();

    // Show instructions
    this.showInstructions();
  }

  createBackground() {
    const bg = this.add.rectangle(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 1920, 1080, COLORS.CREAM);

    // Kitchen counter
    const counter = this.add.rectangle(POSITIONS.CENTER_X, 900, 1920, 400, 0xA0826D);

    // Title
    const title = this.add.text(POSITIONS.CENTER_X, 100, 'Coffee Bean Collection', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#6F4E37',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
  }

  createGrinder() {
    // Coffee grinder
    const grinderX = POSITIONS.CENTER_X;
    const grinderY = 600;

    const grinderBase = this.add.rectangle(grinderX, grinderY + 40, 180, 120, 0x8B4513);
    grinderBase.setStrokeStyle(4, 0x000000);

    const grinderTop = this.add.rectangle(grinderX, grinderY - 60, 140, 80, 0xA0522D);
    grinderTop.setStrokeStyle(4, 0x000000);

    const handle = this.add.rectangle(grinderX + 90, grinderY - 60, 60, 15, 0x654321);
    handle.setStrokeStyle(2, 0x000000);

    // Grinder container for collision detection
    this.grinder = this.add.container(grinderX, grinderY);
    this.grinder.setSize(180, 200);

    // Progress text
    this.progressText = this.add.text(grinderX, grinderY + 130, `0 / ${this.beansRequired}`, {
      fontSize: '32px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.progressText.setOrigin(0.5);
  }

  createBeans() {
    this.beans = [];

    const positions = [
      { x: 300, y: 400 },
      { x: 500, y: 350 },
      { x: 700, y: 420 },
      { x: 1400, y: 380 },
      { x: 1600, y: 430 }
    ];

    positions.forEach(pos => {
      const bean = new DraggableBean(this, pos.x, pos.y);
      this.beans.push(bean);

      // Add subtle float animation and store reference in bean
      const floatTween = this.tweens.add({
        targets: bean,
        y: pos.y - 10,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Give bean reference to its float animation
      bean.setFloatTween(floatTween);
    });
  }

  showInstructions() {
    const instructions = this.add.text(POSITIONS.CENTER_X, 250,
      'Drag all 5 coffee beans into the grinder!', {
      fontSize: '28px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // Fade out after a few seconds
    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      onComplete: () => instructions.destroy()
    });
  }

  onBeanCollected() {
    this.beansCollected++;
    this.progressText.setText(`${this.beansCollected} / ${this.beansRequired}`);

    // Update state
    this.stateManager.collectBean();

    // Sparkle effect at grinder
    this.particleManager.sparkleAt(this.grinder.x, this.grinder.y - 50, 15);

    // Check if all beans collected
    if (this.beansCollected >= this.beansRequired) {
      this.time.delayedCall(800, () => {
        this.completeMiniGame();
      });
    }
  }

  completeMiniGame() {
    // Mark mini-game complete and unlock sticker
    this.stateManager.markMiniGameComplete('coffeeBeans', STICKER_KEYS.BEAN);

    // Success animation
    TransitionManager.flash(this, COLORS.GOLD);

    // Success message
    const successMsg = this.add.text(POSITIONS.CENTER_X, POSITIONS.CENTER_Y,
      '✨ All beans collected! ✨\nGrinding complete!', {
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

    // Transition to next scene
    this.time.delayedCall(2500, () => {
      TransitionManager.transitionTo(this, SCENES.MILK_POUR, {
        stateManager: this.stateManager,
        audioManager: this.audioManager
      });
    });
  }
}
