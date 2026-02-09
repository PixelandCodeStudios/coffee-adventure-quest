import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS, FONTS } from '../utils/Constants.js';
import Crab from '../game-objects/Crab.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * CrabPhotographyScene - Mini-game 4: Click the moving crab to take a perfect photo
 */
export default class CrabPhotographyScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CRAB_PHOTOGRAPHY });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.photographed = false;
  }

  create() {
    TransitionManager.fadeIn(this);

    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.stickerManager = new StickerManager(this, this.stateManager);

    this.createBackground();
    this.createCrab();
    this.showInstructions();
  }

  createBackground() {
    // Beautiful beach background image
    const bg = this.add.image(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 'beach-background');
    bg.setDisplaySize(1920, 1080); // Scale to fit screen

    // Title
    const title = this.add.text(POSITIONS.CENTER_X, 100, '📸 Crab Photography Challenge', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#FF6600',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // Camera viewfinder overlay
    this.createViewfinder();
  }

  createViewfinder() {
    const viewfinder = this.add.graphics();
    viewfinder.lineStyle(3, COLORS.WHITE, 0.6);

    // Corner brackets
    const size = 150;
    const cx = POSITIONS.CENTER_X;
    const cy = POSITIONS.CENTER_Y;

    // Top-left
    viewfinder.lineBetween(cx - size, cy - size, cx - size + 40, cy - size);
    viewfinder.lineBetween(cx - size, cy - size, cx - size, cy - size + 40);

    // Top-right
    viewfinder.lineBetween(cx + size, cy - size, cx + size - 40, cy - size);
    viewfinder.lineBetween(cx + size, cy - size, cx + size, cy - size + 40);

    // Bottom-left
    viewfinder.lineBetween(cx - size, cy + size, cx - size + 40, cy + size);
    viewfinder.lineBetween(cx - size, cy + size, cx - size, cy + size - 40);

    // Bottom-right
    viewfinder.lineBetween(cx + size, cy + size, cx + size - 40, cy + size);
    viewfinder.lineBetween(cx + size, cy + size, cx + size, cy + size - 40);

    // Pulse animation
    this.tweens.add({
      targets: viewfinder,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createCrab() {
    this.crab = new Crab(this, POSITIONS.CENTER_X, 700);

    // Start scuttling around
    this.time.delayedCall(1000, () => {
      this.crab.startScuttling();
    });
  }

  showInstructions() {
    const instructions = this.add.text(POSITIONS.CENTER_X, 250,
      'Click the crab to take a perfect photo and get the ingredient back!', {
      fontSize: '28px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
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

  onCrabPhotographed() {
    if (this.photographed) return;

    this.photographed = true;

    // Success message
    const msg = this.add.text(POSITIONS.CENTER_X, POSITIONS.CENTER_Y - 100,
      '📸 Perfect shot!\n🎉 Ingredient retrieved!', {
      fontSize: '42px',
      fontFamily: FONTS.TITLE,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    msg.setOrigin(0.5);
    msg.setAlpha(0);

    this.tweens.add({
      targets: msg,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      ease: 'Back.easeOut'
    });

    TransitionManager.flash(this, COLORS.WHITE);

    // Unlock crab sticker
    this.stateManager.markMiniGameComplete('crabPhotography', STICKER_KEYS.CRAB);

    // Transition to brewing scene
    this.time.delayedCall(2500, () => {
      TransitionManager.transitionTo(this, SCENES.BREWING, {
        stateManager: this.stateManager,
        audioManager: this.audioManager
      });
    });
  }
}
