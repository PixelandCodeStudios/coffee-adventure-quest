import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS, FONTS } from '../utils/Constants.js';
import Shell from '../game-objects/Shell.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * BeachDiscoveryScene - Mini-game 3: Click shells to find caramel pistachio ingredient
 */
export default class BeachDiscoveryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BEACH_DISCOVERY });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.ingredientFound = false;
  }

  create() {
    TransitionManager.fadeIn(this);

    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.stickerManager = new StickerManager(this, this.stateManager);

    this.createBackground();
    this.createShells();
    this.showInstructions();
  }

  createBackground() {
    // Beautiful beach background image with balloons and confetti!
    const bg = this.add.image(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 'beach-background');
    bg.setDisplaySize(1920, 1080); // Scale to fit screen

    // Title
    const title = this.add.text(POSITIONS.CENTER_X, 100, '🐚 Beach Discovery', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#0066CC',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
  }

  createShells() {
    this.shells = [];

    const positions = [
      { x: 400, y: 700 },
      { x: 700, y: 750 },
      { x: 960, y: 680 },
      { x: 1250, y: 730 },
      { x: 1550, y: 700 }
    ];

    // Randomly pick one shell to have the ingredient
    const luckyIndex = Phaser.Math.Between(0, positions.length - 1);

    positions.forEach((pos, index) => {
      const hasIngredient = index === luckyIndex;
      const shell = new Shell(this, pos.x, pos.y, hasIngredient);
      this.shells.push(shell);

      // Subtle bobbing animation
      this.tweens.add({
        targets: shell,
        y: pos.y - 8,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  showInstructions() {
    const instructions = this.add.text(POSITIONS.CENTER_X, 250,
      'Click the shells to find the caramel pistachio ingredient!', {
      fontSize: '28px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    });
    instructions.setOrigin(0.5);

    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 1000,
      delay: 3500,
      onComplete: () => instructions.destroy()
    });
  }

  onIngredientFound(ingredientObject) {
    if (this.ingredientFound) return;

    this.ingredientFound = true;

    // Sparkle effect on finding
    this.particleManager.sparkleAt(ingredientObject.x, ingredientObject.y, 20);

    // Animate ingredient being stolen
    this.tweens.add({
      targets: ingredientObject,
      x: -200,
      y: 900,
      angle: 360,
      duration: 1500,
      ease: 'Power2'
    });

    // Mark shell sticker unlocked
    this.stateManager.markMiniGameComplete('beachDiscovery', STICKER_KEYS.SHELL);

    // Transition to crab steal cutscene
    this.time.delayedCall(1000, () => {
      TransitionManager.transitionTo(this, SCENES.CUTSCENE, {
        stateManager: this.stateManager,
        audioManager: this.audioManager,
        cutsceneId: 'crabSteal',
        nextScene: SCENES.CRAB_PHOTOGRAPHY
      });
    });
  }
}
