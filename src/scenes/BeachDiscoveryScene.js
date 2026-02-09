import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS } from '../utils/Constants.js';
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
    // Sky and ocean gradient
    const bgTop = this.add.rectangle(POSITIONS.CENTER_X, 300, 1920, 600, COLORS.SKY_BLUE);
    const bgBottom = this.add.rectangle(POSITIONS.CENTER_X, 800, 1920, 560, COLORS.OCEAN_BLUE);

    // Sand
    const sand = this.add.rectangle(POSITIONS.CENTER_X, 900, 1920, 360, COLORS.SAND);

    // Simple waves
    const waveGraphics = this.add.graphics();
    waveGraphics.fillStyle(COLORS.WHITE, 0.3);
    for (let i = 0; i < 10; i++) {
      waveGraphics.fillEllipse(i * 200, 600, 150, 30);
    }

    // Animated wave movement
    this.tweens.add({
      targets: waveGraphics,
      x: -200,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });

    // Title
    const title = this.add.text(POSITIONS.CENTER_X, 100, '🐚 Beach Discovery', {
      fontSize: '48px',
      fontFamily: 'Arial',
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
      fontFamily: 'Arial',
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

    // Show message that crab steals it!
    const msg = this.add.text(POSITIONS.CENTER_X, 400,
      '🦀 Oh no! A crab grabbed it!', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#FF6600',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
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

    // Transition to crab photography scene
    this.time.delayedCall(2500, () => {
      TransitionManager.transitionTo(this, SCENES.CRAB_PHOTOGRAPHY, {
        stateManager: this.stateManager,
        audioManager: this.audioManager
      });
    });
  }
}
